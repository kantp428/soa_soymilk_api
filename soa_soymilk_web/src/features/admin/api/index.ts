import { apiClient } from '@/lib/axios';

export const getStaffs = async (page = 1, limit = 50, search = ''): Promise<any> => {
  return apiClient.get(`/staff?page=${page}&limit=${limit}&search=${search}`);
};

export const getStaff = async (id: string | number) => {
  return apiClient.get(`/staff/${id}`);
};

export const createStaff = async (data: any) => {
  return apiClient.post('/staff', data);
};

export const updateStaff = async (id: string | number, data: unknown) => {
  return apiClient.put(`/staff/${id}`, data);
};

export const getStocks = async (page = 1, limit = 50, status = 'ACTIVE'): Promise<any> => {
  return apiClient.get(`/stocks?page=${page}&limit=${limit}&status=${status}`);
};

export const getStock = async (id: string | number) => {
  return apiClient.get(`/stocks/${id}`);
};

export const updateStock = async (id: string | number, data: unknown) => {
  return apiClient.put(`/stocks/${id}`, data);
};

export const createStock = async (data: any) => {
  return apiClient.post('/stocks', data);
};

export const deleteStock = async (id: string | number) => {
  return apiClient.delete(`/stocks/${id}`);
};

export const getSuppliers = async (page = 1, limit = 50, search = ''): Promise<any> => {
  return apiClient.get(`/suppliers?page=${page}&limit=${limit}&search=${search}`);
};

export const getSupplier = async (id: string | number) => {
  return apiClient.get(`/suppliers/${id}`);
};

export const updateSupplier = async (id: string | number, data: unknown) => {
  return apiClient.put(`/suppliers/${id}`, data);
};

export const createSupplier = async (data: any) => {
  return apiClient.post('/suppliers', data);
};

export const deleteSupplier = async (id: string | number) => {
  return apiClient.delete(`/suppliers/${id}`);
};

export const inactiveSupplier = async (id: string | number) => {
  return apiClient.put(`/suppliers/inactive/${id}`, { status: 'inactive' });
};

export const getPurchases = async (page = 1, limit = 50, search = ''): Promise<any> => {
  return apiClient.get(`/purchases?page=${page}&limit=${limit}&search=${search}`);
};

export const createPurchase = async (data: any) => {
  return apiClient.post('/purchases', data);
};

export const getPurchase = async (id: string | number) => {
  return apiClient.get(`/purchases/${id}`);
};

export const updatePurchaseItem = async (id: string | number, data: any) => {
  return apiClient.put(`/purchase-items/${id}`, data);
};

export const deletePurchaseItem = async (id: string | number) => {
  return apiClient.delete(`/purchase-items/${id}`);
};

export const getPurchaseItems = async (purchaseId: string | number) => {
  return apiClient.get(`/purchases/${purchaseId}/items`);
};

export const addPurchaseItems = async (purchaseId: string | number, items: unknown[]) => {
  return apiClient.post(`/purchases/${purchaseId}/items`, { items });
};
