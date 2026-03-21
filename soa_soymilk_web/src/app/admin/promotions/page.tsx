'use client';

import React, { useState } from 'react';
import { CrudTable } from '@/components/admin/CrudTable';
import { Button } from '@/components/ui/button';

export default function AdminPromotionsPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'coupons'>('campaigns');

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
              { name: 'expireDate', label: 'Expiry Date (YYYY-MM-DD)', type: 'text', required: true },
            ]}
          />
        )}

        {/* {activeTab === 'coupons' && (
          <CrudTable
            title="Discount Coupons"
            endpoint="/coupons"
            primaryKey="couponId"
            columns={[
              { header: 'ID', accessorKey: 'couponId' },
              { header: 'Coupon Code', accessorKey: 'couponCode' },
              { header: 'Campaign ID', accessorKey: 'promotionCampainId' },
              { header: 'Status', accessorKey: 'status' },
            ]}
            formFields={[
              { name: 'couponCode', label: 'Coupon Code', type: 'text', required: true },
              { name: 'promotionCampainId', label: 'Linked Campaign ID', type: 'number', required: true },
              { name: 'status', label: 'Status', type: 'select', options: [
                { label: 'ACTIVE', value: 'ACTIVE' },
                { label: 'USED', value: 'USED' },
                { label: 'EXPIRED', value: 'EXPIRED' }
              ] },
            ]}
          />
        )} */}
      </div>
    </div>
  );
}
