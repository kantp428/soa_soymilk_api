import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Addon } from "@/features/products/types";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  sweetness: number;
  toppings: Addon[];
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) =>
              i.productId === item.productId &&
              i.sweetness === item.sweetness &&
              JSON.stringify(i.toppings || []) ===
                JSON.stringify(item.toppings || []),
          );

          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += item.quantity;
            return { items: newItems };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                toppings: item.toppings || [],
                id: crypto.randomUUID(),
              },
            ],
          };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const toppingTotal =
            item.toppings?.reduce((sum, topping) => sum + topping.price, 0) ||
            0;
          return total + (item.price + toppingTotal) * item.quantity;
        }, 0);
      },
    }),
    {
      name: "cart-storage",
    },
  ),
);
