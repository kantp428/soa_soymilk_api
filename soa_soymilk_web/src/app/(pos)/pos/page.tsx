'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProducts, useCategories } from '@/features/products/hooks/useProducts';
import { useCartStore } from '@/features/orders/store/useCartStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Plus, Minus, Trash2, Loader2, Search, Home, LayoutDashboard } from 'lucide-react';
import { Menu, Addon } from '@/features/products/types';
import { AddonModal } from '@/components/pos/AddonModal';
import { CheckoutModal } from '@/components/pos/CheckoutModal';

export default function POSPage() {
  const { data: productsData, isLoading: isProductsLoading } = useProducts();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Menu | null>(null);

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const { items, addItem, removeItem, updateQuantity, getCartTotal, clearCart } = useCartStore();

  const handleProductClick = (product: Menu) => {
    setSelectedProduct(product);
    setIsAddonModalOpen(true);
  };

  const handleAddToCart = (product: Menu, sweetness: number, toppings: Addon[], quantity: number) => {
    addItem({
      id: crypto.randomUUID(),
      productId: product.menu_id.toString(),
      name: product.menu_name,
      price: product.price,
      sweetness,
      toppings,
      quantity,
    });
  };

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategoryId !== 'all') {
      filtered = filtered.filter((p) => p.category_id === selectedCategoryId);
    }
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter((p) =>
        p.menu_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [products, selectedCategoryId, searchQuery]);

  return (
    <div className="flex h-screen w-full bg-zinc-50 relative overflow-hidden flex-col">
      {}
      <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0 z-20 shadow-sm">
         <div className="flex items-center gap-6">
            <Link href="/" className="text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-2 font-medium">
               <Home className="w-4 h-4" /> หน้าหลัก
            </Link>
            <Link href="/admin" className="text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-2 font-medium">
               <LayoutDashboard className="w-4 h-4" /> ระบบหลังบ้าน
            </Link>
         </div>
         <div className="font-bold text-lg text-zinc-900 tracking-tight">ร้านน้ำเต้าหู้ ตั้งหวังเจ๊ง</div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {}
        <div className="flex-1 flex flex-col pt-6 pb-6 px-8 h-full">
        {}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">ร้านน้ำเต้าหู้ ตั้งหวังเจ๊ง POS</h1>
            <p className="text-zinc-500">เลือกสินค้าและรายการท็อปปิ้ง</p>
          </div>
          <div className="relative w-64 hidden sm:block">
             <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
             <input
               type="text"
               placeholder="ค้นหาเมนู..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-full focus:ring-2 focus:ring-zinc-900 outline-none transition-all shadow-sm"
             />
          </div>
        </div>

        {}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Button
            variant={selectedCategoryId === 'all' ? 'default' : 'outline'}
            className="rounded-full shadow-sm flex-shrink-0"
            onClick={() => setSelectedCategoryId('all')}
          >
            All Menu
          </Button>
          {isCategoriesLoading ? (
             <div className="flex gap-2">
                <div className="w-24 h-10 bg-zinc-200 animate-pulse rounded-full" />
                <div className="w-24 h-10 bg-zinc-200 animate-pulse rounded-full" />
             </div>
          ) : (
            categories.map((cat) => (
              <Button
                key={cat.category_id}
                variant={selectedCategoryId === cat.category_id ? 'default' : 'outline'}
                className="rounded-full shadow-sm flex-shrink-0"
                onClick={() => setSelectedCategoryId(cat.category_id)}
              >
                {cat.category_name}
              </Button>
            ))
          )}
        </div>

        {}
        <ScrollArea className="flex-1 -mx-4 px-4 h-full">
          {isProductsLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center h-64 text-zinc-400 gap-4">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p>กำลังโหลดข้อมูลเมนู...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center h-64 text-zinc-400">
               <p>ไม่พบเมนูในหมวดหมู่นี้</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
              {filteredProducts.map((product) => (
                <Card
                  key={product.menu_id}
                  className="cursor-pointer hover:border-zinc-300 hover:shadow-md transition-all h-[140px] flex flex-col overflow-hidden bg-white group border-zinc-100"
                  onClick={() => handleProductClick(product)}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg leading-tight line-clamp-2">{product.menu_name}</CardTitle>
                    {product.description && (
                      <CardDescription className="line-clamp-2 mt-1 text-xs">{product.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-0 mt-auto flex justify-between items-center bg-zinc-50/50">
                    <span className="font-bold text-zinc-800 text-lg">฿{product.price}</span>
                    <Button size="icon" className="rounded-full w-8 h-8 p-0 bg-zinc-900 shadow-sm border-2 border-white">
                      <Plus className="h-4 w-4 text-white" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {}
      <div className="w-[380px] bg-white border-l shadow-[0_0_40px_rgba(0,0,0,0.05)] flex flex-col h-full z-10">
        <div className="p-6 text-zinc-900 flex gap-3 items-center border-b">
          <ShoppingCart className="w-6 h-6" />
          <h2 className="text-xl font-bold tracking-tight">รายการสั่งซื้อ (Cart)</h2>
        </div>

        <ScrollArea className="flex-1 p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 mt-20">
              <ShoppingCart className="w-16 h-16 mb-6 opacity-20" />
              <p className="font-medium">ยังไม่มีรายการสินค้า</p>
              <p className="text-sm">เพิ่มสินค้าลงตะกร้าเพื่อดำเนินการต่อ</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id || `item-${index}`} className="flex flex-col gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-zinc-800">{item.name}</div>
                    <div className="font-bold text-lg">฿{(item.price + (item.toppings?.reduce((s, t) => s + t.price, 0) || 0)) * item.quantity}</div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    <div className="text-xs text-zinc-600 font-medium bg-white px-2 py-1 rounded inline-block border shadow-sm">
                      หวาน {item.sweetness}%
                    </div>
                    {item.toppings?.map((t, tIndex) => (
                      <div key={`${item.id || index}-${t.addon_id}-${tIndex}`} className="text-xs text-zinc-600 font-medium bg-zinc-100 px-2 py-1 rounded inline-block border shadow-sm">
                        + {t.addon_name}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 bg-white border rounded-lg shadow-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 rounded-none rounded-l-lg hover:bg-zinc-100"
                        onClick={() => {
                          if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1);
                          else removeItem(item.id);
                        }}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 rounded-none rounded-r-lg hover:bg-zinc-100"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {}
        <div className="p-6 bg-white border-t space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-20 relative">
          <div className="flex justify-between items-center text-zinc-600 font-medium">
            <span>ยอดรวมทั้งสิ้น</span>
            <span className="text-3xl font-bold text-zinc-900">฿{getCartTotal()}</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 py-6 rounded-xl border-zinc-300 font-medium" onClick={clearCart} disabled={items.length === 0}>
              ล้างตะกร้า
            </Button>
            <Button
              className="flex-[2] py-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-lg shadow-lg"
              disabled={items.length === 0}
              onClick={() => setIsCheckoutModalOpen(true)}
            >
              ชำระเงิน
            </Button>
          </div>
          </div>
        </div>
      </div>

      <AddonModal
        isOpen={isAddonModalOpen}
        onClose={() => setIsAddonModalOpen(false)}
        product={selectedProduct}
        onConfirm={handleAddToCart}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
      />
    </div>
  );
}
