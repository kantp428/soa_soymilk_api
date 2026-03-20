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
            primaryKey="supplierId"
            columns={[
              { header: 'ID', accessorKey: 'supplierId' },
              { header: 'Supplier Name', accessorKey: 'supplierName' },
              { header: 'Phone', accessorKey: 'phone' },
              { header: 'Status', accessorKey: 'status' },
            ]}
            formFields={[
              { name: 'supplierName', label: 'Supplier Name', type: 'text', required: true },
              { name: 'phone', label: 'Phone', type: 'text' },
              { name: 'address', label: 'Address', type: 'textarea' },
              { name: 'status', label: 'Status', type: 'select', options: [
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' }
              ] },
            ]}
          />
        )}

        {activeTab === 'purchases' && (
          <CrudTable
            title="Purchase Orders"
            endpoint="/purchases"
            primaryKey="purchaseId"
            columns={[
              { header: 'PO Number', accessorKey: 'purchaseId' },
              { header: 'Supplier ID', accessorKey: 'supplierId' },
              { header: 'Total Cost (฿)', accessorKey: 'totalCost' },
              { header: 'Order Date', accessorKey: 'createAt' },
            ]}
            formFields={[
              { name: 'supplierId', label: 'Supplier ID', type: 'number', required: true },
              { name: 'totalCost', label: 'Total Invoice Cost', type: 'number', required: true },
            ]}
          />
        )}
      </div>
    </div>
  );
}
