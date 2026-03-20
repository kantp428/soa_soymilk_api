import { apiClient } from '@/lib/axios';
import { Menu, Category, PaginatedResponse, PaginatedAddonResponse } from '@/features/products/types';

export const getProducts = async (page = 1, limit = 50): Promise<PaginatedResponse<Menu>> => {
  return apiClient.get(`/menus?page=${page}&limit=${limit}`);
};

export const getCategories = async (page = 1, limit = 50): Promise<PaginatedResponse<Category>> => {
  return apiClient.get(`/categories?page=${page}&limit=${limit}`);
};

export const getAddons = async (page = 1, limit = 50): Promise<PaginatedAddonResponse> => {
  return apiClient.get(`/addons?page=${page}&limit=${limit}`);
};

export const getProductsByCategory = async (categoryId: string, page = 1, limit = 50): Promise<PaginatedResponse<Menu>> => {
  return apiClient.get(`/menus?category_id=${categoryId}&page=${page}&limit=${limit}`);
};
