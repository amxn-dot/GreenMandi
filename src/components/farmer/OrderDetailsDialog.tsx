
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

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

interface OrderDetailsDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({ order, isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Order Details - {order?.id}</DialogTitle>
          <DialogDescription>
            Complete order information and customer details
          </DialogDescription>
        </DialogHeader>
        
        {order && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Customer</Label>
                <p className="text-sm">{order.customer}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm">{order.customerEmail || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Phone</Label>
                <p className="text-sm">{order.customerPhone || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Order Date</Label>
                <p className="text-sm">{order.date}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Delivery Address</Label>
              <p className="text-sm mt-1">{order.deliveryAddress || 'No address provided'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Delivery Slot</Label>
                <p className="text-sm">{order.deliverySlot || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Payment Method</Label>
                <p className="text-sm">{order.paymentMethod || 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Order Summary</Label>
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <p className="text-sm">Items: {order.items}</p>
                <p className="text-sm font-medium">Total: ₹{order.total}</p>
                <p className="text-sm">Status: {order.status}</p>
              </div>
            </div>
            
            {/* Display Order Items */}
            {order.orderItems && order.orderItems.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Order Items</Label>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {order.orderItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex justify-between items-center p-2 bg-muted rounded-md">
                      <div className="flex items-center">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="h-8 w-8 rounded object-cover mr-2"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
