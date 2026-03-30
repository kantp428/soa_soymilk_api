'use client';

import React, { useState } from 'react';
import { CrudTable } from '@/components/admin/CrudTable';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { Category, PaginatedResponse, Menu } from '@/features/products/types';
import { Info, Calendar, Loader2, Tag, Coffee } from 'lucide-react';
import { useMenu, useCategory, useAddonDetail } from '@/features/products/hooks/useProducts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminMenuPage() {
  const [activeTab, setActiveTab] = useState<'drinks' | 'snacks' | 'categories' | 'addons'>('drinks');
  const [viewingCategoryId, setViewingCategoryId] = useState<number | null>(null);
  const [viewingAddonId, setViewingAddonId] = useState<number | null>(null);
  const [viewingMenuId, setViewingMenuId] = useState<number | null>(null);

  const { data: categoryDetail, isLoading: isLoadingCategoryDetail } = useCategory(viewingCategoryId);
  const { data: addonDetail, isLoading: isLoadingAddonDetail } = useAddonDetail(viewingAddonId);
  const { data: menuDetail, isLoading: isLoadingMenuDetail } = useMenu(viewingMenuId);

  const { data: categoriesData } = useQuery<PaginatedResponse<Category>>({
    queryKey: ['/categories-all'],
    queryFn: () => apiClient.get('/categories?limit=100'),
  });

  const categoryOptions = categoriesData?.data?.map(cat => ({
    label: cat.category_name,
    value: cat.category_id
  })) || [];

  const isDrinks = activeTab === 'drinks';
  const isSnacks = activeTab === 'snacks';
  const isCategories = activeTab === 'categories';
  const isAddons = activeTab === 'addons';

  const currentTitle = isAddons ? 'จัดการท็อปปิ้ง' : (isCategories ? 'หมวดหมู่สินค้า' : (isDrinks ? 'เครื่องดื่ม' : 'ขนม'));
  const currentEndpoint = isAddons ? '/addons' : (isCategories ? '/categories' : (isDrinks ? '/menus?category_id=1' : '/menus?category_id=2'));
  const currentPrimaryKey = isAddons ? 'addon_id' : (isCategories ? 'category_id' : 'menu_id');

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">การจัดการเมนูและหมวดหมู่</h1>
        <p className="text-zinc-500 mt-1">บริหารจัดการรายการสินค้า หมวดหมู่ และส่วนผสมท็อปปิ้ง</p>
      </div>

      <div className="flex gap-2 border-b border-zinc-200 pb-px">
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 px-6 ${isDrinks ? 'border-zinc-900 font-semibold' : 'border-transparent text-zinc-500'}`}
          onClick={() => setActiveTab('drinks')}
        >
          เครื่องดื่ม
        </Button>
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 px-6 ${isSnacks ? 'border-zinc-900 font-semibold' : 'border-transparent text-zinc-500'}`}
          onClick={() => setActiveTab('snacks')}
        >
          ขนม
        </Button>
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 px-6 ${isCategories ? 'border-zinc-900 font-semibold' : 'border-transparent text-zinc-500'}`}
          onClick={() => setActiveTab('categories')}
        >
          หมวดหมู่สินค้า
        </Button>
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 px-6 ${isAddons ? 'border-zinc-900 font-semibold' : 'border-transparent text-zinc-500'}`}
          onClick={() => setActiveTab('addons')}
        >
          ท็อปปิ้ง (Addons)
        </Button>
      </div>

      <div className="pt-4">
        <CrudTable
          title={currentTitle}
          endpoint={currentEndpoint}
          primaryKey={currentPrimaryKey as any}
          useIdInUpdateUrl={true}
          columns={[
            { header: 'ID', accessorKey: currentPrimaryKey as any },
            { 
              header: isAddons ? 'ชื่อท็อปปิ้ง' : (isCategories ? 'ชื่อหมวดหมู่' : 'ชื่อเมนู'), 
              accessorKey: isAddons ? 'addon_name' : (isCategories ? 'category_name' : 'menu_name' as any) 
            },
            { 
              header: 'ราคา (฿)', 
              accessorKey: 'price' as any,
              show: !isCategories 
            },
            {
              header: 'สถานะ',
              accessorKey: 'status' as any,
              cell: (row: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'Active' || row.status === 'Available' || row.status === 'ปกติ' || row.status === 'ACTIVE' ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-800'}`}>
                  {(row.status as string) || 'Active'}
                </span>
              )
            },
          ].filter(item => item.show !== false) as any[]}
          formFields={isAddons ? [
            { name: 'addon_name', label: 'ชื่อท็อปปิ้ง', type: 'text', required: true },
            { name: 'price', label: 'ราคาเพิ่ม (฿)', type: 'number', required: true },
            {
              name: 'status', label: 'สถานะ', type: 'select', options: [
                { label: 'ใช้งานปกติ (Active)', value: 'Active' },
                { label: 'ปิดการใช้งาน (Inactive)', value: 'Inactive' }
              ]
            }
          ] : (isCategories ? [
            { name: 'category_name', label: 'ชื่อหมวดหมู่', type: 'text', required: true },
            {
              name: 'status', label: 'สถานะ', type: 'select', options: [
                { label: 'ใช้งานปกติ (Active)', value: 'Active' },
                { label: 'ปิดการใช้งาน (Inactive)', value: 'Inactive' }
              ]
            }
          ] : [
            { name: 'menu_name', label: 'ชื่อเมนู', type: 'text', required: true },
            { 
              name: 'category_id', 
              label: 'หมวดหมู่', 
              type: 'select', 
              options: categoryOptions,
              required: true 
            },
            { name: 'price', label: 'ราคา', type: 'number', required: true },
            { name: 'description', label: 'รายละเอียด', type: 'textarea' },
            {
              name: 'status', label: 'สถานะ', type: 'select', options: [
                { label: 'ใช้งานปกติ (Active)', value: 'Active' },
                { label: 'ปิดการใช้งาน (Inactive)', value: 'Inactive' }
              ]
            },
          ])}
          customActions={(row: any) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isCategories) setViewingCategoryId(row.category_id as number);
                else if (isAddons) setViewingAddonId(row.addon_id as number);
                else setViewingMenuId(row.menu_id as number);
              }}
              className="text-zinc-400 hover:text-primary transition-colors"
            >
              <Info className="w-4 h-4" />
            </Button>
          )}
        />
      </div>

      <Dialog open={!!viewingCategoryId || !!viewingAddonId || !!viewingMenuId} onOpenChange={(open) => {
        if (!open) {
          setViewingCategoryId(null);
          setViewingAddonId(null);
          setViewingMenuId(null);
        }
      }}>
        <DialogContent className="max-w-sm bg-white border-zinc-200 shadow-2xl rounded-3xl overflow-hidden p-0">
          <div className="bg-primary/5 h-20 w-full relative flex items-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-primary/20 flex items-center justify-center">
              {viewingMenuId ? <Coffee className="w-6 h-6 text-primary" /> : <Tag className="w-6 h-6 text-primary" />}
            </div>
          </div>
          
          <div className="px-6 pb-8 space-y-6">
            <DialogHeader className="pt-4">
              <DialogTitle className="text-xl font-black text-zinc-900">
                {viewingCategoryId ? (isLoadingCategoryDetail ? '...' : categoryDetail?.category_name) : 
                 viewingAddonId ? (isLoadingAddonDetail ? '...' : addonDetail?.addon_name) :
                 (isLoadingMenuDetail ? '...' : menuDetail?.menu_name)}
              </DialogTitle>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                {viewingCategoryId ? 'รายละเอียดหมวดหมู่สินค้า' : (viewingAddonId ? 'รายละเอียดท็อปปิ้ง (Addon)' : 'รายละเอียดเมนูสินค้า')}
              </p>
            </DialogHeader>

            {(viewingCategoryId ? isLoadingCategoryDetail : 
              viewingAddonId ? isLoadingAddonDetail : 
              isLoadingMenuDetail) ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
              </div>
            ) : (
              <div className="space-y-4">

                {(viewingAddonId || viewingMenuId) && (
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-zinc-200">
                      <Tag className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">ราคา</p>
                      <p className="text-sm font-bold text-zinc-800">฿ {viewingAddonId ? addonDetail?.price : menuDetail?.price}</p>
                    </div>
                  </div>
                )}

                {viewingMenuId && menuDetail?.description && (
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">รายละเอียดสินค้า</p>
                    <p className="text-sm text-zinc-600 leading-relaxed">{menuDetail.description}</p>
                  </div>
                )}

                {(viewingCategoryId || viewingMenuId) && (
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-zinc-200">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">วันที่สร้าง</p>
                      <p className="text-sm font-bold text-zinc-800">
                        {(() => {
                           const dateStr = viewingCategoryId ? categoryDetail?.created_at : menuDetail?.create_at;
                           return dateStr ? new Date(dateStr).toLocaleDateString('th-TH', { 
                             year: 'numeric', 
                             month: 'long', 
                             day: 'numeric' 
                           }) : '-';
                        })()}
                      </p>
                    </div>
                  </div>
                )}
                {/* <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center gap-3"> */}
                  {/* <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-zinc-200">
                    <Info className="w-4 h-4 text-zinc-400" />
                  </div> */}
                  {/* <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">ID ระบบ</p>
                    <p className="text-sm font-bold text-zinc-800"># {viewingCategoryId ? categoryDetail?.category_id : viewingAddonId ? addonDetail?.addon_id : menuDetail?.menu_id}</p>
                  </div> */}
                </div>

              // </div>
            )}

            <Button 
                variant="outline" 
                className="w-full h-11 rounded-xl border-zinc-200 hover:bg-zinc-50 text-zinc-600 font-bold text-xs"
                onClick={() => {
                  setViewingCategoryId(null);
                  setViewingAddonId(null);
                  setViewingMenuId(null);
                }}
              >
                ปิดหน้าต่าง
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
