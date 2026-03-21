'use client';

import React from 'react';
import { CrudTable } from '@/components/admin/CrudTable';

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">จัดการข้อมูลลูกค้า</h1>
        <p className="text-zinc-500 mt-1">บริหารจัดการข้อมูลสมาชิก แต้มสะสม และประวัติการติดต่อ</p>
      </div>

      <CrudTable
        title="รายชื่อลูกค้าสมาชิก"
        endpoint="/customers"
        primaryKey="customer_id"
        columns={[
          { header: 'ID', accessorKey: 'customer_id' },
          { header: 'ชื่อลูกค้า', accessorKey: 'customer_name' },
          { header: 'เบอร์โทรศัพท์', accessorKey: 'phone' },
          { header: 'อีเมล', accessorKey: 'email' },
          { 
            header: 'แต้มสะสม', 
            accessorKey: 'points',
            cell: (row) => (
              <span className="font-bold text-primary">
                {(row.points as number || 0).toLocaleString()} แต้ม
              </span>
            )
          },
        ]}
        formFields={[
          { name: 'customer_name', label: 'ชื่อ-นามสกุล', type: 'text', required: true },
          { name: 'phone', label: 'เบอร์โทรศัพท์', type: 'text' },
          { name: 'email', label: 'อีเมล', type: 'text' },
          { name: 'points', label: 'แต้มสะสม', type: 'number' },
        ]}
      />
    </div>
  );
}
