"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useProducts,
  useCategories,
} from "@/features/products/hooks/useProducts";
import { useCartStore } from "@/features/orders/store/useCartStore";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Loader2,
  Search,
  Home,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { type Addon, type Menu } from "@/features/products/types";
import { AddonModal } from "@/components/pos/AddonModal";
import { CheckoutModal } from "@/components/pos/CheckoutModal";

interface StaffSession {
  staffId: number;
  staffName: string;
  phone: string;
  role?: string;
}

const STAFF_ID_COOKIE = "pos_staff_id";
const STAFF_NAME_COOKIE = "pos_staff_name";
const STAFF_PHONE_COOKIE = "pos_staff_phone";
const STAFF_ROLE_COOKIE = "pos_staff_role";

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return "";

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
};

const clearSessionCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

export default function POSPage() {
  const router = useRouter();
  const { data: productsData, isLoading: isProductsLoading } = useProducts();
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [staffSession, setStaffSession] = useState<StaffSession | null>(null);
  const [isStaffMenuOpen, setIsStaffMenuOpen] = useState(false);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Menu | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    getCartTotal,
    clearCart,
  } = useCartStore();

  useEffect(() => {
    const staffId = getCookieValue(STAFF_ID_COOKIE);
    const staffName = getCookieValue(STAFF_NAME_COOKIE);
    const phone = getCookieValue(STAFF_PHONE_COOKIE);
    const role = getCookieValue(STAFF_ROLE_COOKIE);

    if (!staffId || !staffName || !phone) {
      router.push("/");
      return;
    }

    setStaffSession({
      staffId: Number(staffId),
      staffName,
      phone,
      role: role || undefined,
    });
  }, [router]);

  const handleProductClick = (product: Menu) => {
    setSelectedProduct(product);
    setIsAddonModalOpen(true);
  };

  const handleAddToCart = (
    product: Menu,
    sweetness: number,
    toppings: Addon[],
    quantity: number,
  ) => {
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

  const handleLogout = () => {
    setIsStaffMenuOpen(false);
    clearSessionCookie(STAFF_ID_COOKIE);
    clearSessionCookie(STAFF_NAME_COOKIE);
    clearSessionCookie(STAFF_PHONE_COOKIE);
    clearSessionCookie(STAFF_ROLE_COOKIE);
    clearCart();
    router.push("/");
  };

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategoryId !== "all") {
      filtered = filtered.filter(
        (product) => product.category_id === selectedCategoryId,
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.menu_name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [products, selectedCategoryId, searchQuery]);

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-zinc-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),rgba(244,244,245,0.92)_40%,rgba(228,228,231,0.95)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.04)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white/90 px-8 backdrop-blur shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-medium text-zinc-500 transition-colors hover:text-zinc-950"
          >
            <Home className="h-4 w-4" /> Home
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-2 font-medium text-zinc-500 transition-colors hover:text-zinc-950"
          >
            <LayoutDashboard className="h-4 w-4" /> Admin
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-zinc-900">
            Soy Milk POS
          </div>

          {staffSession ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStaffMenuOpen((current) => !current)}
                className="flex items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white/80 px-3 py-2 text-right shadow-sm transition-colors hover:border-zinc-950"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold leading-tight text-zinc-900">
                    {staffSession.staffName}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] leading-tight text-zinc-500">
                    {staffSession.phone}
                  </p>
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform ${isStaffMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isStaffMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-36 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-950 hover:text-white"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      <div className="z-10 flex flex-1 overflow-hidden">
        <div className="flex h-full flex-1 flex-col px-8 pb-6 pt-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                Counter Workspace
              </p>
              <h1 className="text-4xl font-black tracking-[-0.04em] text-zinc-950">
                Point of Sale
              </h1>
              <p className="mt-2 text-zinc-600">
              
              </p>
            </div>

            <div className="relative hidden w-64 sm:block">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-full border border-zinc-300 bg-white/90 py-2 pl-10 pr-4 shadow-[0_10px_30px_rgba(0,0,0,0.05)] outline-none transition-all focus:ring-2 focus:ring-zinc-950"
              />
            </div>
          </div>

          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Button
              variant={selectedCategoryId === "all" ? "default" : "outline"}
              className={`shrink-0 rounded-full border shadow-sm ${
                selectedCategoryId === "all"
                  ? "border-zinc-950 bg-zinc-950 text-white hover:bg-zinc-800"
                  : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100"
              }`}
              onClick={() => setSelectedCategoryId("all")}
            >
              All Menu
            </Button>

            {isCategoriesLoading ? (
              <div className="flex gap-2">
                <div className="h-10 w-24 animate-pulse rounded-full bg-zinc-200" />
                <div className="h-10 w-24 animate-pulse rounded-full bg-zinc-200" />
              </div>
            ) : (
              categories.map((category) => (
                <Button
                  key={category.category_id}
                  variant={
                    selectedCategoryId === category.category_id
                      ? "default"
                      : "outline"
                  }
                  className={`shrink-0 rounded-full border shadow-sm ${
                    selectedCategoryId === category.category_id
                      ? "border-zinc-950 bg-zinc-950 text-white hover:bg-zinc-800"
                      : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100"
                  }`}
                  onClick={() => setSelectedCategoryId(category.category_id)}
                >
                  {category.category_name}
                </Button>
              ))
            )}
          </div>

          <ScrollArea className="h-full flex-1 -mx-4 px-4">
            {isProductsLoading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-4 text-zinc-400">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Loading menu data...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-zinc-400">
                <p>No menu items found in this filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 pb-20 pt-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.menu_id}
                    className="group flex min-h-[176px] cursor-pointer flex-col overflow-hidden rounded-[28px] border border-zinc-200 bg-white/95 transition-all hover:-translate-y-1 hover:border-zinc-950 hover:shadow-[0_24px_50px_rgba(0,0,0,0.12)]"
                    onClick={() => handleProductClick(product)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base leading-snug text-zinc-950">
                        {product.menu_name}
                      </CardTitle>
                      {product.description ? (
                        <CardDescription className="mt-1 line-clamp-3 text-xs leading-relaxed text-zinc-500">
                          {product.description}
                        </CardDescription>
                      ) : null}
                    </CardHeader>
                    <CardContent className="mt-auto flex items-center justify-between border-t border-zinc-100 bg-zinc-50/80 p-4 pt-3">
                      <span className="text-lg font-bold text-zinc-800">
                        ฿{product.price}
                      </span>
                      <Button
                        size="icon"
                        className="h-9 w-9 rounded-full border border-zinc-800 bg-zinc-950 p-0 shadow-sm"
                      >
                        <Plus className="h-4 w-4 text-white" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="z-10 flex h-full w-[390px] flex-col border-l border-zinc-200 bg-white/96 shadow-[0_0_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex items-center gap-3 border-b border-zinc-200 p-6 text-zinc-900">
            <ShoppingCart className="h-6 w-6" />
            <h2 className="text-xl font-bold tracking-tight">Cart</h2>
          </div>

          <ScrollArea className="flex-1 p-6">
            {items.length === 0 ? (
              <div className="mt-20 flex h-full flex-col items-center justify-center text-zinc-400">
                <ShoppingCart className="mb-6 h-16 w-16 opacity-20" />
                <p className="font-medium">No items in the cart yet</p>
                <p className="text-sm">Add products to continue checkout.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id || `item-${index}`}
                    className="flex flex-col gap-2 rounded-[22px] border border-zinc-200 bg-zinc-50/90 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.05)]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-semibold text-zinc-800">
                        {item.name}
                      </div>
                      <div className="text-lg font-bold">
                        ฿
                        {(item.price +
                          (item.toppings?.reduce(
                            (sum, topping) => sum + topping.price,
                            0,
                          ) || 0)) *
                          item.quantity}
                      </div>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-1">
                      <div className="inline-block rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 shadow-sm">
                        Sweetness {item.sweetness}%
                      </div>
                      {item.toppings?.map((topping, toppingIndex) => (
                        <div
                          key={`${item.id || index}-${topping.addon_id}-${toppingIndex}`}
                          className="inline-block rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 shadow-sm"
                        >
                          + {topping.addon_name}
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white shadow-sm">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none rounded-l-lg text-zinc-500 hover:bg-zinc-100"
                          onClick={() => {
                            if (item.quantity > 1)
                              updateQuantity(item.id, item.quantity - 1);
                            else removeItem(item.id);
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none rounded-r-lg text-zinc-500 hover:bg-zinc-100"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-zinc-500 hover:bg-zinc-900 hover:text-white"
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

          <div className="relative z-20 space-y-4 border-t border-zinc-200 bg-white p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between font-medium text-zinc-600">
              <span>Total</span>
              <span className="text-3xl font-bold text-zinc-900">
                ฿{getCartTotal()}
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-2xl border-zinc-300 bg-white py-6 font-medium"
                onClick={clearCart}
                disabled={items.length === 0}
              >
                Clear Cart
              </Button>
              <Button
                className="flex-[2] rounded-2xl bg-zinc-950 py-6 text-lg font-semibold text-white shadow-[0_16px_30px_rgba(0,0,0,0.16)] hover:bg-zinc-800"
                disabled={items.length === 0}
                onClick={() => setIsCheckoutModalOpen(true)}
              >
                Confirm
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
