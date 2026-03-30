'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore, type CartItem } from '@/features/orders/store/useCartStore';
import { createOrder, createOrderItem, createOrderItemAddon } from '@/features/orders/api';
import { validateCoupon, activeCoupon, createPartnerCoupon } from '@/features/promotions/api';
import { type PartnerCouponResponse } from '@/features/products/types';
import { Loader2, Banknote, CreditCard, QrCode, CheckCircle2, Ticket } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReceiptData {
  orderId: number;
  paidAt: string;
  paymentMethod: 'CASH' | 'PROMPTPAY' | 'CREDIT_CARD';
  staffName: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  partnerCoupon: PartnerCouponResponse | null;
}

const STAFF_ID_COOKIE = 'pos_staff_id';
const STAFF_NAME_COOKIE = 'pos_staff_name';

const getCookieValue = (name: string) => {
  if (typeof document === 'undefined') return '';

  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : '';
};

const currencyFormatter = new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const dashedLine = '--------------------------------';

const formatCurrency = (value: number) => `THB ${currencyFormatter.format(value)}`;

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return dateFormatter.format(date);
};

const getItemLineTotal = (item: CartItem) => {
  const toppingTotal = item.toppings.reduce((sum, topping) => sum + topping.price, 0);
  return (item.price + toppingTotal) * item.quantity;
};

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, getCartTotal, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'PROMPTPAY' | 'CREDIT_CARD'>('CASH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: number; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const subtotal = getCartTotal();
  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      setIsValidatingCoupon(true);
      setCouponError('');

      const res = await validateCoupon(couponCode) as unknown as { data?: { coupon_id?: number } };
      if (res?.data?.coupon_id) {
        setAppliedCoupon({ id: res.data.coupon_id, discount: subtotal * 0.1 });
      } else {
        setCouponError('Invalid coupon');
      }
    } catch (err: unknown) {
      setCouponError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Invalid or expired coupon');
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setIsSubmitting(true);
      const staffId = Number(getCookieValue(STAFF_ID_COOKIE));
      const staffName = getCookieValue(STAFF_NAME_COOKIE);
      const itemsSnapshot = items.map((item) => ({
        ...item,
        toppings: item.toppings.map((topping) => ({ ...topping })),
      }));

      const res = await createOrder({
        total_price: total,
        payment_method: paymentMethod,
        order_status: 'COMPLETED',
        coupon_id: appliedCoupon?.id || null,
        staff_id: Number.isFinite(staffId) && staffId > 0 ? staffId : null,
      }) as unknown as { data: { order_id: number } };

      const orderId = res.data.order_id;

      for (const item of itemsSnapshot) {
        const orderItemRes = await createOrderItem({
          order_id: orderId,
          menu_id: parseInt(item.productId, 10),
          quantity: item.quantity,
          price: item.price,
        }) as unknown as { data: { order_item_id: number } };

        const orderItemId = orderItemRes.data?.order_item_id || (orderItemRes as unknown as { order_item_id: number }).order_item_id;

        for (const topping of item.toppings) {
          await createOrderItemAddon({
            order_item_id: orderItemId,
            addon_id: topping.addon_id,
            price: topping.price,
          });
        }
      }

      if (appliedCoupon && couponCode) {
        try {
          await activeCoupon(couponCode);
        } catch (activateError) {
          console.error('Failed to activate coupon:', activateError);
        }
      }

      let partnerCoupon: PartnerCouponResponse | null = null;
      if (total >= 100) {
        try {
          partnerCoupon = await createPartnerCoupon();
        } catch (partnerCouponError) {
          console.error('Failed to generate partner coupon:', partnerCouponError);
        }
      }

      setReceiptData({
        orderId,
        paidAt: new Date().toISOString(),
        paymentMethod,
        staffName,
        items: itemsSnapshot,
        subtotal,
        discount,
        total,
        partnerCoupon,
      });
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      console.error('Order checkout failed', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setReceiptData(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[460px] overflow-hidden border-none bg-zinc-100 p-0 shadow-2xl">
        {isSuccess && receiptData ? (
          <div className="max-h-[85vh] overflow-y-auto p-4 sm:p-5">
            <div className="mx-auto w-full max-w-[360px] rounded-[28px] bg-zinc-200 p-3 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
              <div className="rounded-[22px] border border-zinc-300 bg-white px-5 py-5 font-mono text-[12px] leading-5 text-zinc-900 shadow-inner">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <p className="text-[15px] font-bold tracking-[0.25em]">SOY MILK POS</p>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Payment Receipt</p>
                </div>

                <div className="my-3 text-[10px] text-zinc-500">
                  <div className="flex justify-between">
                    <span>Receipt No.</span>
                    <span>#{receiptData.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid At</span>
                    <span>{formatDateTime(receiptData.paidAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Method</span>
                    <span>{receiptData.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Staff</span>
                    <span>{receiptData.staffName || '-'}</span>
                  </div>
                </div>

                <p className="overflow-hidden whitespace-nowrap text-zinc-400">{dashedLine}</p>

                <div className="py-3">
                  {receiptData.items.map((item) => (
                    <div key={item.id} className="mb-2 last:mb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold uppercase tracking-[0.08em]">{item.name}</p>
                          <p className="text-[10px] text-zinc-500">Qty {item.quantity} x {formatCurrency(item.price)}</p>
                        </div>
                        <p className="shrink-0 font-semibold">{formatCurrency(getItemLineTotal(item))}</p>
                      </div>
                      <p className="text-[10px] text-zinc-500">Sweetness {item.sweetness}%</p>
                      {item.toppings.map((topping) => (
                        <div key={`${item.id}-${topping.addon_id}`} className="flex justify-between text-[10px] text-zinc-500">
                          <span>+ {topping.addon_name}</span>
                          <span>{formatCurrency(topping.price)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <p className="overflow-hidden whitespace-nowrap text-zinc-400">{dashedLine}</p>

                <div className="space-y-1 py-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Subtotal</span>
                    <span>{formatCurrency(receiptData.subtotal)}</span>
                  </div>
                  {receiptData.discount > 0 ? (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Discount</span>
                      <span>-{formatCurrency(receiptData.discount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-[15px] font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(receiptData.total)}</span>
                  </div>
                </div>

                {receiptData.partnerCoupon ? (
                  <>
                    <p className="overflow-hidden whitespace-nowrap text-zinc-400">{dashedLine}</p>
                    <div className="py-3">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Promotion Name</p>
                      <p className="mt-2 text-sm font-bold uppercase">{receiptData.partnerCoupon.promotionName}</p>
                      <div className="mt-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3">
                        <p className="text-[10px] text-zinc-500">Coupon Code</p>
                        <p className="mt-1 text-lg font-bold tracking-[0.22em]">{receiptData.partnerCoupon.code}</p>
                        <div className="mt-2 flex justify-between text-[10px] text-zinc-500">
                          <span>Discount</span>
                          <span>{receiptData.partnerCoupon.discountValue}%</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-500">
                          <span>Expire Date</span>
                          <span>{formatDateTime(receiptData.partnerCoupon.expireDate)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}

                <p className="overflow-hidden whitespace-nowrap text-zinc-400">{dashedLine}</p>
                <div className="pt-3 text-center text-[10px] text-zinc-500">
                  <p>Thank you for shopping with us</p>
                  <p className="mt-1 tracking-[0.4em]">|||| ||| ||||| || ||||</p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <>
            <DialogHeader className="border-b border-zinc-200 bg-white p-6 text-center">
              <DialogTitle className="text-2xl font-bold text-zinc-900">Confirm Payment</DialogTitle>
            </DialogHeader>

            <div className="space-y-8 bg-white p-6">
              <div className="rounded-3xl bg-zinc-100 p-6 text-center">
                <p className="mb-1 text-sm font-medium text-zinc-500">Total Amount</p>
                {appliedCoupon ? (
                  <p className="mb-1 text-sm text-zinc-500 line-through">{formatCurrency(subtotal)}</p>
                ) : null}
                <p className="text-5xl font-black tracking-tight text-zinc-900">{formatCurrency(total)}</p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Coupon</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon || isValidatingCoupon}
                  />
                  {!appliedCoupon ? (
                    <Button
                      variant="secondary"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || isValidatingCoupon}
                    >
                      {isValidatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode('');
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                {couponError ? <p className="text-sm text-red-500">{couponError}</p> : null}
                {appliedCoupon ? (
                  <p className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-green-600">
                    <Ticket className="h-4 w-4" />
                    Coupon applied: -{formatCurrency(appliedCoupon.discount)}
                  </p>
                ) : null}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Payment Method</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={paymentMethod === 'CASH' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('CASH')}
                    className="flex h-24 flex-col gap-2 rounded-xl"
                  >
                    <Banknote className="h-6 w-6" />
                    <span>Cash</span>
                  </Button>
                  <Button
                    variant={paymentMethod === 'PROMPTPAY' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('PROMPTPAY')}
                    className="flex h-24 flex-col gap-2 rounded-xl"
                  >
                    <QrCode className="h-6 w-6" />
                    <span>PromptPay</span>
                  </Button>
                  <Button
                    variant={paymentMethod === 'CREDIT_CARD' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                    className="flex h-24 flex-col gap-2 rounded-xl"
                  >
                    <CreditCard className="h-6 w-6" />
                    <span>Card</span>
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-zinc-200 bg-white p-6">
              <Button
                onClick={handleCheckout}
                disabled={isSubmitting || total === 0}
                className="w-full rounded-xl bg-zinc-900 py-7 text-lg font-bold shadow-xl hover:bg-zinc-800"
              >
                {isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : null}
                {isSubmitting ? 'Processing...' : 'Confirm Payment'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
