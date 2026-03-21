import { apiClient } from '@/lib/axios';

// --- Staff APIs ---
export const getStaff = async (id: string | number) => {
  return apiClient.get(`/staff/${id}`);
};

export const updateStaff = async (id: string | number, data: unknown) => {
  return apiClient.put(`/staff/${id}`, data);
};

// --- Stocks APIs ---
export const getStock = async (id: string | number) => {
  return apiClient.get(`/stocks/${id}`);
};

export const updateStock = async (id: string | number, data: unknown) => {
  return apiClient.put(`/stocks/${id}`, data);
};

// --- Suppliers APIs ---
export const getSupplier = async (id: string | number) => {
  return apiClient.get(`/suppliers/${id}`);
};

export const updateSupplier = async (id: string | number, data: unknown) => {
  return apiClient.put(`/suppliers/${id}`, data);
};

export const deleteSupplier = async (id: string | number) => {
  return apiClient.delete(`/suppliers/${id}`);
};

export const inactiveSupplier = async (id: string | number) => {
  return apiClient.put(`/suppliers/inactive/${id}`, { status: 'inactive' });
};

// --- Purchases APIs ---
export const getPurchase = async (id: string | number) => {
  return apiClient.get(`/purchases/${id}`);
};

export const getPurchaseItems = async (purchaseId: string | number) => {
  return apiClient.get(`/purchases/${purchaseId}/items`);
};

export const addPurchaseItems = async (purchaseId: string | number, items: unknown[]) => {
  return apiClient.post(`/purchases/${purchaseId}/items`, { items });
};

export const updatePurchaseItem = async (itemId: string | number, data: unknown) => {
  return apiClient.put(`/purchase-items/${itemId}`, data);
};
