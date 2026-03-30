'use client';

import React from 'react';
import { CrudTable } from '@/components/admin/CrudTable';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { useStaff } from '@/features/admin/hooks/useAdmin';
import { UserCircle, Loader2, Phone, Shield, Calendar, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function AdminStaffPage() {
  const [selectedStaffId, setSelectedStaffId] = React.useState<number | null>(null);

  const { data: staffResponse, isLoading: isLoadingDetail } = useStaff(selectedStaffId);
  const staffDetail = (staffResponse as any)?.data;
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
        useIdInUpdateUrl={true}
        columns={[
          { header: 'ID', accessorKey: 'staff_id' },
          { header: 'Name', accessorKey: 'staff_name' },
          { header: 'Phone', accessorKey: 'phone' },
          { header: 'Role', accessorKey: 'role' },
          {
            header: 'Status',
            accessorKey: 'status',
            cell: (row) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-800'}`}>
                {row.status as string}
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
        customActions={(row) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedStaffId(row.staff_id as number)}
            className="text-zinc-500 hover:text-primary transition-colors"
          >
            <UserCircle className="w-4 h-4" />
          </Button>
        )}
      />

      <Dialog open={!!selectedStaffId} onOpenChange={(open) => !open && setSelectedStaffId(null)}>
        <DialogContent className="max-w-md bg-white border-zinc-200 shadow-2xl rounded-3xl overflow-hidden p-0">
          <div className="bg-zinc-900 h-24 w-full relative">
            <div className="absolute -bottom-10 left-6">
              <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg border border-zinc-100">
                <div className="w-full h-full rounded-xl bg-zinc-100 flex items-center justify-center">
                  <UserCircle className="w-12 h-12 text-zinc-400" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 pt-14 pb-6 space-y-6">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-2xl font-black text-zinc-900">
                {isLoadingDetail ? '...' : staffDetail?.staff_name}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                  {staffDetail?.role || 'Staff'}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${staffDetail?.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {staffDetail?.status}
                </span>
              </div>
            </DialogHeader>

            {isLoadingDetail ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                <p className="text-zinc-500 text-xs font-medium">กำลังโหลดข้อมูลโปรไฟล์...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 group hover:border-primary/20 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-zinc-200">
                    <Phone className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-tight">เบอร์โทรศัพท์</p>
                    <p className="text-sm font-bold text-zinc-900">{staffDetail?.phone || 'ไม่ระบุ'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-zinc-200">
                    <Shield className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-tight">ระดับการเข้าถึง</p>
                    <p className="text-sm font-bold text-zinc-900">{staffDetail?.role || 'Staff'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-2xl border border-dashed border-zinc-200 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase">วันที่เข้างาน</span>
                    </div>
                    <p className="text-xs font-bold text-zinc-600">
                      {staffDetail?.created_at ? new Date(staffDetail.created_at).toLocaleDateString('th-TH') : '-'}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl border border-dashed border-zinc-200 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase">อัปเดตล่าสุด</span>
                    </div>
                    <p className="text-xs font-bold text-zinc-600">
                      {staffDetail?.updated_at ? new Date(staffDetail.updated_at).toLocaleDateString('th-TH') : '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              variant="outline" 
              className="w-full h-12 rounded-xl border-zinc-200 hover:bg-zinc-50 text-zinc-600 font-bold text-xs"
              onClick={() => setSelectedStaffId(null)}
            >
              ปิดหน้าต่างนี้
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
