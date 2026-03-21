'use client';

import React, { useState } from 'react';
import { CrudTable } from '@/components/admin/CrudTable';
import { Button } from '@/components/ui/button';

export default function AdminMenuPage() {
  const [activeTab, setActiveTab] = useState<'drinks' | 'snacks'>('drinks');

  const isDrinks = activeTab === 'drinks';
  const currentTitle = isDrinks ? 'เครื่องดื่ม' : 'ขนม';
  const currentEndpoint = isDrinks ? '/menus?category_id=1' : '/menus?category_id=2';

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">การจัดการเมนูและหมวดหมู่</h1>
        <p className="text-zinc-500 mt-1">บริหารจัดการรายการสินค้า หมวดหมู่ และส่วนผสมท็อปปิ้ง</p>
      </div>

      <div className="flex gap-2 border-b border-zinc-200 pb-px">
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 px-6 ${isDrinks ? 'border-zinc-900 font-semibold' : 'border-transparent text-zinc-500'}`}
          onClick={() => setActiveTab('drinks')}
        >
          เครื่องดื่ม
        </Button>
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 px-6 ${!isDrinks ? 'border-zinc-900 font-semibold' : 'border-transparent text-zinc-500'}`}
          onClick={() => setActiveTab('snacks')}
        >
          ขนม
        </Button>
      </div>

      <div className="pt-4">
        <CrudTable
          title={currentTitle}
          endpoint={currentEndpoint}
          primaryKey="menu_id"
          useIdInUpdateUrl={true}
          columns={[
            {
              header: 'รูปภาพ',
              accessorKey: 'image_url',
              cell: (row) => (
                <div className="w-12 h-12 rounded-lg overflow-hidden border bg-zinc-50">
                  {row.image_url ? (
                    <img src={row.image_url as string} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">No Image</div>
                  )}
                </div>
              )
            },
            { header: 'ID', accessorKey: 'menu_id' },
            { header: 'ชื่อเมนู', accessorKey: 'menu_name' },
            { header: 'ราคา (฿)', accessorKey: 'price' },
            {
              header: 'สถานะ',
              accessorKey: 'status',
              cell: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'Active' || row.status === 'Available' ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-800'}`}>
                  {row.status as string}
                </span>
              )
            },
          ]}
          formFields={[
            { name: 'image_url', label: 'รูปภาพสินค้า', type: 'image' },
            { name: 'menu_name', label: 'ชื่อเมนู', type: 'text', required: true },
            { name: 'category_id', label: 'หมวดหมู่ ID (1=น้ำ, 2=ขนม)', type: 'number', required: true },
            { name: 'price', label: 'ราคา', type: 'number', required: true },
            { name: 'description', label: 'รายละเอียด', type: 'textarea' },
            {
              name: 'status', label: 'สถานะ', type: 'select', options: [
                { label: 'ใช้งานปกติ (Active)', value: 'Active' },
                { label: 'ปิดการใช้งาน (Inactive)', value: 'Inactive' }
              ]
            },
          ]}
        />
      </div>
    </div>
  );
}
