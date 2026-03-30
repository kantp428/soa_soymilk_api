import { apiClient } from '@/lib/axios';
import { Menu, Category, PaginatedResponse, Addon } from '@/features/products/types';

export const getProducts = async (page = 1, limit = 50): Promise<PaginatedResponse<Menu>> => {
  return apiClient.get(`/menus?page=${page}&limit=${limit}`);
};

export const getCategories = async (page = 1, limit = 50): Promise<PaginatedResponse<Category>> => {
  return apiClient.get(`/categories?page=${page}&limit=${limit}`);
};

export const getAddons = async (page = 1, limit = 50): Promise<PaginatedResponse<Addon>> => {
  return apiClient.get(`/addons?page=${page}&limit=${limit}`);
};

export const getProductsByCategory = async (categoryId: string, page = 1, limit = 50): Promise<PaginatedResponse<Menu>> => {
  return apiClient.get(`/menus?category_id=${categoryId}&page=${page}&limit=${limit}`);
};

export const getMenu = async (id: string | number): Promise<Menu> => {
  return apiClient.get(`/menus/${id}`);
};

export const getCategory = async (id: string | number): Promise<Category> => {
  return apiClient.get(`/categories/${id}`);
};

export const getAddon = async (id: string | number): Promise<Addon> => {
  return apiClient.get(`/addons/${id}`);
};

export const updateAddon = async (id: string | number, data: Partial<Addon>): Promise<{ message: string, data: Addon }> => {
  return apiClient.put(`/addons/${id}`, data);
};

export const updateMenu = async (id: string | number, data: Partial<Menu>): Promise<{ message: string, data: Menu }> => {
  return apiClient.put(`/menus/${id}`, data);
};

export const updateCategory = async (id: string | number, data: Partial<Category>): Promise<{ message: string, data: Category }> => {
  return apiClient.put(`/categories/${id}`, data);
};

export const createMenu = async (data: Partial<Menu>): Promise<{ message: string, data: Menu }> => {
  return apiClient.post('/menus', data);
};

export const createCategory = async (data: Partial<Category>): Promise<{ message: string, data: Category }> => {
  return apiClient.post('/categories', data);
};

export const createAddon = async (data: Partial<Addon>): Promise<{ message: string, data: Addon }> => {
  return apiClient.post('/addons', data);
};
