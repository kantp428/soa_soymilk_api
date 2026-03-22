'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { PaginatedResponse } from '@/features/products/types';

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (row: T) => React.ReactNode;
}

export interface FormFieldDef {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'image';
  options?: { label: string; value: string | number }[];
  required?: boolean;
}

interface CrudTableProps<T> {
  title: string;
  endpoint: string;
  columns: ColumnDef<T>[];
  formFields: FormFieldDef[];
  primaryKey: keyof T;
  searchPlaceholder?: string;
  dataKey?: string;
  useIdInUpdateUrl?: boolean;
  hideCreate?: boolean;
  hideEdit?: boolean;
  hideDelete?: boolean;
  hideActions?: boolean;
  customActions?: (row: T) => React.ReactNode;
}

export function CrudTable<T extends Record<string, unknown>>({
  title,
  endpoint,
  columns,
  formFields,
  primaryKey,
  dataKey = 'data',
  useIdInUpdateUrl = false,
  hideCreate = false,
  hideEdit = false,
  hideDelete = false,
  hideActions = false,
  searchPlaceholder,
  customActions,
}: CrudTableProps<T>) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [formData, setFormData] = useState<Partial<T>>({});
  const [isUploading, setIsUploading] = useState(false);

  const { data, isLoading } = useQuery<PaginatedResponse<T>>({
    queryKey: [endpoint, page],
    queryFn: async () => {
      const separator = endpoint.includes('?') ? '&' : '?';
      const res = await apiClient.get(`${endpoint}${separator}page=${page}&limit=${limit}`);
      return res as unknown as PaginatedResponse<T>;
    },
  });

  const rawData = data;
  const extracted = rawData ? (Array.isArray(rawData) ? rawData : (rawData as unknown as Record<string, unknown>)[dataKey]) : [];
  const rawItems: T[] = (Array.isArray(extracted) ? extracted : []) as T[];

  // กรองให้แสดงเฉพาะข้อมูลที่มีสถานะเป็น Active หรือไม่มีสถานะระบุไว้
  let items = rawItems.filter(item => {
    const status = item['status' as keyof T] as string | undefined;
    if (!status) return true;
    const s = String(status).toLowerCase();
    return s === 'active' || s === 'available' || s === 'ปกติ';
  });

  // Client-Side Search (กรองข้อมูลจากรายการที่มีอยู่ในหน้านี้)
  if (searchQuery.trim()) {
    const lowerQuery = searchQuery.toLowerCase();
    items = items.filter((item) => {
      // ค้นหาจากทุกคอลัมน์ที่ตั้งค่าไว้ในตาราง
      return columns.some((col) => {
        const value = item[col.accessorKey];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerQuery);
      });
    });
  }

  const createMutation = useMutation({
    mutationFn: (newObj: Partial<T>) => {
      const baseUrl = endpoint.split('?')[0];
      return apiClient.post(baseUrl, newObj);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setIsModalOpen(false);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      alert(`ไม่สามารถสร้างข้อมูลได้: ${err?.response?.data?.message || 'เกิดข้อผิดพลาด'}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<T> }) => {
      const baseUrl = endpoint.split('?')[0];
      return apiClient.put(useIdInUpdateUrl ? `${baseUrl}/${id}` : baseUrl, useIdInUpdateUrl ? data : { ...data, [primaryKey]: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setIsModalOpen(false);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      alert(`ไม่สามารถอัปเดตข้อมูลได้: ${err?.response?.data?.message || 'เกิดข้อผิดพลาด'}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => {
      const baseUrl = endpoint.split('?')[0];
      return apiClient.delete(`${baseUrl}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      alert(`ไม่สามารถลบข้อมูลได้: ${err?.response?.data?.message || 'ไม่มี API สำหรับลบข้อมูลนี้ หรือเกิดข้อผิดพลาด'}`);
    }
  });

  const handleOpenModal = (item?: T) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem[primaryKey] as string | number, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (item: T) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
      const id = item[primaryKey] as string | number;
      const hasStatus = 'status' in item || formFields.some(f => f.name === 'status');

      if (hasStatus) {
        // อัปเดตสถานะเป็น Inactive แทบลบข้อมูลทิ้งจริง
        updateMutation.mutate({ id, data: { ...item, status: 'Inactive' as unknown as T[keyof T] } });
      } else {
        // หากไม่มีคอลัมน์ status ให้ลบออกไปเลย
        deleteMutation.mutate(id);
      }
    }
  };

  const handleImageUpload = async (file: File, fieldName: string) => {
    setIsUploading(true);
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dfxf4u91m';
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'soa_soymilk';
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formDataUpload,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Cloudinary upload failed:', data);
        alert(`อัปโหลดรูปภาพล้มเหลว: ${data.error?.message || 'Unknown error'}`);
        return;
      }

      if (data.secure_url) {
        setFormData((prev) => ({ ...prev, [fieldName]: data.secure_url }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('อัปโหลดรูปภาพล้มเหลว กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsUploading(false);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              type="text"
              placeholder={searchPlaceholder || 'ค้นหาในหน้านี้...'}
              className="pl-10 bg-white border-zinc-200 focus-visible:ring-zinc-950 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {!hideCreate && (
            <Button onClick={() => handleOpenModal()} className="bg-zinc-900 text-white hover:bg-zinc-800 shrink-0">
              <Plus className="w-4 h-4 mr-2" /> เพิ่มใหม่
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              {columns.map((col) => (
                <TableHead key={String(col.accessorKey)}>{col.header}</TableHead>
              ))}
              {!hideActions && (
                <TableHead className="text-right">จัดการ</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-32 text-center text-zinc-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-32 text-center text-zinc-500">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((col) => (
                    <TableCell key={String(col.accessorKey)}>
                      {col.cell ? col.cell(item) : String(item[col.accessorKey] ?? '-')}
                    </TableCell>
                  ))}
                  {!hideActions && (
                    <TableCell className="text-right whitespace-nowrap">
                      {customActions && customActions(item)}
                      {!hideEdit && (
                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(item)}>
                          <Edit2 className="w-4 h-4 text-zinc-500 hover:text-zinc-900" />
                        </Button>
                      )}
                      {!hideDelete && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
                          <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'แก้ไขข้อมูล' : 'สร้างข้อมูลใหม่'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {formFields.map((field) => (
              <div key={field.name} className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    className="flex min-h-[80px] w-full border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 rounded-md border"
                    value={(formData[field.name] as string | number | undefined) || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value as unknown as T[keyof T] })}
                  />
                ) : field.type === 'select' && field.options ? (
                  <select
                    className="flex h-10 w-full border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 rounded-md border"
                    value={(formData[field.name] as string | number | undefined) || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value as unknown as T[keyof T] })}
                  >
                    <option value="" disabled>Select option</option>
                    {field.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : field.type === 'image' ? (
                  <div className="space-y-3">
                    {formData[field.name] && (
                      <div className="relative w-32 h-32 group">
                        <img
                          src={formData[field.name] as string}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-xl border-2 border-zinc-100 shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <p className="text-white text-[10px] font-bold">เปลี่ยนรูปภาพ</p>
                        </div>
                      </div>
                    )}
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, field.name);
                        }}
                        className="bg-zinc-50 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 cursor-pointer"
                      />
                      {isUploading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <Input
                    type={field.type}
                    value={(formData[field.name] as string | number | undefined) || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      [field.name]: (field.type === 'number' ? Number(e.target.value) : e.target.value) as unknown as T[keyof T]
                    })}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleSave} disabled={isSaving || isUploading} className="bg-zinc-900 text-white hover:bg-zinc-800">
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingItem ? 'บันทึกการแก้ไข' : 'ยืนยันการสร้าง'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
