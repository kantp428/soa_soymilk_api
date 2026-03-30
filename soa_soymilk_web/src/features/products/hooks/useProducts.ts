import { useQuery } from '@tanstack/react-query';
import { getProducts, getCategories, getProductsByCategory, getAddons, getMenu, getCategory, getAddon } from '../api';

export const useProducts = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['products', page, limit],
    queryFn: () => getProducts(page, limit),
  });
};

export const useCategories = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['categories', page, limit],
    queryFn: () => getCategories(page, limit),
  });
};

export const useAddons = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['addons', page, limit],
    queryFn: () => getAddons(page, limit),
  });
};

export const useProductsByCategory = (categoryId: string, page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['products', categoryId, page, limit],
    queryFn: () => getProductsByCategory(categoryId, page, limit),
    enabled: !!categoryId,
  });
};

export const useMenu = (id: string | number | null) => {
  return useQuery({
    queryKey: ['menu', id],
    queryFn: () => id ? getMenu(id) : null,
    enabled: !!id,
  });
};

export const useCategory = (id: string | number | null) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => id ? getCategory(id) : null,
    enabled: !!id,
  });
};

export const useAddonDetail = (id: string | number | null) => {
  return useQuery({
    queryKey: ['addon', id],
    queryFn: () => id ? getAddon(id) : null,
    enabled: !!id,
  });
};
