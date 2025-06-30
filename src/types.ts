export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  unit: string;
  image: string;
  listed: boolean;
  description?: string;
  farmerId?: string;
}

export interface Order {
  id: string;
  date: string;
  customer: string;
  customerEmail?: string;
  customerPhone?: string;
  items: number;
  total: number;
  status: 'New' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  deliveryAddress?: string;
  deliverySlot?: string;
  paymentMethod?: string;
  orderItems?: any[];
}

export interface FarmerProfile {
  farmName: string;
  farmerName: string;
  location: string;
  phone: string;
  description: string;
}