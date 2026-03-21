'use client';

import React, { useState } from 'react';
import { CrudTable } from '@/components/admin/CrudTable';
import { Button } from '@/components/ui/button';

export default function AdminMenuPage() {
  const [activeTab, setActiveTab] = useState<'menus' | 'categories' | 'addons'>('menus');

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">การจัดการเมนูและหมวดหมู่</h1>
        <p className="text-zinc-500 mt-1">บริหารจัดการรายการสินค้า หมวดหมู่ และส่วนผสมท็อปปิ้ง</p>
      </div>

      <div className="flex gap-2 border-b border-zinc-200 pb-px">
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 px-6 ${activeTab === 'menus' ? 'border-zinc-900 font-semibold' : 'border-transparent text-zinc-500'}`}
          onClick={() => setActiveTab('menus')}
        >
          Menus
        </Button>
        {/* <Button
          variant="ghost"
          className={`rounded-none border-b-2 px-6 ${activeTab === 'categories' ? 'border-zinc-900 font-semibold' : 'border-transparent text-zinc-500'}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </Button>
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 px-6 ${activeTab === 'addons' ? 'border-zinc-900 font-semibold' : 'border-transparent text-zinc-500'}`}
          onClick={() => setActiveTab('addons')}
        >
          Addons
        </Button> */}
      </div>

      <div className="pt-4">
        {activeTab === 'menus' && (
          <CrudTable
            title="Menus"
            endpoint="/menus"
            primaryKey="menu_id"
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
              { name: 'category_id', label: 'หมวดหมู่ ID', type: 'number', required: true },
              { name: 'price', label: 'ราคา', type: 'number', required: true },
              { name: 'description', label: 'รายละเอียด', type: 'textarea' },
              { name: 'status', label: 'สถานะ', type: 'select', options: [
                { label: 'ใช้งานปกติ (Active)', value: 'Active' },
                { label: 'ปิดการใช้งาน (Inactive)', value: 'Inactive' }
              ] },
            ]}
          />
        )}

        {/* {activeTab === 'categories' && (
          <CrudTable
            title="Categories"
            endpoint="/categories"
            primaryKey="category_id"
            columns={[
              { header: 'ID', accessorKey: 'category_id' },
              { header: 'Category Name', accessorKey: 'category_name' },
              { header: 'Description', accessorKey: 'description' },
            ]}
            formFields={[
              { name: 'category_name', label: 'Category Name', type: 'text', required: true },
              { name: 'description', label: 'Description', type: 'textarea' },
            ]}
          />
        )}

        {activeTab === 'addons' && (
          <CrudTable
            title="Addons"
            endpoint="/addons"
            primaryKey="addon_id"
            dataKey="date"
            useIdInUpdateUrl={true}
            columns={[
              { header: 'ID', accessorKey: 'addon_id' },
              { header: 'Addon Name', accessorKey: 'addon_name' },
              { header: 'Price (฿)', accessorKey: 'price' },
              { header: 'Status', accessorKey: 'status' },
            ]}
            formFields={[
              { name: 'addon_name', label: 'Addon Name', type: 'text', required: true },
              { name: 'price', label: 'Price', type: 'number', required: true },
              { name: 'status', label: 'Status', type: 'select', options: [
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' }
              ] },
            ]}
          />
        )} */}
      </div>
    </div>
  );
}
