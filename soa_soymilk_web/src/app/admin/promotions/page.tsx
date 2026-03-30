'use client';

import React, { useState } from 'react';
import { CrudTable } from '@/components/admin/CrudTable';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Eye, Loader2, IceCream, Ticket } from 'lucide-react';
import { createIceCreamCoupon, createCoupon } from '@/features/promotions/api';
import { toast } from 'sonner';

export default function AdminPromotionsPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'coupons' | 'icecream'>('campaigns');

  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState<string | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/promotion/campaign/coupon', selectedCampaignId],
    queryFn: async () => {
      if (!selectedCampaignId) return null;
      const res = await apiClient.get(`/promotion/campaign/${selectedCampaignId}/coupon`);
      return (res)?.data || res;
    },
    enabled: !!selectedCampaignId && isModalOpen
  });

  const handleOpenStatsModal = (id: number) => {
    setSelectedCampaignId(id);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">โปรโมชั่นและส่วนลด</h1>
        <p className="text-zinc-500 mt-1">สร้างแคมเปญการตลาด โปรโมชั่น และโค้ดส่วนลดสำหรับลูกค้า</p>
      </div>

      <div className="flex gap-2 border-b border-zinc-200 pb-px">
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 px-6 ${activeTab === 'campaigns' ? 'border-zinc-900 font-semibold' : 'border-transparent text-zinc-500'}`}
          onClick={() => setActiveTab('campaigns')}
        >
          Promotion Campaigns
        </Button>
        {/* <Button
          variant="ghost"
          className={`rounded-none border-b-2 px-6 ${activeTab === 'icecream' ? 'border-zinc-900 font-semibold' : 'border-transparent text-zinc-500'}`}
          onClick={() => setActiveTab('icecream')}
        >
          Ice Cream Colab
        </Button> */}
      </div>

      <div className="pt-4">
        {activeTab === 'campaigns' && (
          <CrudTable
            title="Promotion Campaigns"
            endpoint="/promotion/campaign"
            primaryKey="promotion_campain_id"
            hideDelete={true}
            hideEdit={true}
            columns={[
              { header: 'ID', accessorKey: 'promotion_campain_id' },
              { header: 'Campaign Name', accessorKey: 'name' },
              { header: 'Discount (%)', accessorKey: 'discount' },
              { header: 'Expiry Date', accessorKey: 'expire_date' },
            ]}
            formFields={[
              { name: 'name', label: 'Campaign Name', type: 'text', required: true },
              { name: 'discount', label: 'Discount Amount', type: 'number', required: true },
              { name: 'expire_date', label: 'Expiry Date (YYYY-MM-DD)', type: 'text', required: true },
            ]}
            customActions={(row: Record<string, unknown>) => (
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-200 text-zinc-600 hover:text-zinc-900 bg-white shadow-sm"
                  onClick={() => handleOpenStatsModal(Number(row.promotion_campain_id))}
                >
                  <Eye className="w-4 h-4 mr-1.5" /> View Stats
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-200 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 bg-white shadow-sm"
                  onClick={async () => {
                    const loadingToast = toast.loading('กำลังสร้างคูปอง...');
                    try {
                      const res = await createCoupon(Number(row.promotion_campain_id));
                      toast.dismiss(loadingToast);
                      const code = res?.data?.coupon_code;
                      if (code) {
                        setNewCouponCode(code);
                        setIsCouponModalOpen(true);
                      } else {
                        toast.success('สร้างคูปองสำเร็จ');
                      }
                    } catch (err: any) {
                      toast.dismiss(loadingToast);
                      if (err.response?.status === 409) {
                        toast.error('คูปองนี้ถูกสร้างใช้งานไปแล้วในระบบ');
                      } else {
                        toast.error('ไม่สามารถสร้างคูปองได้ โปรดลองอีกครั้ง');
                      }
                    }
                  }}
                >
                  <Ticket className="w-4 h-4 mr-1.5" /> Create Coupon
                </Button>
              </div>
            )}
          />
        )}

        {/* {activeTab === 'icecream' && (
          <div className="max-w-2xl mx-auto py-12">
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-8 text-center border-b border-zinc-100 bg-zinc-50/50">
                <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <IceCream className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900">Ice Cream Collaboration</h2>
                <p className="text-zinc-500 mt-2">
                  Generate special collaboration coupons for our Ice Cream partners.
                  Each click generates a unique code for campaign ID #1.
                </p>
              </div>
              <div className="p-8 flex flex-col items-center">
                <Button 
                  size="lg" 
                  className="bg-zinc-900 text-white hover:bg-zinc-800 px-8 py-6 rounded-xl h-auto text-lg font-semibold transition-all hover:scale-105 active:scale-95"
                  onClick={async () => {
                    const promise = createIceCreamCoupon();
                    toast.promise(promise, {
                      loading: 'Generating coupon...',
                      success: (res: any) => {
                        const code = res?.data?.coupon_code || 'Generated Successfully';
                        return (
                          <div className="flex flex-col gap-1">
                            <span className="font-bold">Coupon Created!</span>
                            <span className="text-pink-600 font-mono text-sm underline decoration-pink-200">{code}</span>
                          </div>
                        );
                      },
                      error: 'Failed to generate coupon. Please check API connection.'
                    });
                  }}
                >
                  <Ticket className="w-5 h-5 mr-2" />
                  Generate Ice Cream Coupon
                </Button>
                
                <div className="mt-8 flex items-center gap-3 text-xs text-zinc-400 font-medium">
                  <div className="w-8 h-px bg-zinc-100" />
                  <span>CAMPAIGN ID #1</span>
                  <div className="w-8 h-px bg-zinc-100" />
                </div>
              </div>
            </div>
          </div>
        )} */}
      </div>

      {}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Coupon Statistics</DialogTitle>
          </DialogHeader>

          <div className="py-6">
            {isStatsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
              </div>
            ) : statsData ? (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                  <p className="text-sm text-zinc-500 font-medium mb-1">Total</p>
                  <p className="text-2xl font-bold text-zinc-900">{statsData.total_coupons || 0}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <p className="text-sm text-emerald-600 font-medium mb-1">Used</p>
                  <p className="text-2xl font-bold text-emerald-700">{statsData.used_coupons || 0}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <p className="text-sm text-orange-600 font-medium mb-1">Unused</p>
                  <p className="text-2xl font-bold text-orange-700">{statsData.unused_coupons || 0}</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-zinc-500">Failed to load statistics.</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCouponModalOpen} onOpenChange={setIsCouponModalOpen}>
        <DialogContent className="sm:max-w-sm bg-transparent border-none shadow-none p-0 overflow-visible" aria-describedby={undefined}>
          <DialogTitle className="sr-only">สร้างคูปองเรียบร้อย</DialogTitle>
          <div className="relative bg-white rounded-3xl p-8 text-center shadow-2xl overflow-hidden pointer-events-auto">
            
            <div className="absolute top-1/2 left-0 w-8 h-8 bg-zinc-900/10 rounded-full shadow-inner -translate-x-4 -translate-y-1/2 opacity-50" />
            <div className="absolute top-1/2 right-0 w-8 h-8 bg-zinc-900/10 rounded-full shadow-inner translate-x-4 -translate-y-1/2 opacity-50" />
            
            <div className="absolute top-1/2 left-6 right-6 border-t-2 border-dashed border-zinc-200 -translate-y-1/2" />

            <div className="pb-8">
              <div className="w-16 h-16 bg-emerald-100/80 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Ticket className="w-8 h-8 transform rotate-[-15deg]" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight">คูปองพร้อมใช้งาน!</h2>
              <p className="text-zinc-500 mt-2 text-sm font-medium">แคมเปญสร้างโค้ดส่วนลดสำเร็จแล้ว</p>
            </div>

            <div className="pt-8 relative z-10">
              <div className="bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-xl p-4 mb-6 relative overflow-hidden group hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors">
                <p className="font-mono text-2xl leading-tight font-bold tracking-wider text-emerald-600 break-all">
                  {newCouponCode}
                </p>
              </div>
              <Button 
                className="w-full h-12 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                onClick={() => {
                  navigator.clipboard.writeText(newCouponCode || '');
                  toast.success('คัดลอกรหัสคูปองเรียบร้อยแล้ว');
                  setIsCouponModalOpen(false);
                }}
              >
                คัดลอกโค้ด & ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

