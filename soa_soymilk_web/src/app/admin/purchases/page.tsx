'use client';

import React, { useState } from 'react';
import { CrudTable } from '@/components/admin/CrudTable';
import { Button } from '@/components/ui/button';

export default function AdminPurchasesPage() {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'purchases'>('suppliers');

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">ซัพพลายเออร์และจัดซื้อ</h1>
        <p className="text-zinc-500 mt-1">จัดการพาร์ทเนอร์ร้านค้าและบันทึกบิลสั่งซื้อวัตถุดิบ</p>
      </div>

      <div className="flex gap-2 border-b border-zinc-200 pb-px">
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 px-6 ${activeTab === 'suppliers' ? 'border-zinc-900 font-semibold' : 'border-transparent text-zinc-500'}`}
          onClick={() => setActiveTab('suppliers')}
        >
          Suppliers
        </Button>
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 px-6 ${activeTab === 'purchases' ? 'border-zinc-900 font-semibold' : 'border-transparent text-zinc-500'}`}
          onClick={() => setActiveTab('purchases')}
        >
          Purchase Orders
        </Button>
      </div>

      <div className="pt-4">
        {activeTab === 'suppliers' && (
          <CrudTable
            title="Suppliers"
            endpoint="/suppliers"
            primaryKey="supplier_id"
            useIdInUpdateUrl={true}
            columns={[
              { header: 'ID', accessorKey: 'supplier_id' },
              { header: 'Supplier Name', accessorKey: 'supplier_name' },
              { header: 'Phone', accessorKey: 'phone' },
              // { header: 'Status', accessorKey: 'status' },
            ]}
            formFields={[
              { name: 'supplier_name', label: 'Supplier Name', type: 'text', required: true },
              { name: 'phone', label: 'Phone', type: 'text' },
              { name: 'address', label: 'Address', type: 'textarea' },
              // {
              //   name: 'status', label: 'Status', type: 'select', options: [
              //     { label: 'Active', value: 'active' },
              //     { label: 'Inactive', value: 'inactive' }
              //   ]
              // },
            ]}
          />
        )}

        {activeTab === 'purchases' && (
          <CrudTable
            title="Purchase Orders"
            endpoint="/purchases"
            primaryKey="purchase_id"
            hideEdit={true}
            hideDelete={true}
            formFields={[
              { name: 'supplier_id', label: 'Supplier ID', type: 'number', required: true },
              { name: 'total_cost', label: 'Total Invoice Cost', type: 'number', required: true },
            ]}
            columns={[
              { header: 'PO Number', accessorKey: 'purchase_id' },
              { header: 'Supplier Name', accessorKey: 'supplier_name' },
              { header: 'Total Cost (฿)', accessorKey: 'total_cost' },
              { header: 'Purchase Date', accessorKey: 'purchase_date' },
            ]}
          />
        )}
      </div>
    </div>
  );
}
