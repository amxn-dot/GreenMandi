
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, ShoppingBag, ArrowRight, User, Clock, Package } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get order details from location state or create demo data
  const orderDetails = location.state?.orderDetails || {
    orderId: `ORD-${uuidv4().substring(0, 8).toUpperCase()}`,
    date: new Date().toISOString(),
    items: 3,
    total: 166.00,
    deliveryAddress: '123 Main Street, Mumbai, Maharashtra, 400001',
    phone: '+91 98765 43210',
    deliverySlot: 'Morning (7:00 AM - 10:00 AM)',
    paymentMethod: 'Cash on Delivery',
    orderItems: [
      {
        id: 1,
        name: "Fresh Tomatoes",
        price: 40,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop"
      },
      {
        id: 2,
        name: "Alphonso Mangoes",
        price: 350,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1553279768-865429e64d5c?w=400&h=400&fit=crop"
      }
    ]
  };

  useEffect(() => {
    // Check if user is logged in as customer
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');
    
    if (!userType || !userData) {
      toast({
        title: "Please login to continue",
        description: "You need to be logged in to view order details",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (userType !== 'customer') {
      toast({
        title: "Access denied",
        description: "Only customers can view order details",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    // Save order to localStorage if it's from checkout
    if (location.state?.orderDetails) {
      try {
        const currentUser = JSON.parse(userData);

        // Get existing orders or initialize empty array
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');

        // Check if order already exists
        const orderExists = existingOrders.some(
          (order: any) => order.id === orderDetails.orderId
        );

        if (!orderExists) {
          // Consolidate duplicate items in orderItems array
          const consolidatedItems = [];
          const itemMap = new Map();

          if (orderDetails.orderItems && orderDetails.orderItems.length > 0) {
            // Group items by id and consolidate quantities
            orderDetails.orderItems.forEach(item => {
              const itemId = item.id.toString();
              if (itemMap.has(itemId)) {
                const existingItem = itemMap.get(itemId);
                existingItem.quantity += item.quantity;
              } else {
                itemMap.set(itemId, { ...item });
              }
            });

            // Convert map values to array
            itemMap.forEach(item => {
              consolidatedItems.push(item);
            });
          }

          // Update orderDetails with consolidated items
          const updatedOrderDetails = {
            ...orderDetails,
            orderItems: consolidatedItems
          };

          // Prepare order for storage
          const orderForStorage = {
            ...updatedOrderDetails,
            id: updatedOrderDetails.orderId,
            userEmail: currentUser.email,
            status: 'Processing',
            items: updatedOrderDetails.orderItems?.length || updatedOrderDetails.items,
            date: new Date().toISOString()
          };

          // Add new order
          const updatedOrders = [orderForStorage, ...existingOrders];

          // Save back to localStorage
          localStorage.setItem('orders', JSON.stringify(updatedOrders));

          // Save order for farmers to see
          const farmerOrder = {
            id: updatedOrderDetails.orderId,
            date: new Date().toLocaleDateString(),
            customer: currentUser.name || 'Customer',
            customerEmail: currentUser.email,
            customerPhone: updatedOrderDetails.phone,
            items: updatedOrderDetails.orderItems?.length || updatedOrderDetails.items,
            total: updatedOrderDetails.total,
            status: 'New',
            deliveryAddress: updatedOrderDetails.deliveryAddress,
            deliverySlot: updatedOrderDetails.deliverySlot,
            paymentMethod: updatedOrderDetails.paymentMethod,
            orderItems: updatedOrderDetails.orderItems || []
          };

          // Get existing farmer orders or initialize empty array
          const existingFarmerOrders = JSON.parse(localStorage.getItem('farmerOrders') || '[]');

          // Add new order for farmers
          const updatedFarmerOrders = [farmerOrder, ...existingFarmerOrders];

          // Save farmer orders
          localStorage.setItem('farmerOrders', JSON.stringify(updatedFarmerOrders));

          // Clear cart after successful order
          localStorage.removeItem('cart');

          toast({
            title: "Order Placed Successfully",
            description: "Your order has been saved and sent to farmers",
          });
        }
      } catch (err) {
        console.error("Error saving order:", err);
      }
    }
  }, [location.state, orderDetails, navigate, toast]);

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We've received your request and will process it shortly.
            </p>
          </div>
          
          {/* Order Summary Card */}
          <Card className="p-6 mb-6 border-green-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-bold text-lg">{orderDetails.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-bold text-lg text-green-600">₹{orderDetails.total.toFixed(2)}</p>
                </div>
              </div>
              
              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-green-500" />
                  Order Items ({orderDetails.orderItems?.length || orderDetails.items} items)
                </h3>
                <div className="space-y-3">
                  {orderDetails.orderItems?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="h-12 w-12 rounded object-cover mr-3"
                        />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Delivery Details */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Delivery Address</p>
                    <p className="text-muted-foreground">{orderDetails.deliveryAddress}</p>
                    <p className="text-muted-foreground">{orderDetails.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Delivery Slot</p>
                    <p className="text-muted-foreground">{orderDetails.deliverySlot}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <ShoppingBag className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Payment Method</p>
                    <p className="text-muted-foreground">{orderDetails.paymentMethod}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {/* What's Next Section */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-1 rounded-full">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">What happens next?</p>
                <p className="text-sm text-green-700">
                  Our farmer partners will prepare your fresh produce and deliver it to your doorstep 
                  according to your selected time slot. You'll receive SMS updates about your order status.
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/customer-dashboard">
              <Button variant="outline" className="w-full">
                <User className="mr-2 h-4 w-4" />
                View Your Orders
              </Button>
            </Link>
            <Link to="/products">
              <Button className="w-full bg-green-500 hover:bg-green-600">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderSuccess;
