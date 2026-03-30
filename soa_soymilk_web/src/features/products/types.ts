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
  image_url?: string;
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

export interface Staff {
  staff_id: number;
  first_name: string;
  last_name: string;
  position: string;
  phone: string;
  email: string;
  status: string;
  created_at: string;
}

export interface Stock {
  stock_id: number;
  item_name: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  status: string;
  last_updated: string;
}

export interface Supplier {
  supplier_id: number;
  supplier_name: string;
  contact_name: string;
  phone: string;
  address: string;
}

export interface Purchase {
  purchase_id: number;
  supplier_id: number;
  total_amount: number;
  status: string;
  purchase_date: string;
}

export interface Promotion {
  promotion_id: number;
  promotion_name: string;
  discount_type: string;
  discount_value: number;
  start_date: string;
  end_date: string;
  status: string;
}

export interface Coupon {
  coupon_id: number;
  coupon_code: string;
  discount_value: number;
  min_spend: number;
  expiry_date: string;
  status: string;
}

export interface Order {
  order_id: number;
  customer_id?: number | null;
  total_price: number;
  payment_method: string;
  order_status: string;
  created_at: string;
  staff_id?: number | null;
  coupon_id?: number | null;
}

export interface OrderItemAddon {
  order_item_addon_id: number;
  order_item_id: number;
  addon_id: number;
  addon_name: string;
  price: number;
}

export interface OrderDetailItem {
  order_item_id: number;
  order_id?: number;
  menu_id: number;
  menu_name?: string;
  quantity: number;
  price: number;
  addons?: {
    addon_id: number;
    addon_name: string;
    price: number;
  }[];
}

export interface OrderDetail extends Order {
  items: OrderDetailItem[];
}

export type Product = Menu;
