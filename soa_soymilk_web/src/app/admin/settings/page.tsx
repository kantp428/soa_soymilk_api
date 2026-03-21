'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Store, Shield, Bell, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">ตั้งค่าระบบ (Settings)</h1>
        <p className="text-zinc-500 mt-1">จัดการข้อมูลพื้นฐานของร้าน การแจ้งเตือน และความปลอดภัย</p>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-sm border-zinc-200">
          <CardHeader>
            <div className="flex items-center gap-3">
               <div className="p-2 bg-zinc-100 rounded-lg">
                  <Store className="w-5 h-5 text-zinc-900" />
               </div>
               <div>
                  <CardTitle>ข้อมูลร้านค้า</CardTitle>
                  <CardDescription>จัดการข้อมูลทั่วไปที่แสดงในใบเสร็จและหน้าขาย</CardDescription>
               </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-sm font-medium">ชื่อร้าน</label>
                   <Input defaultValue="ร้านน้ำเต้าหู้ ตั้งหวังเจ๊ง" />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium">เบอร์โทรศัพท์ติดต่อ</label>
                   <Input defaultValue="081-234-5678" />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-sm font-medium">ที่อยู่ร้าน</label>
                <Input defaultValue="123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ" />
             </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-zinc-200">
          <CardHeader>
             <div className="flex items-center gap-3">
               <div className="p-2 bg-zinc-100 rounded-lg">
                  <Shield className="w-5 h-5 text-zinc-900" />
               </div>
               <div>
                  <CardTitle>ความปลอดภัยและการเข้าถึง</CardTitle>
                  <CardDescription>ตั้งค่าการยืนยันตัวตนและสิทธิ์การเข้าใช้งาน</CardDescription>
               </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border">
                <div>
                   <p className="font-bold">บังคับใช้รหัสผ่านพนักงาน</p>
                   <p className="text-xs text-zinc-500">พนักงานต้องใส่รหัสก่อนทำรายการชำระเงิน</p>
                </div>
                <Button variant="outline" size="sm">เปิดใช้งาน</Button>
             </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-zinc-200">
          <CardHeader>
             <div className="flex items-center gap-3">
               <div className="p-2 bg-zinc-100 rounded-lg">
                  <Bell className="w-5 h-5 text-zinc-900" />
               </div>
               <div>
                  <CardTitle>การแจ้งเตือน</CardTitle>
                  <CardDescription>ระบบแจ้งเตือนออเดอร์ใหม่และสต็อกสินค้าเหลือน้อย</CardDescription>
               </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between">
                <span>เสียงแจ้งเตือนเมื่อมีออเดอร์ใหม่</span>
                <Button variant="ghost" className="text-primary font-bold">เปิด</Button>
             </div>
             <Separator />
             <div className="flex items-center justify-between">
                <span>ส่งรายงานสรุปยอดรายวันเข้าอีเมล</span>
                <Button variant="ghost" className="text-zinc-500 font-bold">ปิด</Button>
             </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
           <Button className="bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-6 rounded-xl shadow-lg">
              <Save className="w-4 h-4 mr-2" /> บันทึกการตั้งค่าทั้งหมด
           </Button>
        </div>
      </div>
    </div>
  );
}
