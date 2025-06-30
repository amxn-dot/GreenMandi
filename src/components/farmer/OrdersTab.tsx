
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingBag, Eye, Calendar, User, Package, IndianRupee } from 'lucide-react';

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

interface OrdersTabProps {
  orders: Order[];
  onUpdateOrderStatus: (order: Order, newStatus: Order['status']) => void;
  onViewOrder: (order: Order) => void;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ orders, onUpdateOrderStatus, onViewOrder }) => {
  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      'New': 'bg-blue-100 text-blue-800 border-blue-200',
      'Processing': 'bg-orange-100 text-orange-800 border-orange-200',
      'Shipped': 'bg-purple-100 text-purple-800 border-purple-200',
      'Delivered': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-green-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <ShoppingBag className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-gray-900">Customer Orders</CardTitle>
            <CardDescription className="text-gray-600">
              Manage and track customer orders from your farm
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <div className="bg-gray-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">No orders yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              When customers place orders for your products, they will appear here for you to manage and track.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Order ID
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">Items</TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      Total
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                    <TableCell className="font-medium text-gray-900">#{order.id}</TableCell>
                    <TableCell className="text-gray-700">{order.date}</TableCell>
                    <TableCell className="text-gray-700">{order.customer}</TableCell>
                    <TableCell className="text-gray-700">{order.items}</TableCell>
                    <TableCell className="font-medium text-gray-900">₹{order.total}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewOrder(order)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Select 
                          defaultValue={order.status}
                          onValueChange={(value) => onUpdateOrderStatus(
                            order, 
                            value as Order['status']
                          )}
                        >
                          <SelectTrigger className="h-8 w-32 bg-white border-gray-300">
                            <SelectValue placeholder="Update" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Processing">Processing</SelectItem>
                            <SelectItem value="Shipped">Shipped</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersTab;
