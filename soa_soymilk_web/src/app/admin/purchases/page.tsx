'use client';

import React, { useState } from 'react';
import { CrudTable } from '@/components/admin/CrudTable';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Plus, Loader2, Info, MapPin, Phone, Building2, Calendar, Box, Database, Edit2, Trash2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSuppliers, useSupplier, usePurchase } from '@/features/admin/hooks/useAdmin';

interface StockRecord {
  stock_id: number;
  stock_name: string;
}

interface PurchaseItemRecord {
  stock_id: number;
  stock_name?: string;
  quantity: number;
  price: number;
}

export default function AdminPurchasesPage() {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'purchases'>('suppliers');
  const queryClient = useQueryClient();

  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null);
  const [viewingSupplierId, setViewingSupplierId] = useState<number | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [newItemForm, setNewItemForm] = useState({ stock_id: '', quantity: '', price: '' });
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ quantity: '', price: '' });

  const { data: stocksData } = useQuery({
    queryKey: ['/stocks/all'],
    queryFn: async () => {
      const res = await apiClient.get('/stocks?limit=1000');
      return (res as { data?: StockRecord[] })?.data || [];
    }
  });
  const stocks: StockRecord[] = Array.isArray(stocksData) ? stocksData : [];

  const { data: suppliersResponse } = useSuppliers(1, 1000);
  const { data: supplierDetail, isLoading: isLoadingSupplierDetail } = useSupplier(viewingSupplierId);

  const suppliersData = (suppliersResponse as any)?.data || [];
  const activeSupplierOptions = (Array.isArray(suppliersData) ? suppliersData : [])
    .filter((s: any) => !s.status || String(s.status).toLowerCase() === 'active')
    .map((s: any) => ({
      label: s.supplier_name,
      value: s.supplier_id
    }));

  const { data: purchaseResponse, isLoading: isItemsLoading, refetch: refetchItems } = usePurchase(selectedPurchaseId);
  const itemsData = (purchaseResponse as any)?.data;

  const addItemMutation = useMutation({
    mutationFn: (itemsArray: Omit<PurchaseItemRecord, 'stock_name'>[]) => apiClient.post(`/purchases/${selectedPurchaseId}/items`, { items: itemsArray }),
    onSuccess: () => {
      refetchItems();
      queryClient.invalidateQueries({ queryKey: ['/purchases'] });
      setNewItemForm({ stock_id: '', quantity: '', price: '' });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } }, message?: string };
      alert(`Error adding item: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
    }
  });

  const handleAddItem = () => {
    if (!newItemForm.stock_id || !newItemForm.quantity || !newItemForm.price) {
      alert('Please fill all fields');
      return;
    }
    addItemMutation.mutate([{
      stock_id: Number(newItemForm.stock_id),
      quantity: Number(newItemForm.quantity),
      price: Number(newItemForm.price)
    }]);
  };

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => apiClient.put(`/purchase-items/${id}`, data),
    onSuccess: () => {
      refetchItems();
      queryClient.invalidateQueries({ queryKey: ['/purchases'] });
      setEditingItemId(null);
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/purchase-items/${id}`),
    onSuccess: () => {
      refetchItems();
      queryClient.invalidateQueries({ queryKey: ['/purchases'] });
    }
  });

  const startEditing = (item: any) => {
    setEditingItemId(item.purchase_item_id);
    setEditForm({ quantity: String(item.quantity), price: String(item.price) });
  };

  const handleUpdateItem = (id: number) => {
    updateItemMutation.mutate({
      id,
      data: {
        quantity: Number(editForm.quantity),
        price: Number(editForm.price)
      }
    });
  };

  const handleDeleteItem = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from this purchase?`)) {
      deleteItemMutation.mutate(id);
    }
  };

  const handleOpenManageModal = (purchaseId: number) => {
    setSelectedPurchaseId(purchaseId);
    setIsManageModalOpen(true);
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
            primaryKey="supplier_id"
            useIdInUpdateUrl={true}
            columns={[
              { header: 'ID', accessorKey: 'supplier_id' },
              { header: 'Supplier Name', accessorKey: 'supplier_name' },
              { header: 'Phone', accessorKey: 'phone' },
              
            ]}
            customActions={(row: any) => (
              <div className="flex gap-2">
                {/* <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-200 text-zinc-600 hover:text-zinc-900 bg-white shadow-sm"
                  onClick={() => setViewingSupplierId(row.supplier_id)}
                >
                  <Info className="w-4 h-4 mr-1.5 text-zinc-400" />
                  รายละเอียด
                </Button> */}
                {/* {row.status !== 'inactive' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-100 text-red-600 hover:bg-red-50 bg-white shadow-sm"
                    onClick={async () => {
                      if (confirm(`คุณต้องการระงับการใช้งานซัพพลายเออร์ "${row.supplier_name}" ใช่หรือไม่?`)) {
                        try {
                          await apiClient.put(`/suppliers/inactive/${row.supplier_id}`, { status: 'inactive' });
                          queryClient.invalidateQueries({ queryKey: ['suppliers'] });
                          queryClient.invalidateQueries({ queryKey: ['/suppliers'] });
                        } catch (error) {
                          alert('เกิดข้อผิดพลาดในการระงับการใช้งาน');
                        }
                      }
                    }}
                  >
                    ระงับการใช้งาน
                  </Button>
                )} */}
              </div>
            )}
            formFields={[
              { name: 'supplier_name', label: 'Supplier Name', type: 'text', required: true },
              { name: 'phone', label: 'Phone', type: 'text' },
              { name: 'address', label: 'Address', type: 'textarea' },
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
              {
                name: 'supplierId',
                label: 'Supplier (Active Only)',
                type: 'select',
                options: activeSupplierOptions.length > 0 ? activeSupplierOptions : [{ label: 'No Active Suppliers', value: '' }],
                required: true
              },
            ]}
            columns={[
              { header: 'PO Number', accessorKey: 'purchase_id' },
              { header: 'Supplier Name', accessorKey: 'supplier_name' },
              { header: 'Total Cost (฿)', accessorKey: 'total_cost' },
              { header: 'Purchase Date', accessorKey: 'purchase_date' },
            ]}
            customActions={(row: Record<string, unknown>) => (
              <Button
                variant="outline"
                size="sm"
                className="mr-2 border-zinc-200 text-zinc-600 hover:text-zinc-900 bg-white shadow-sm"
                onClick={() => handleOpenManageModal(Number(row.purchase_id))}
              >
                <Eye className="w-4 h-4 mr-1.5" /> View / Manage
              </Button>
            )}
          />
        )}
      </div>

      {}
      <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
        <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <DialogHeader className="p-8 pb-0">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center shadow-lg">
                <Box className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-zinc-900">
                  Manage PO 
                  {/* #{selectedPurchaseId} */}
                </DialogTitle>
                <p className="text-xs text-zinc-500 font-medium mt-1">จัดการรายการวัตถุดิบและราคาในใบสั่งซื้อ</p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-8 pt-6 space-y-6">
            {}
            <div className="grid grid-cols-4 gap-3 items-end bg-zinc-50 p-6 rounded-2xl border border-zinc-100 shadow-sm">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight mb-2 block font-sans">Stock Item</label>
                <select
                  className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all"
                  value={newItemForm.stock_id}
                  onChange={(e) => setNewItemForm({ ...newItemForm, stock_id: e.target.value })}
                >
                  <option value="" disabled>Select</option>
                  {stocks.map(stock => (
                    <option key={stock.stock_id} value={stock.stock_id}>
                      {stock.stock_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight mb-2 block font-sans">Quantity</label>
                <Input
                  type="number"
                  className="h-11 rounded-xl shadow-sm font-medium"
                  value={newItemForm.quantity}
                  onChange={(e) => setNewItemForm({ ...newItemForm, quantity: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight mb-2 block font-sans">Price (฿)</label>
                <Input
                  type="number"
                  className="h-11 rounded-xl shadow-sm font-medium"
                  value={newItemForm.price}
                  onChange={(e) => setNewItemForm({ ...newItemForm, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <Button
                onClick={handleAddItem}
                disabled={addItemMutation.isPending}
                className="bg-zinc-900 text-white hover:bg-zinc-800 h-11 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95"
              >
                {addItemMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1.5" />}
                Add
              </Button>
            </div>

            {}
            <div className="border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="max-h-[30vh] overflow-auto">
                <Table>
                  <TableHeader className="bg-zinc-50/80 backdrop-blur-sm sticky top-0 z-10">
                    <TableRow className="border-zinc-100 hover:bg-transparent">
                      <TableHead className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Material</TableHead>
                      <TableHead className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight text-right">Qty</TableHead>
                      <TableHead className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight text-right">Unit Price</TableHead>
                      <TableHead className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight text-right">Subtotal</TableHead>
                      <TableHead className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isItemsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-zinc-500">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-zinc-300" />
                        </TableCell>
                      </TableRow>
                    ) : (itemsData?.items ?? []).length > 0 ? (
                      (itemsData?.items || []).map((item: any, idx: number) => {
                        const displayName = item.stock_name
                          || stocks.find(s => s.stock_id === item.stock_id)?.stock_name
                          || 'Unknown Stock';

                        const isEditing = editingItemId === item.purchase_item_id;

                        return (
                          <TableRow key={idx} className="border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                            <TableCell className="font-bold text-zinc-800">{displayName}</TableCell>
                            <TableCell className="text-right font-medium text-zinc-600">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  className="h-8 w-20 ml-auto text-right text-xs rounded-lg"
                                  value={editForm.quantity}
                                  onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                                />
                              ) : item.quantity}
                            </TableCell>
                            <TableCell className="text-right font-medium text-zinc-600">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  className="h-8 w-24 ml-auto text-right text-xs rounded-lg"
                                  value={editForm.price}
                                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                />
                              ) : `฿${item.price}`}
                            </TableCell>
                            <TableCell className="text-right font-black text-zinc-900">
                              ฿{(Number(isEditing ? editForm.quantity : item.quantity) * Number(isEditing ? editForm.price : item.price)).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {isEditing ? (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-7 h-7 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                      onClick={() => handleUpdateItem(item.purchase_item_id)}
                                      disabled={updateItemMutation.isPending}
                                    >
                                      {updateItemMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                                      onClick={() => setEditingItemId(null)}
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                                      onClick={() => startEditing(item)}
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-7 h-7 rounded-lg text-zinc-300 hover:text-red-600 hover:bg-red-50"
                                      onClick={() => handleDeleteItem(item.purchase_item_id, displayName)}
                                      disabled={deleteItemMutation.isPending}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-zinc-400 font-medium italic">
                          No items in this purchase yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-2xl border border-zinc-100 border-dashed">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Total Value</span>
              </div>
              <div className="text-xl font-black text-zinc-900 tracking-tight">
                ฿{(itemsData?.items || []).reduce((acc: number, curr: any) => acc + (curr.quantity * curr.price), 0).toLocaleString()}
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-11 rounded-xl border-zinc-200 hover:bg-zinc-50 text-zinc-600 font-bold text-xs"
              onClick={() => setIsManageModalOpen(false)}
            >
              Close Portal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {}
      <Dialog open={viewingSupplierId !== null} onOpenChange={(open) => !open && setViewingSupplierId(null)}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl bg-white rounded-3xl">
          <DialogHeader className="p-8 pb-0">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-zinc-900">
                  {isLoadingSupplierDetail ? 'กำลังโหลด...' : (supplierDetail as any)?.data?.supplier_name}
                </DialogTitle>
                <p className="text-xs text-zinc-500 font-medium mt-1">รายละเอียดซัพพลายเออร์ (คู่ค้า)</p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-8 pt-6 space-y-6">
            {isLoadingSupplierDetail ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-zinc-200">
                    <Phone className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">เบอร์โทรศัพท์</p>
                    <p className="text-sm font-bold text-zinc-800">{(supplierDetail as any)?.data?.phone || '-'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-zinc-200">
                      <MapPin className="w-4 h-4 text-zinc-400" />
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">ที่อยู่ / ข้อมูลติดต่อ</p>
                  </div>
                  <p className="text-sm text-zinc-600 leading-relaxed pl-11">{(supplierDetail as any)?.data?.address || 'ไม่มีข้อมูลที่อยู่'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-zinc-200">
                    <Info className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">ID ระบบ</p>
                    <p className="text-sm font-bold text-zinc-800"># {(supplierDetail as any)?.data?.supplier_id}</p>
                  </div>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full h-11 rounded-xl border-zinc-200 hover:bg-zinc-50 text-zinc-600 font-bold text-xs"
              onClick={() => setViewingSupplierId(null)}
            >
              ปิดหน้าต่าง
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
