import { useQuery } from '@tanstack/react-query';
import { getOrderItemAddons, getOrderItemAddon } from '../api';

export const useOrderItemAddons = (page = 1, limit = 1000) => {
  return useQuery({
    queryKey: ['order-item-addons', page, limit],
    queryFn: () => getOrderItemAddons(page, limit),
  });
};

export const useOrderItemAddon = (id: string | number | null) => {
  return useQuery({
    queryKey: ['order-item-addon', id],
    queryFn: () => id ? getOrderItemAddon(id) : null,
    enabled: !!id,
  });
};
