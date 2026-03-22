'use client';

import React, { useState } from 'react';
import { CrudTable } from '@/components/admin/CrudTable';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

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

  // Manage Items Modal State
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [newItemForm, setNewItemForm] = useState({ stock_id: '', quantity: '', price: '' });

  // Fetch Stocks for the dropdown
  const { data: stocksData } = useQuery({
    queryKey: ['/stocks/all'],
    queryFn: async () => {
      const res = await apiClient.get('/stocks?limit=1000');
      return (res as { data?: StockRecord[] })?.data || [];
    }
  });
  const stocks: StockRecord[] = Array.isArray(stocksData) ? stocksData : [];

  // Fetch Suppliers for the dropdown
  const { data: suppliersData } = useQuery({
    queryKey: ['/suppliers/all'],
    queryFn: async () => {
      const res = await apiClient.get('/suppliers?limit=1000');
      return (res as { data?: any[] })?.data || [];
    }
  });

  const activeSupplierOptions = (Array.isArray(suppliersData) ? suppliersData : [])
    .filter((s: any) => !s.status || String(s.status).toLowerCase() === 'active')
    .map((s: any) => ({
      label: s.supplier_name,
      value: s.supplier_id
    }));

  const { data: itemsData, isLoading: isItemsLoading, refetch: refetchItems } = useQuery({
    queryKey: ['/purchases', selectedPurchaseId, 'items'],
    queryFn: async () => {
      if (!selectedPurchaseId) return null;
      const res = await apiClient.get(`/purchases/${selectedPurchaseId}/items`);
      const payload = res as { items?: PurchaseItemRecord[]; data?: { items: PurchaseItemRecord[] } };
      return payload?.items ? payload : payload?.data;
    },
    enabled: !!selectedPurchaseId && isManageModalOpen
  });

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

      {/* Manage Items Modal */}
      <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Manage Purchase Items (PO #{selectedPurchaseId})</DialogTitle>
          </DialogHeader>

          {/* Add Item Form */}
          <div className="grid grid-cols-4 gap-3 items-end bg-zinc-50 p-4 rounded-lg border border-zinc-100">
            <div>
              <label className="text-xs font-semibold text-zinc-600 mb-1 block">Stock Name</label>
              <select
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
                value={newItemForm.stock_id}
                onChange={(e) => setNewItemForm({ ...newItemForm, stock_id: e.target.value })}
              >
                <option value="" disabled>Select Stock</option>
                {stocks.map(stock => (
                  <option key={stock.stock_id} value={stock.stock_id}>
                    {stock.stock_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600 mb-1 block">Quantity</label>
              <Input
                type="number"
                value={newItemForm.quantity}
                onChange={(e) => setNewItemForm({ ...newItemForm, quantity: e.target.value })}
                placeholder="Ex. 10"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600 mb-1 block">Price / Unit</label>
              <Input
                type="number"
                value={newItemForm.price}
                onChange={(e) => setNewItemForm({ ...newItemForm, price: e.target.value })}
                placeholder="Ex. 100"
              />
            </div>
            <Button
              onClick={handleAddItem}
              disabled={addItemMutation.isPending}
              className="bg-zinc-900 text-white hover:bg-zinc-800 h-10"
            >
              {addItemMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
              Add Item
            </Button>
          </div>

          {/* Items Table */}
          <div className="border rounded-md mt-4 max-h-[40vh] overflow-auto relative">
            <Table>
              <TableHeader className="bg-zinc-50 sticky top-0 shadow-sm z-10">
                <TableRow>
                  <TableHead className="font-semibold text-zinc-600">Stock Name</TableHead>
                  <TableHead className="font-semibold text-zinc-600 text-right">Qty</TableHead>
                  <TableHead className="font-semibold text-zinc-600 text-right">Price/Unit</TableHead>
                  <TableHead className="font-semibold text-zinc-600 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isItemsLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-zinc-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : (itemsData?.items ?? []).length > 0 ? (
                  (itemsData?.items || []).map((item: PurchaseItemRecord, idx: number) => {
                    // Try to use backend name, fallback to local search
                    const displayName = item.stock_name
                      || stocks.find(s => s.stock_id === item.stock_id)?.stock_name
                      || 'Unknown Stock';

                    return (
                      <TableRow key={idx}>
                        <TableCell>{displayName}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">฿{item.price}</TableCell>
                        <TableCell className="text-right font-medium">
                          ฿{(item.quantity * item.price).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-zinc-500">
                      No items in this purchase yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <div className="flex justify-between w-full items-center">
              <div className="text-sm text-zinc-500">
                * Total DB Cost is auto-calculated on backend.
              </div>
              <Button variant="outline" onClick={() => setIsManageModalOpen(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
