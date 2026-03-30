import { PartnerCouponResponse } from '@/features/products/types';
import { apiClient, localApiClient } from '@/lib/axios';



export const activeCoupon = async (couponCode: string) => {
  return apiClient.put('/promotion/coupon/active', { coupon_code: couponCode });
};

export const validateCoupon = async (couponCode: string) => {
  return apiClient.post('/promotion/coupon/validate', { coupon_code: couponCode });
};

export const getCampaignCouponStats = async (campaignId: string | number) => {
  return apiClient.get(`/promotion/campaign/${campaignId}/coupon`);
};

export const createIceCreamCoupon = async () => {
  return apiClient.post('/colab/ice-cream');
};

export const createCoupon = async (campaignId: number | string) => {
  return apiClient.post('/promotion/coupon', { promotion_campain_id: campaignId });
};

export const createPartnerCoupon = async (): Promise<PartnerCouponResponse | null> => {
  try {
    const response = await localApiClient.post<PartnerCouponResponse>('/api/coupons/partner', undefined, {
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    console.warn('Skipping partner coupon generation:', error instanceof Error ? error.message : error);
    return null;
  }
};
