import { apiClient } from '@/lib/axios';

export interface CreateOrderPayload {
  customer_id?: number | null;
  total_price: number;
  payment_method: string;
  order_status: string;
  coupon_id?: number | null;
  staff_id?: number | null;
}

export interface CreateOrderItemPayload {
  order_id: number;
  menu_id: number;
  quantity: number;
  price: number;
}

export interface CreateOrderItemAddonPayload {
  order_item_id: number;
  addon_id: number;
  price: number;
}

export const createOrder = async (payload: CreateOrderPayload) => {
  return apiClient.post<{ data: { order_id: number } }>('/orders', payload);
};

export const createOrderItem = async (payload: CreateOrderItemPayload) => {
  return apiClient.post<{ order_item_id: number }>('/order-items', payload);
};

export const createOrderItemAddon = async (payload: CreateOrderItemAddonPayload) => {
  return apiClient.post('/order-item-addons', payload);
};

export const getOrder = async (id: string | number) => {
  return apiClient.get(`/orders/${id}`);
};

export const getOrderItems = async (page = 1, limit = 50) => {
  return apiClient.get(`/order-items?page=${page}&limit=${limit}`);
};

export const getOrderItem = async (id: string | number) => {
  return apiClient.get(`/order-items/${id}`);
};

export const getOrderItemAddons = async (page = 1, limit = 50) => {
  return apiClient.get(`/order-item-addons?page=${page}&limit=${limit}`);
};

export const getOrderItemAddon = async (id: string | number) => {
  return apiClient.get(`/order-item-addons/${id}`);
};
