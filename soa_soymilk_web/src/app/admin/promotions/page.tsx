'use client';

import React, { useState } from 'react';
import { CrudTable } from '@/components/admin/CrudTable';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Eye, Loader2 } from 'lucide-react';

export default function AdminPromotionsPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'coupons'>('campaigns');

  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          className={`rounded-none border-b-2 px-6 ${activeTab === 'coupons' ? 'border-zinc-900 font-semibold' : 'border-transparent text-zinc-500'}`}
          onClick={() => setActiveTab('coupons')}
        >
          Coupons
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
              <Button
                variant="outline"
                size="sm"
                className="mr-2 border-zinc-200 text-zinc-600 hover:text-zinc-900 bg-white shadow-sm"
                onClick={() => handleOpenStatsModal(Number(row.promotion_campain_id))}
              >
                <Eye className="w-4 h-4 mr-1.5" /> View Stats
              </Button>
            )}
          />
        )}
      </div>

      {/* Coupon Stats Modal */}
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
    </div>
  );
}

