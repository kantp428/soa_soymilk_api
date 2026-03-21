'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { Loader2, BarChart3, TrendingUp, Calendar, CreditCard, Wallet } from 'lucide-react';
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
import { Order, PaginatedResponse } from '@/features/products/types';

export default function AdminReportsPage() {
  const { data, isLoading } = useQuery<PaginatedResponse<Order>>({
    queryKey: ['/orders', 'reports'],
    queryFn: () => apiClient.get('/orders?page=1&limit=1000')
  });

  const orders = data?.data || [];

  const stats = useMemo(() => {
    const dailyData: Record<string, { date: string; revenue: number; count: number; timestamp: number }> = {};
    const paymentData: Record<string, number> = { CASH: 0, PROMPTPAY: 0 };
    let totalRevenue = 0;

    orders.forEach(order => {
      const rawDate = order.created_at || new Date().toISOString();
      const dateObj = new Date(rawDate.replace(' ', 'T'));
      const dateKey = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { date: dateKey, revenue: 0, count: 0, timestamp: dateObj.getTime() };
      }
      dailyData[dateKey].revenue += (order.total_price || 0);
      dailyData[dateKey].count += 1;
      totalRevenue += (order.total_price || 0);
      
      const method = order.payment_method || 'CASH';
      paymentData[method] = (paymentData[method] || 0) + (order.total_price || 0);
    });

    const dailyChart = Object.values(dailyData).sort((a, b) => a.timestamp - b.timestamp).slice(-15);
    const paymentChart = Object.entries(paymentData).map(([key, value]) => ({ name: key, value }));

    return { totalRevenue, totalOrders: orders.length, dailyChart, paymentChart };
  }, [orders]);

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
                    data={stats.paymentChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#09090b" />
                    <Cell fill="hsl(var(--primary))" />
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
    </div>
  );
}
