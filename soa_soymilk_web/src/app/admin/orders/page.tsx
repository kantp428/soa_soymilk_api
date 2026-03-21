'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { Loader2, History, Search, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Order, PaginatedResponse, OrderDetail } from '@/features/products/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminOrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery<PaginatedResponse<Order>>({
    queryKey: ['/orders', 'all'],
    queryFn: () => apiClient.get('/orders?page=1&limit=100')
  });

  const { data: orderDetail, isLoading: isLoadingDetails } = useQuery<OrderDetail>({
    queryKey: ['/orders', selectedOrderId, 'details'],
    queryFn: () => apiClient.get(`/orders/${selectedOrderId}`),
    enabled: !!selectedOrderId,
  });

  const orders = [...(data?.data || [])].filter(o => 
    o.order_id?.toString().includes(search) || 
    o.payment_method?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => (b.order_id || 0) - (a.order_id || 0));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">ประวัติการขาย (Sales History)</h1>
          <p className="text-zinc-500 mt-1">ดูรายการธุรกรรมทั้งหมดและรายละเอียดการสั่งซื้อย้อนหลัง</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input 
            placeholder="ค้นหา Order ID หรือช่องทาง..." 
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="shadow-sm border-zinc-200 overflow-hidden">
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-zinc-50/50">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-bold text-zinc-900">ID</th>
                  <th className="h-12 px-4 text-left align-middle font-bold text-zinc-900">วันเวลา</th>
                  <th className="h-12 px-4 text-left align-middle font-bold text-zinc-900">ลูกค้า</th>
                  <th className="h-12 px-4 text-left align-middle font-bold text-zinc-900">ราคา</th>
                  <th className="h-12 px-4 text-left align-middle font-bold text-zinc-900">ช่องทาง</th>
                  <th className="h-12 px-4 text-left align-middle font-bold text-zinc-900">สถานะ</th>
                  <th className="h-12 px-4 text-right align-middle font-bold text-zinc-900">รายระเอียด</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {isLoading ? (
                  <tr key="loading">
                    <td colSpan={7} className="p-8 text-center text-zinc-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr key="empty">
                    <td colSpan={7} className="p-8 text-center text-zinc-500">ไม่พบรายการธุรกรรม</td>
                  </tr>
                ) : orders.map((order, idx) => (
                  <tr key={order.order_id || `order-${idx}`} className="border-b transition-colors hover:bg-zinc-50/50">
                    <td className="p-4 align-middle font-medium">#{order.order_id}</td>
                    <td className="p-4 align-middle">
                      {order.created_at ? new Date(order.created_at.replace(' ', 'T')).toLocaleString('th-TH') : 'N/A'}
                    </td>
                    <td className="p-4 align-middle text-zinc-500">
                      {order.customer_id ? `ลูกค้า #${order.customer_id}` : 'ลูกค้าหน้าร้าน'}
                    </td>
                    <td className="p-4 align-middle font-bold">฿{order.total_price?.toLocaleString()}</td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-zinc-100 text-zinc-800">
                        {order.payment_method}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                        {order.order_status || 'COMPLETED'}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedOrderId(order.order_id)}>
                        <Eye className="w-4 h-4 text-zinc-400 hover:text-primary transition-colors" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center justify-between">
              <span>รายละเอียดออเดอร์ #{selectedOrderId}</span>
              {orderDetail && (
                <span className="text-sm font-normal text-zinc-500">
                  {new Date(orderDetail.created_at?.replace(' ', 'T') || '').toLocaleString('th-TH')}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
          ) : orderDetail ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm bg-zinc-50 p-4 rounded-xl border">
                <div>
                  <p className="text-zinc-500">วิธีชำระเงิน</p>
                  <p className="font-bold text-zinc-900">{orderDetail.payment_method}</p>
                </div>
                <div>
                  <p className="text-zinc-500">สถานะ</p>
                  <p className="font-bold text-primary">{orderDetail.order_status || 'COMPLETED'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-zinc-900">รายการสินค้า</h3>
                <div className="space-y-3">
                  {orderDetail.items?.map((item, idx) => (
                    <div key={idx} className="border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-zinc-900">{item.menu_name || `สินค้า #${item.menu_id}`}</p>
                          <p className="text-xs text-zinc-500">จำนวน x{item.quantity}</p>
                          {item.addons && item.addons.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.addons.map((addon, aidx) => (
                                <span key={aidx} className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded border">
                                  + {addon.addon_name} (฿{addon.price})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="font-bold">฿{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center bg-zinc-900 text-white p-6 rounded-xl shadow-lg">
                <span className="font-bold">ยอดเงินรวมทั้งสิ้น</span>
                <span className="text-3xl font-black">฿{orderDetail.total_price?.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500">ไม่พบข้อมูลออเดอร์</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
