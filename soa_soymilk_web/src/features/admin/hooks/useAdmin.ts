import { useQuery } from '@tanstack/react-query';
import { getSuppliers, getSupplier, getStaffs, getStaff, getStocks, getStock, getPurchases, getPurchase } from '../api';

export const useSuppliers = (page = 1, limit = 50, search = '') => {
  return useQuery({
    queryKey: ['suppliers', page, limit, search],
    queryFn: () => getSuppliers(page, limit, search),
  });
};

export const useSupplier = (id: number | null) => {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => getSupplier(id!),
    enabled: !!id,
  });
};

export const useStaffs = (page = 1, limit = 50, search = '') => {
  return useQuery({
    queryKey: ['staffs', page, limit, search],
    queryFn: () => getStaffs(page, limit, search),
  });
};

export const useStaff = (id: number | null) => {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: () => getStaff(id!),
    enabled: !!id,
  });
};

export const useStocks = (page = 1, limit = 50, status = 'ACTIVE') => {
  return useQuery({
    queryKey: ['stocks', page, limit, status],
    queryFn: () => getStocks(page, limit, status),
  });
};

export const useStock = (id: number | null) => {
  return useQuery({
    queryKey: ['stock', id],
    queryFn: () => getStock(id!),
    enabled: !!id,
  });
};

export const usePurchases = (page = 1, limit = 50, search = '') => {
  return useQuery({
    queryKey: ['purchases', page, limit, search],
    queryFn: () => getPurchases(page, limit, search),
  });
};

export const usePurchase = (id: number | null) => {
  return useQuery({
    queryKey: ['purchase', id],
    queryFn: () => getPurchase(id!),
    enabled: !!id,
  });
};
