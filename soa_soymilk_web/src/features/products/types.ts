export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface Menu {
  menu_id: number;
  category_id: number;
  menu_name: string;
  description: string;
  price: number;
  status: string;
  create_at: string;
  update_at: string;
}

export interface Category {
  category_id: number;
  category_name: string;
  created_at: string;
}

export interface Addon {
  addon_id: number;
  addon_name: string;
  price: number;
  status: string;
}

export interface PaginatedAddonResponse {
  date: Addon[]; 
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_page: number;
  };
}

export type Product = Menu;
