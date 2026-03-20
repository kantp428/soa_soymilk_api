import { useQuery } from '@tanstack/react-query';
import { getProducts, getCategories, getProductsByCategory, getAddons } from '../api';

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
