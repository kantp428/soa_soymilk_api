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
import { Loader2, Banknote, CreditCard, QrCode, CheckCircle2 } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, getCartTotal, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'PROMPTPAY' | 'CREDIT_CARD'>('CASH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const total = getCartTotal();

  const handleCheckout = async () => {
    try {
      setIsSubmitting(true);

      const res = await createOrder({
        total_price: total,
        payment_method: paymentMethod,
        order_status: 'COMPLETED',
      });

      const orderId = res.data.data.order_id;

      for (const item of items) {

        const orderItemRes = await createOrderItem({
          order_id: orderId,
          menu_id: parseInt(item.productId),
          quantity: item.quantity,
          price: item.price
        });

        const orderItemId = orderItemRes.data.order_item_id;

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
          <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
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
                <p className="text-5xl font-black text-zinc-900 tracking-tight">฿{total}</p>
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
