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
import { Loader2, Plus, Edit2 } from 'lucide-react';
import { PaginatedResponse } from '@/features/products/types';

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (row: T) => React.ReactNode;
}

export interface FormFieldDef {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea';
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
}

export function CrudTable<T extends Record<string, unknown>>({
  title,
  endpoint,
  columns,
  formFields,
  primaryKey,
  dataKey = 'data'
}: CrudTableProps<T>) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [formData, setFormData] = useState<Partial<T>>({});

  const { data, isLoading } = useQuery<PaginatedResponse<T>>({
    queryKey: [endpoint, page],
    queryFn: async () => {
      const res = await apiClient.get(`${endpoint}?page=${page}&limit=${limit}`);
      return res as unknown as PaginatedResponse<T>;
    },
  });

  const rawData = data;
  const items: T[] = (rawData ? (rawData as unknown as Record<string, unknown>)[dataKey] : []) as T[];

  const filteredItems = items;

  const createMutation = useMutation({
    mutationFn: (newObj: Partial<T>) => apiClient.post(endpoint, newObj),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<T> }) =>
      apiClient.put(`${endpoint}/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setIsModalOpen(false);
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

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
        <div className="flex items-center gap-3">
          <Button onClick={() => handleOpenModal()} className="bg-zinc-900 text-white hover:bg-zinc-800">
            <Plus className="w-4 h-4 mr-2" /> เพิ่มใหม่
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              {columns.map((col) => (
                <TableHead key={String(col.accessorKey)}>{col.header}</TableHead>
              ))}
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-32 text-center text-zinc-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-32 text-center text-zinc-500">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((col) => (
                    <TableCell key={String(col.accessorKey)}>
                      {col.cell ? col.cell(item) : String(item[col.accessorKey] ?? '-')}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(item)}>
                      <Edit2 className="w-4 h-4 text-zinc-500 hover:text-zinc-900" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white sm:max-w-[425px]">
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} บันทึกข้อมูล
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
