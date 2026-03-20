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
        <Button
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
        </Button>
      </div>

      <div className="pt-4">
        {activeTab === 'menus' && (
          <CrudTable
            title="Menus"
            endpoint="/menus"
            primaryKey="menu_id"
            columns={[
              { header: 'ID', accessorKey: 'menu_id' },
              { header: 'Name', accessorKey: 'menu_name' },
              { header: 'Category ID', accessorKey: 'category_id' },
              { header: 'Price (฿)', accessorKey: 'price' },
              {
                header: 'Status',
                accessorKey: 'status',
                cell: (row) => (
                  <td className="p-4 align-middle">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'Active' || row.status === 'Available' ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-800'}`}>
                      {row.status as string}
                    </span>
                  </td>
                )
              },
            ]}
            formFields={[
              { name: 'menu_name', label: 'Menu Name', type: 'text', required: true },
              { name: 'category_id', label: 'Category ID', type: 'number', required: true },
              { name: 'price', label: 'Price', type: 'number', required: true },
              { name: 'description', label: 'Description', type: 'textarea' },
              { name: 'status', label: 'Status', type: 'select', options: [
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' }
              ] },
            ]}
          />
        )}

        {activeTab === 'categories' && (
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
        )}
      </div>
    </div>
  );
}
