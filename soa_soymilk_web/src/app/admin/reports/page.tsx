'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { Loader2, BarChart3, TrendingUp, Calendar, CreditCard, Wallet, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { Order, PaginatedResponse, OrderItemAddon } from '@/features/products/types';
import { useOrderItemAddons, useOrderItemAddon } from '@/features/orders/hooks/useOrders';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AdminReportsPage() {
  const [selectedToppingLogId, setSelectedToppingLogId] = useState<number | null>(null);
  
  const { data, isLoading } = useQuery<PaginatedResponse<Order>>({
    queryKey: ['/orders', 'reports'],
    queryFn: () => apiClient.get('/orders?page=1&limit=1000')
  });
  
  const { data: addonsSalesData, isLoading: isAddonsLoading } = useOrderItemAddons(1, 2000);
  const { data: toppingDetailData, isLoading: isToppingDetailLoading } = useOrderItemAddon(selectedToppingLogId);

  const orders = data?.data || [];

  const stats = useMemo(() => {
    const dailyData: Record<string, { date: string; revenue: number; count: number; timestamp: number }> = {};
    const paymentData: Record<string, number> = { CASH: 0, PROMPTPAY: 0, CREDIT_CARD: 0 };
    let totalRevenue = 0;

    orders.forEach(order => {
      const rawDate = order.order_time || new Date().toISOString();
      const dateObj = new Date(rawDate.replace(' ', 'T'));
      const dateKey = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { date: dateKey, revenue: 0, count: 0, timestamp: dateObj.getTime() };
      }
      dailyData[dateKey].revenue += (order.total_price || 0);
      dailyData[dateKey].count += 1;
      totalRevenue += (order.total_price || 0);
      let method = String(order.payment_method || 'CASH').toUpperCase().replace(/[\s_]/g, '');
      if (method.includes('CREDIT')) method = 'CREDIT_CARD';
      else if (method.includes('PROMPT')) method = 'PROMPTPAY';
      else method = 'CASH';
      
      paymentData[method] = (paymentData[method] || 0) + (order.total_price || 0);
    });

    const dailyChart = Object.values(dailyData).sort((a, b) => a.timestamp - b.timestamp).slice(-15);
    const paymentChart = Object.entries(paymentData).map(([key, value]) => ({ name: key, value }));

    return { totalRevenue, totalOrders: orders.length, dailyChart, paymentChart };
  }, [orders]);

  const toppingStats = useMemo(() => {
    const addons = (addonsSalesData as any)?.data || [];
    const counts: Record<string, number> = {};
    const lastIds: Record<string, number> = {};
    
    addons.forEach((addon: OrderItemAddon) => {
      counts[addon.addon_name] = (counts[addon.addon_name] || 0) + 1;
      lastIds[addon.addon_name] = addon.order_item_addon_id;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, lastId: lastIds[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [addonsSalesData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-zinc-500 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p>กำลังเตรียมรายละเอียดยอดขายและสถิติ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">สรุปรายงานและสถิติ (Analytics)</h1>
        <p className="text-zinc-500 mt-1">วิเคราะห์แนวโน้มยอดขายและพฤติกรรมการสั่งซื้อสินค้า</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-zinc-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">ยอดรวมทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-zinc-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">จำนวนออเดอร์</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders} รายการ</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-zinc-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">ยอดเฉลี่ยต่อบิล</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{(stats.totalRevenue / (stats.totalOrders || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-zinc-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">สถานะวันนี้</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" /> ปกติ
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-zinc-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-zinc-500" /> ยอดขายรายวัน (15 วันล่าสุด)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dailyChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis fontSize={11} axisLine={false} tickLine={false} tickFormatter={(val) => `฿${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-zinc-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-zinc-500" /> สัดส่วนการชำระเงิน
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.paymentChart.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.paymentChart.filter(item => item.value > 0).map((entry, index) => {
                      const normalizedName = String(entry.name || '').toUpperCase().replace(/[\s_]/g, '');
                      const colors: Record<string, string> = {
                        'CASH': '#09090b',
                        'PROMPTPAY': '#3b82f6',
                        'CREDITCARD': '#9ca3af',
                      };
                      return <Cell key={`cell-${index}`} fill={colors[normalizedName] || '#cbd5e1'} />;
                    })}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
             <div className="flex flex-col gap-4 pr-12 text-sm">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-zinc-950" />
                   <span className="font-medium">เงินสด (CASH)</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-primary" />
                   <span className="font-medium">โอนเงิน (PROMPTPAY)</span>
                </div>
                  <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-gray-400" />
                   <span className="font-medium">เครดิตการ์ด (CREDIT CARD)</span>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-zinc-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-zinc-500" /> จำนวนออเดอร์รายวัน
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} />
                </LineChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-zinc-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-zinc-500" /> ท็อปปิ้งยอดนิยม (Top 10 Toppings)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            {isAddonsLoading ? (
              <div className="flex items-center justify-center h-full text-zinc-500">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> กำลังประมวลผล...
              </div>
            ) : toppingStats.length === 0 ? (
              <div className="flex items-center justify-center h-full text-zinc-500">
                ไม่มีข้อมูลท็อปปิ้ง
              </div>
            ) : (
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={toppingStats} layout="vertical" margin={{ left: 40, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    fontSize={12} 
                    width={100}
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#18181b" 
                    radius={[0, 4, 4, 0]} 
                    label={{ position: 'right', fontSize: 11, fill: '#71717a' }}
                    onClick={(data) => setSelectedToppingLogId(data.lastId)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </BarChart>
             </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

      <Dialog open={!!selectedToppingLogId} onOpenChange={(open) => !open && setSelectedToppingLogId(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Layers className="w-5 h-5 text-primary" /> รายละเอียดท็อปปิ้งที่ขายได้
            </DialogTitle>
          </DialogHeader>
          
          {isToppingDetailLoading ? (
            <div className="py-10 flex flex-col items-center justify-center gap-3 text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p>กำลังดึงข้อมูล...</p>
            </div>
          ) : toppingDetailData ? (
            <div className="space-y-6 py-2">
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Service Addon ID</span>
                  <span className="font-mono text-sm font-bold text-zinc-900">#{(toppingDetailData as any).order_item_addon_id}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-sm text-zinc-500">ชื่อท็อปปิ้ง</span>
                   <span className="font-bold text-zinc-900">{(toppingDetailData as any).addon_name || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-sm text-zinc-500">ราคาที่ขาย</span>
                   <span className="font-bold text-primary text-lg">฿{(toppingDetailData as any).price}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest pl-1">ข้อมูลประกอบ</p>
                <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 bg-white border border-zinc-100 rounded-xl">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">รหัสรายการออเดอร์</p>
                      <p className="text-sm font-bold text-zinc-700">#{(toppingDetailData as any).order_item_id}</p>
                   </div>
                   <div className="p-3 bg-white border border-zinc-100 rounded-xl">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">รหัสท็อปปิ้งหลัก</p>
                      <p className="text-sm font-bold text-zinc-700">ID: {(toppingDetailData as any).addon_id}</p>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-zinc-500">
              ไม่พบข้อมูลรายละเอียด
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
