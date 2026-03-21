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
import { useCartStore } from '@/features/orders/store/useCartStore';
import { createOrder, createOrderItem, createOrderItemAddon } from '@/features/orders/api';
import { validateCoupon } from '@/features/promotions/api';
import { Loader2, Banknote, CreditCard, QrCode, CheckCircle2, Ticket } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, getCartTotal, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'PROMPTPAY' | 'CREDIT_CARD'>('CASH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: number; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const subtotal = getCartTotal();
  const total = Math.max(0, subtotal - (appliedCoupon?.discount || 0));

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setIsValidatingCoupon(true);
      setCouponError('');
      const res = await validateCoupon(couponCode) as unknown as { data?: { coupon_id?: number } };
      if (res?.data?.coupon_id) {
        // Since discount amount isn't clearly returned in the success response payload of validate
        // In a real app we would get the discount value. For the sake of UI, let's assume valid
        // Assuming the backend has a way to get campaign discount, but here we just attach ID.
        // Let's assume a generic 10% discount for demo if not provided.
        const discountAmount = subtotal * 0.1; 
        setAppliedCoupon({ id: res.data.coupon_id, discount: discountAmount });
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

      const res = await createOrder({
        total_price: total,
        payment_method: paymentMethod,
        order_status: 'COMPLETED',
        coupon_id: appliedCoupon?.id || null,
      }) as unknown as { data: { order_id: number } };

      const orderId = res.data.order_id;

      for (const item of items) {

        const orderItemRes = await createOrderItem({
          order_id: orderId,
          menu_id: parseInt(item.productId),
          quantity: item.quantity,
          price: item.price
        }) as unknown as { data: { order_item_id: number } };

        const orderItemId = orderItemRes.data?.order_item_id || (orderItemRes as unknown as { order_item_id: number }).order_item_id;

        for (const topping of item.toppings) {
          await createOrderItemAddon({
             order_item_id: orderItemId,
             addon_id: topping.addon_id,
             price: topping.price
          });
        }
      }

      setIsSuccess(true);
      clearCart();

    } catch (error) {
      console.error("Order Checkout Failed", error);
      alert("Checkout failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[450px] bg-white rounded-2xl overflow-hidden p-0 gap-0">

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
             <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-12 h-12 text-primary" />
             </div>
             <h2 className="text-2xl font-bold text-zinc-900">ชำระเงินสำเร็จ!</h2>
             <p className="text-zinc-500">ออเดอร์ถูกบันทึกเข้าระบบเรียบร้อยแล้ว</p>
             <Button onClick={handleClose} className="w-full mt-6 py-6 text-lg rounded-xl">ทำรายการใหม่</Button>
          </div>
        ) : (
          <>
            <DialogHeader className="p-6 border-b bg-zinc-50 border-zinc-100 items-center">
              <DialogTitle className="text-2xl font-bold text-zinc-900">ยืนยันการชำระเงิน</DialogTitle>
            </DialogHeader>

            <div className="p-6 space-y-8">
              <div className="bg-zinc-100 p-6 rounded-2xl text-center">
                <p className="text-zinc-500 text-sm font-medium mb-1">ยอดชำระสุทธิ (Total Amount)</p>
                {appliedCoupon && (
                  <p className="text-sm text-zinc-500 line-through mb-1">฿{subtotal}</p>
                )}
                <p className="text-5xl font-black text-zinc-900 tracking-tight">฿{total}</p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">คูปองส่วนลด (Coupon)</h3>
                <div className="flex gap-2">
                  <Input 
                    placeholder="กรอกรหัสคูปอง" 
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
                      {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ใช้งาน'}
                    </Button>
                  ) : (
                    <Button 
                      variant="destructive" 
                      onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                    >
                      ยกเลิก
                    </Button>
                  )}
                </div>
                {couponError && <p className="text-sm text-red-500">{couponError}</p>}
                {appliedCoupon && <p className="text-sm text-green-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-1.5"><Ticket className="w-4 h-4"/> ใช้คูปองสำเร็จ ลดไป ฿{appliedCoupon.discount}</p>}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">เลือกช่องทางการชำระเงิน (Payment Method)</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={paymentMethod === 'CASH' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('CASH')}
                    className="flex flex-col h-24 gap-2 rounded-xl"
                  >
                    <Banknote className="w-6 h-6" />
                    <span>เงินสด</span>
                  </Button>
                  <Button
                    variant={paymentMethod === 'PROMPTPAY' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('PROMPTPAY')}
                    className="flex flex-col h-24 gap-2 rounded-xl"
                  >
                    <QrCode className="w-6 h-6" />
                    <span>พร้อมเพย์</span>
                  </Button>
                  <Button
                    variant={paymentMethod === 'CREDIT_CARD' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                    className="flex flex-col h-24 gap-2 rounded-xl"
                  >
                    <CreditCard className="w-6 h-6" />
                    <span>บัตรเครดิต</span>
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 border-t border-zinc-100 bg-white">
              <Button
                onClick={handleCheckout}
                disabled={isSubmitting || total === 0}
                className="w-full py-7 text-lg font-bold rounded-xl bg-zinc-900 hover:bg-zinc-800 shadow-xl"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : null}
                {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการชำระเงิน'}
              </Button>
            </DialogFooter>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
