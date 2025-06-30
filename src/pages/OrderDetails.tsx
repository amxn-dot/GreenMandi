
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingBag, Calendar, MapPin, Clock, ArrowLeft, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  date: string;
  status: 'Delivered' | 'Processing' | 'Shipped';
  total: number;
  items: number;
  orderItems: OrderItem[];
  deliveryAddress: string;
  paymentMethod: string;
  userEmail: string;
}

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userType = localStorage.getItem('userType');
    if (!userType || userType !== 'customer') {
      toast({
        title: "Authentication required",
        description: "Please login to access order details",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    const loadOrderDetails = async () => {
      try {
        setIsLoading(true);
        
        // Get current user email
        const currentUserEmail = JSON.parse(localStorage.getItem('userData') || '{}').email;
        
        // Load orders from localStorage
        const savedOrders = localStorage.getItem('orders');
        if (savedOrders && orderId) {
          const parsedOrders = JSON.parse(savedOrders);
          
          // Find the specific order by ID and verify it belongs to current user
          const foundOrder = parsedOrders.find(
            (order: any) => order.id === orderId && order.userEmail === currentUserEmail
          );
          
          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            toast({
              title: "Order not found",
              description: "We couldn't find this order in your history",
              variant: "destructive",
            });
            navigate('/customer-dashboard');
          }
        } else {
          toast({
            title: "Order not found",
            description: "We couldn't find this order",
            variant: "destructive",
          });
          navigate('/customer-dashboard');
        }
      } catch (error) {
        console.error('Failed to load order details:', error);
        toast({
          title: "Error loading data",
          description: "Failed to load your order details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrderDetails();
  }, [orderId, navigate, toast]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/customer-dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold mb-6">Order Details</h1>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading order details...</p>
          </div>
        ) : order ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <CardTitle className="text-xl">Order #{order.id}</CardTitle>
                    <CardDescription>Placed on {formatDate(order.date)}</CardDescription>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium mt-2 md:mt-0 ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {order.status}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Delivery Address
                    </h3>
                    <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Payment Method
                    </h3>
                    <p className="text-sm text-muted-foreground">{order.paymentMethod}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4 flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Order Items
                  </h3>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center">
                              {item.image && (
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="h-10 w-10 rounded object-cover mr-3"
                                />
                              )}
                              <div>{item.name}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="mt-4 flex justify-end">
                    <div className="bg-muted p-4 rounded-md w-full max-w-xs">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal:</span>
                        <span>₹{order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Shipping:</span>
                        <span>FREE</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2 mt-2">
                        <span>Total:</span>
                        <span>₹{order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Truck className="h-4 w-4 mr-2 text-green-500" />
                      {order.status === 'Delivered' 
                        ? 'Your order has been delivered'
                        : order.status === 'Shipped'
                        ? 'Your order is on the way'
                        : 'Your order is being processed'}
                    </div>
                    
                    <Button 
                      onClick={() => navigate('/products')}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Buy Again
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Order not found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find the order details you're looking for.
              </p>
              <Button 
                onClick={() => navigate('/customer-dashboard')}
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default OrderDetails;
