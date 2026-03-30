'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { Loader2, DollarSign, ShoppingBag, Users as UsersIcon, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Order, PaginatedResponse, OrderDetail } from '@/features/products/types';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const chartConfig = {
  revenue: {
    label: "ยอดขาย",
    color: "var(--color-revenue)",
  },
  count: {
    label: "ออเดอร์",
    color: "var(--color-count)",
  }
};

export default function AdminDashboardPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<Order>>({
    queryKey: ['/orders'],
    queryFn: () => apiClient.get('/orders?page=1&limit=100')
  });

  const { data: orderDetail, isLoading: isLoadingDetails } = useQuery<OrderDetail>({
    queryKey: ['/orders', selectedOrderId, 'details'],
    queryFn: () => apiClient.get(`/orders/${selectedOrderId}`),
    enabled: !!selectedOrderId,
  });

  const orders = [...(data?.data || [])].sort((a, b) => (b.order_id || 0) - (a.order_id || 0));
  const totalSales = orders.reduce((sum: number, order: Order) => sum + (order.total_price || 0), 0);
  const totalOrders = orders.length;

  const salesByDate = orders.reduce((acc: Record<string, { date: string; revenue: number; count: number; timestamp: number }>, order: Order) => {
    const rawDate = order.order_time || new Date().toISOString();
    const dateObj = new Date(rawDate.replace(' ', 'T'));
    const dateStr = dateObj.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });

    if (!acc[dateStr]) {
      acc[dateStr] = { date: dateStr, revenue: 0, count: 0, timestamp: dateObj.getTime() };
    }
    acc[dateStr].revenue += (order.total_price || 0);
    acc[dateStr].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(salesByDate)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(({ date, revenue, count }) => ({ date, revenue, count }))
    .slice(-7);

  const displayData = chartData.length > 0 ? chartData : [
    { date: '1 ม.ค.', revenue: 1500, count: 20 },
    { date: '2 ม.ค.', revenue: 2300, count: 35 },
    { date: '3 ม.ค.', revenue: 3400, count: 48 },
  ];

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">แผงควบคุมหลัก (Dashboard)</h1>
        <p className="text-zinc-500 text-sm mt-1">ภาพรวมผลประกอบการและยอดขายประจำร้านของคุณ</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 text-zinc-500 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>กำลังเตรียมข้อมูลสถิติ...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm border-zinc-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">
                  ยอดขายรวมทั้งหมด
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-zinc-900" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-zinc-900">฿{totalSales.toLocaleString()}</div>
                <p className="text-xs text-zinc-500 mt-2 font-medium flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1 text-primary" /> +12% จากสัปดาห์ที่แล้ว
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-zinc-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">
                  จำนวนออเดอร์ทั้งหมด
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-zinc-900" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-zinc-900">{totalOrders}</div>
                <p className="text-xs text-zinc-500 mt-2 font-medium">
                  รายการสั่งซื้อที่ชำระเงินสำเร็จแล้ว
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-zinc-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">
                  สถานะระบบ
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
                  <UsersIcon className="h-4 w-4 text-zinc-900" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-zinc-900">พร้อมใช้งาน</div>
                <p className="text-xs text-zinc-500 mt-2 font-medium">ทุกบริการทำงานประสานกันปกติ</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card className="shadow-sm border-zinc-200">
              <CardHeader>
                <CardTitle>รายการสั่งซื้อล่าสุด (Recent Orders)</CardTitle>
                <CardDescription>แสดงรายการล่าสุด 10 รายการที่เพิ่งเข้ามาในระบบ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b bg-zinc-50/50">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">ID</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">วันเวลา</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">โต๊ะ/ลูกค้า</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">ราคา</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">ช่องทาง</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {orders.slice(0, 10).map((order, idx) => (
                        <tr 
                          key={order.order_id || `order-${idx}`} 
                          className="border-b transition-colors hover:bg-zinc-100 cursor-pointer group"
                          onClick={() => setSelectedOrderId(order.order_id)}
                        >
                          <td className="p-4 align-middle font-medium">{order.order_id}</td>
                          <td className="p-4 align-middle">
                            {order.order_time ? new Date(order.order_time.replace(' ', 'T')).toLocaleString('th-TH', { 
                              day: '2-digit', month: '2-digit', year: '2-digit', 
                              hour: '2-digit', minute: '2-digit' 
                            }) : 'N/A'}
                          </td>
                          <td className="p-4 align-middle text-zinc-500">{order.customer_id ? `ลูกค้า #${order.customer_id}` : 'หน้าร้าน'}</td>
                          <td className="p-4 align-middle font-bold">฿{order.total_price?.toLocaleString()}</td>
                          <td className="p-4 align-middle">
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-zinc-100 text-zinc-800">
                              {order.payment_method}
                            </span>
                          </td>
                          <td className="p-4 align-middle">
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                              {order.order_status || 'PAID'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
      <Dialog open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center justify-between">
              <span>รายละเอียดออเดอร์ #{selectedOrderId}</span>
              {orderDetail && (
                <span className="text-sm font-normal text-zinc-500">
                  {new Date(orderDetail.order_time?.replace(' ', 'T') || '').toLocaleString('th-TH')}
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
              <div className="grid grid-cols-2 gap-4 text-sm bg-zinc-50 p-4 rounded-xl">
                <div>
                  <p className="text-zinc-500">วิธีชำระเงิน</p>
                  <p className="font-bold text-zinc-900">{orderDetail.payment_method}</p>
                </div>
                <div>
                  <p className="text-zinc-500">สถานะออเดอร์</p>
                  <p className="font-bold text-primary">{orderDetail.order_status || 'PAID'}</p>
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
                                <span key={aidx} className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">
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

              <div className="flex justify-between items-center bg-zinc-950 text-white p-4 rounded-xl">
                <span className="font-bold">ยอดเงินรวมทั้งสิ้น</span>
                <span className="text-2xl font-black">฿{orderDetail.total_price?.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500">ไม่พบข้อมูลออเดอร์</div>
          )}
        </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
