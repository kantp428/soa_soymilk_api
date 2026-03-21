'use client';

import React from 'react';
import { CrudTable } from '@/components/admin/CrudTable';

export default function AdminInventoryPage() {
  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">การจัดการสต็อกสินค้า</h1>
        <p className="text-zinc-500 mt-1">ตรวจสอบความเคลื่อนไหว ควบคุมปริมาณวัตถุดิบและสินค้าคงคลัง</p>
      </div>

      <CrudTable
        title="สต็อกสินค้าปัจจุบัน"
        endpoint="/stocks"
        primaryKey="stockId"
        useIdInUpdateUrl={true}
        columns={[
          { header: 'ID', accessorKey: 'stockId' },
          { header: 'Item Name', accessorKey: 'stockName' },
          { header: 'Quantity', accessorKey: 'quantity' },
          { header: 'Unit', accessorKey: 'unit' },
        ]}
        formFields={[
          { name: 'stockName', label: 'Material/Item Name', type: 'text', required: true },
          { name: 'quantity', label: 'Quantity Available', type: 'number', required: true },
          { name: 'unit', label: 'Unit (e.g., kg, liters, cups)', type: 'select', options: [
            { label: 'Kilograms (kg)', value: 'kg' },
            { label: 'Grams (g)', value: 'g' },
            { label: 'Liters (L)', value: 'L' },
            { label: 'Milliliters (ml)', value: 'ml' },
            { label: 'Pieces (pcs)', value: 'pcs' },
            { label: 'Boxes', value: 'boxes' },
          ], required: true },
        ]}
      />
    </div>
  );
}
