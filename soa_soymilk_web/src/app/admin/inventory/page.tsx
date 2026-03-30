'use client';

import React, { useState } from 'react';
import { CrudTable } from '@/components/admin/CrudTable';
import { useStock } from '@/features/admin/hooks/useAdmin';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info, Box, Loader2, Calendar, Database } from 'lucide-react';

export default function AdminInventoryPage() {
  const [viewingStockId, setViewingStockId] = useState<number | null>(null);
  const { data: stockDetail, isLoading: isLoadingStockDetail } = useStock(viewingStockId);

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">การจัดการสต็อกสินค้า</h1>
        <p className="text-zinc-500 mt-1">ตรวจสอบความเคลื่อนไหว ควบคุมปริมาณวัตถุดิบและสินค้าคงคลัง</p>
      </div>

      <CrudTable
        title="สต็อกสินค้าปัจจุบัน"
        endpoint="/stocks"
        primaryKey="stock_id"
        useIdInUpdateUrl={true}
        hideDelete={true}
        columns={[
          { header: 'ID', accessorKey: 'stock_id' },
          { header: 'Item Name', accessorKey: 'stock_name' },
          { header: 'Quantity', accessorKey: 'quantity' },
          { header: 'Unit', accessorKey: 'unit' },
        ]}
        // customActions={(row: any) => (
        //   <Button
        //     variant="outline"
        //     size="sm"
        //     className="mr-2 border-zinc-200 text-zinc-600 hover:text-zinc-900 bg-white shadow-sm"
        //     onClick={() => setViewingStockId(row.stock_id)}
        //   >
        //     <Info className="w-4 h-4 mr-1.5 text-zinc-400" />
        //     รายละเอียด
        //   </Button>
        // )}
        formFields={[
          { name: 'stock_name', label: 'Material/Item Name', type: 'text', required: true },
          { name: 'quantity', label: 'Quantity Available', type: 'number', required: true },
          {
            name: 'unit', label: 'Unit (e.g., kg, liters, cups)', type: 'select', options: [
              { label: 'Kilograms (kg)', value: 'kg' },
              { label: 'Grams (g)', value: 'g' },
              { label: 'Liters (L)', value: 'L' },
              { label: 'Milliliters (ml)', value: 'ml' },
              { label: 'Pieces (pcs)', value: 'pcs' },
              { label: 'Boxes', value: 'boxes' },
            ], required: true
          },
        ]}
      />

      {}
      <Dialog open={viewingStockId !== null} onOpenChange={(open) => !open && setViewingStockId(null)}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl bg-white rounded-3xl">
          <DialogHeader className="p-8 pb-0">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center shadow-lg">
                <Box className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-zinc-900">
                  {isLoadingStockDetail ? 'กำลังโหลด...' : (stockDetail as any)?.data?.stock_name}
                </DialogTitle>
                <p className="text-xs text-zinc-500 font-medium mt-1">รายละเอียดทรัพยากรคงคลัง</p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-8 pt-6 space-y-6">
            {isLoadingStockDetail ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-zinc-200">
                      <Database className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">จำนวนคงเหลือ</p>
                      <p className="text-lg font-black text-zinc-900">
                        {(stockDetail as any)?.data?.quantity} <span className="text-sm font-medium text-zinc-500">{(stockDetail as any)?.data?.unit}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-zinc-200">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">อัปเดตล่าสุด</p>
                    <p className="text-sm font-bold text-zinc-800">
                      {(stockDetail as any)?.data?.updated_at ? new Date((stockDetail as any)?.data?.updated_at).toLocaleString('th-TH') : '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button 
                variant="outline" 
                className="w-full h-11 rounded-xl border-zinc-200 hover:bg-zinc-50 text-zinc-600 font-bold text-xs"
                onClick={() => setViewingStockId(null)}
              >
                ปิดหน้าต่าง
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
