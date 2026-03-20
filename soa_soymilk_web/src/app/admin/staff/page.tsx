'use client';

import React from 'react';
import { CrudTable } from '@/components/admin/CrudTable';

export default function AdminStaffPage() {
  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">การจัดการพนักงาน</h1>
        <p className="text-zinc-500 mt-1">บริหารจัดการบัญชีพนักงาน บทบาท และข้อมูลการติดต่อ</p>
      </div>

      <CrudTable
        title="รายชื่อพนักงาน"
        endpoint="/staff"
        primaryKey="staff_id"
        columns={[
          { header: 'ID', accessorKey: 'staff_id' },
          { header: 'Name', accessorKey: 'staff_name' },
          { header: 'Phone', accessorKey: 'phone' },
          { header: 'Role', accessorKey: 'role' },
          { 
            header: 'Status', 
            accessorKey: 'status',
            cell: (row) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {row.status || 'Active'}
              </span>
            )
          },
        ]}
        formFields={[
          { name: 'staff_name', label: 'Full Name', type: 'text', required: true },
          { name: 'phone', label: 'Phone Number', type: 'text' },
          { name: 'role', label: 'Role', type: 'select', options: [
            { label: 'Admin', value: 'Admin' },
            { label: 'Manager', value: 'Manager' },
            { label: 'Cashier', value: 'Cashier' },
            { label: 'Barista', value: 'Barista' }
          ], required: true },
          { name: 'status', label: 'Status', type: 'select', options: [
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' }
          ] },
        ]}
      />
    </div>
  );
}
