import { apiClient } from '@/lib/axios';

export const activeCoupon = async (couponCode: string) => {
  return apiClient.put('/promotion/coupon/active', { coupon_code: couponCode });
};

export const validateCoupon = async (couponCode: string) => {
  return apiClient.post('/promotion/coupon/validate', { coupon_code: couponCode });
};

export const getCampaignCouponStats = async (campaignId: string | number) => {
  return apiClient.get(`/promotion/campaign/${campaignId}/coupon`);
};
