'use client';

import React, { useState } from 'react';
import { CrudTable } from '@/components/admin/CrudTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPurchaseItems, addPurchaseItems } from '@/features/admin/api';
import { Loader2, Plus, PackageOpen } from 'lucide-react';

export default function AdminPurchasesPage() {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'purchases'>('suppliers');
  const queryClient = useQueryClient();

  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ item_name: '', quantity: '', unit_price: '', total_price: '' });

  const { data: purchaseItemsData, isLoading: isLoadingItems } = useQuery({
    queryKey: ['/purchases', selectedPurchaseId, 'items'],
    queryFn: () => getPurchaseItems(selectedPurchaseId!),
    enabled: !!selectedPurchaseId,
  });

  const purchaseItems = (purchaseItemsData as { data?: Record<string, unknown>[] })?.data || [];

  const addItemMutation = useMutation({
    mutationFn: (items: unknown[]) => addPurchaseItems(selectedPurchaseId!, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/purchases', selectedPurchaseId, 'items'] });
      setNewItem({ item_name: '', quantity: '', unit_price: '', total_price: '' });
    }
  });

  const handleOpenPurchaseItems = (purchaseId: number) => {
    setSelectedPurchaseId(purchaseId);
    setIsPurchaseModalOpen(true);
  };

  const handleAddItem = () => {
    if (!newItem.item_name || !newItem.quantity || !newItem.unit_price) return;
    addItemMutation.mutate([{
       item_name: newItem.item_name,
       quantity: Number(newItem.quantity),
       unit_price: Number(newItem.unit_price),
       total_price: Number(newItem.quantity) * Number(newItem.unit_price) // auto calc if needed
    }]);
  };

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
            useIdInUpdateUrl={true}
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

            formFields={[
              { name: 'supplierId', label: 'Supplier ID', type: 'number', required: true },
              { name: 'totalCost', label: 'Total Invoice Cost', type: 'number', required: true },
            ]}
            columns={[
              { header: 'PO Number', accessorKey: 'purchaseId' },
              { header: 'Supplier ID', accessorKey: 'supplierId' },
              { header: 'Total Cost (฿)', accessorKey: 'totalCost' },
              { header: 'Order Date', accessorKey: 'createAt' },
              {
                header: 'Items',
                accessorKey: 'purchaseId',
                cell: (row: Record<string, unknown>) => (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1 text-xs h-7"
                    onClick={() => handleOpenPurchaseItems(row.purchaseId as number)}
                  >
                    <PackageOpen className="w-3 h-3" /> ดูรายการ (Items)
                  </Button>
                )
              }
            ]}
          />
        )}
      </div>

      <Dialog open={isPurchaseModalOpen} onOpenChange={(open) => {
        setIsPurchaseModalOpen(open);
        if(!open) setSelectedPurchaseId(null);
      }}>
        <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>รายการสินค้าในใบสั่งซื้อ PO-{selectedPurchaseId}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-4">
            {isLoadingItems ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>
            ) : purchaseItems.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 bg-zinc-50 rounded-xl border border-dashed">
                ยังไม่มีรายการสินค้าในใบคำสั่งซื้อนี้
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 bg-zinc-50 uppercase border-b">
                    <tr>
                      <th className="px-4 py-3">ชื่อสินค้า/วัตถุดิบ</th>
                      <th className="px-4 py-3 text-right">จำนวน</th>
                      <th className="px-4 py-3 text-right">ราคา/หน่วย</th>
                      <th className="px-4 py-3 text-right">รวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseItems.map((item: Record<string, unknown>, i: number) => (
                      <tr key={i} className="border-b last:border-0 bg-white">
                        <td className="px-4 py-3 font-medium">{String(item.item_name)}</td>
                        <td className="px-4 py-3 text-right">{String(item.quantity)}</td>
                        <td className="px-4 py-3 text-right">฿{String(item.unit_price)}</td>
                        <td className="px-4 py-3 text-right font-bold">฿{String(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="bg-zinc-50 p-4 rounded-xl border space-y-3 mt-6">
              <h4 className="font-semibold text-sm">เพิ่มรายการสินค้าใหม่</h4>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12 sm:col-span-5 border-0">
                  <label className="text-xs text-zinc-500 mb-1 block">ชื่อรายการ</label>
                  <Input 
                    value={newItem.item_name} 
                    onChange={e => setNewItem({...newItem, item_name: e.target.value})} 
                    placeholder="เช่น เมล็ดถั่วเหลือง"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <label className="text-xs text-zinc-500 mb-1 block">จำนวน</label>
                  <Input 
                    type="number"
                    value={newItem.quantity} 
                    onChange={e => setNewItem({...newItem, quantity: e.target.value})} 
                    placeholder="0"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <label className="text-xs text-zinc-500 mb-1 block">ราคา/หน่วย</label>
                  <Input 
                    type="number"
                    value={newItem.unit_price} 
                    onChange={e => setNewItem({...newItem, unit_price: e.target.value})} 
                    placeholder="0"
                  />
                </div>
                <div className="col-span-4 sm:col-span-3 flex items-end">
                  <Button 
                    className="w-full" 
                    onClick={handleAddItem}
                    disabled={addItemMutation.isPending || !newItem.item_name || !newItem.quantity || !newItem.unit_price}
                  >
                    {addItemMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} เพิ่ม
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsPurchaseModalOpen(false)}>ปิดหน้าต่าง</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
