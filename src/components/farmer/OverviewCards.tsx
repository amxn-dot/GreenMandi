
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ShoppingBag, 
  ArrowUpRight, 
  TrendingUp, 
  Star 
} from 'lucide-react';

interface Product {
  id: string; // Changed from number to string
  name: string;
  category: string;
  stock: number;
  price: number;
  unit: string;
  image: string;
  listed: boolean;
}

interface Order {
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

interface OverviewCardsProps {
  products: Product[];
  orders: Order[];
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ products, orders }) => {
  const totalRevenue = orders.reduce((sum, order) => {
    if (order.status === 'Delivered') {
      return sum + order.total;
    }
    return sum;
  }, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-1">₹{totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">From delivered orders</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Products</p>
              <h3 className="text-2xl font-bold mt-1">{products.filter(p => p.listed).length}</h3>
            </div>
            <div className="bg-orange-100 p-2 rounded-full">
              <ShoppingBag className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-muted-foreground">Out of {products.length} total products</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">New Orders</p>
              <h3 className="text-2xl font-bold mt-1">{orders.filter(o => o.status === 'New').length}</h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-muted-foreground">Waiting to be processed</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <h3 className="text-2xl font-bold mt-1">{orders.length}</h3>
            </div>
            <div className="bg-yellow-100 p-2 rounded-full">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-muted-foreground">All time orders</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewCards;
