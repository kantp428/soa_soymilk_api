
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Menu, Addon } from '@/features/products/types';
import { useAddons } from '@/features/products/hooks/useProducts';
import { Loader2, Plus, Minus, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddonModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Menu | null;
  onConfirm: (product: Menu, sweetness: number, toppings: Addon[], quantity: number) => void;
}

export function AddonModal({ isOpen, onClose, product, onConfirm }: AddonModalProps) {
  const { data: addonsData, isLoading } = useAddons();
  const [sweetness, setSweetness] = useState(100);
  const [selectedToppings, setSelectedToppings] = useState<Addon[]>([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setSweetness(100);
      setSelectedToppings([]);
      setQuantity(1);
    }
  }, [isOpen]);

  if (!product) return null;

  const addons = addonsData?.data || [];

  const availableAddons = addons.filter((addon) => {
    const normalizedStatus = addon.status?.trim().toUpperCase();
    return !normalizedStatus || normalizedStatus === 'ACTIVE' || normalizedStatus === 'AVAILABLE';
  });

  const toggleTopping = (addon: Addon) => {
    setSelectedToppings(prev =>
      prev.some(t => t.addon_id === addon.addon_id)
        ? prev.filter(t => t.addon_id !== addon.addon_id)
        : [...prev, addon]
    );
  };

  const calculateTotal = () => {
    const toppingsTotal = selectedToppings.reduce((sum, topping) => sum + topping.price, 0);
    return (product.price + toppingsTotal) * quantity;
  };

  const handleConfirm = () => {
    onConfirm(product, sweetness, selectedToppings, quantity);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white gap-0">
        <DialogHeader className="p-6 pb-4 border-b bg-zinc-50 border-zinc-100">
          <DialogTitle className="text-2xl font-bold text-zinc-900">{product.menu_name}</DialogTitle>
          <p className="text-zinc-500 font-medium">฿{product.price}</p>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-8">
            {}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-900">ระดับความหวาน (Sweetness)</h3>
              <div className="flex flex-wrap gap-3">
                {[0, 25, 50, 75, 100, 125].map((level) => (
                  <Button
                    key={level}
                    variant={sweetness === level ? 'default' : 'outline'}
                    onClick={() => setSweetness(level)}
                    className="flex-1 min-w-[30%] py-6 font-medium rounded-xl shadow-sm"
                  >
                    {level}%
                  </Button>
                ))}
              </div>
            </div>

            {}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-900 flex justify-between items-end">
                <span>เลือกท็อปปิ้ง (Toppings)</span>
                <span className="text-sm font-normal text-zinc-500">เลือกได้หลายรายการ</span>
              </h3>

              {isLoading ? (
                <div className="flex items-center justify-center p-8 text-zinc-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableAddons.length === 0 ? (
                    <div className="col-span-2 p-4 text-center text-zinc-500 bg-zinc-50 rounded-lg border border-dashed">
                      ไม่มีท็อปปิ้งให้เลือก
                    </div>
                  ) : (
                    availableAddons.map((addon) => {
                      const isSelected = selectedToppings.some(t => t.addon_id === addon.addon_id);
                      return (
                        <div
                          key={addon.addon_id}
                          onClick={() => toggleTopping(addon)}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-zinc-900 bg-zinc-50'
                              : 'border-zinc-100 hover:border-zinc-300'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-zinc-900">{addon.addon_name}</span>
                            <span className="text-sm text-zinc-500">+฿{addon.price}</span>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300'
                          }`}>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900">จำนวน (Quantity)</h3>
                <div className="flex items-center gap-4 bg-zinc-50 p-2 rounded-2xl w-fit border border-zinc-200 shadow-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl bg-white shadow-sm border border-zinc-200 hover:bg-zinc-100"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <span className="w-12 text-center text-2xl font-bold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl bg-white shadow-sm border border-zinc-200 hover:bg-zinc-100"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 border-t border-zinc-100 bg-white">
          <Button
            className="w-full py-7 text-lg font-bold rounded-xl bg-zinc-900 hover:bg-zinc-800 shadow-xl"
            onClick={handleConfirm}
          >
            เพิ่มลงตะกร้า - ฿{calculateTotal()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
