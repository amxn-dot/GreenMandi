
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Product } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Trash, ArrowRight, Plus, Minus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Sample cart items for demonstration
const SAMPLE_CART_ITEMS: (Product & { quantity: number })[] = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    description: "Organically grown, juicy red tomatoes.",
    price: 40,
    unit: "kg",
    image: "/tomato.jpg",
    category: "Vegetables",
    farmerId: 1,
    farmerName: "Ramesh Farms",
    quantity: 2
  },
  {
    id: 3,
    name: "Organic Potatoes",
    description: "Farm fresh organic potatoes.",
    price: 30,
    unit: "kg",
    image: "/potato.jpg",
    category: "Vegetables",
    farmerId: 3,
    farmerName: "Krishna Farms",
    quantity: 1
  },
  {
    id: 5,
    name: "Fresh Spinach",
    description: "Nutrient-rich spinach leaves.",
    price: 30,
    unit: "bundle",
    image: "/spinach.jpg",
    category: "Vegetables",
    farmerId: 1,
    farmerName: "Ramesh Farms",
    quantity: 1
  },
];

const Cart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<(Product & { quantity: number })[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if user is logged in
    const storedUserType = localStorage.getItem("userType");
    setIsLoggedIn(!!storedUserType);
    setUserType(storedUserType);
    
    if (storedUserType === "customer") {
      // Fetch cart items from localStorage if they exist
      const storedCart = localStorage.getItem("cart"); // Changed from "cartItems" to "cart"
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      } else {
        // Use sample items only if there's no stored cart
        setCartItems(SAMPLE_CART_ITEMS);
      }
    } else if (storedUserType === "farmer") {
      navigate('/farmer-dashboard');
      toast({
        title: "Access denied",
        description: "Farmers cannot access the shopping cart.",
        variant: "destructive"
      });
    } else if (!storedUserType) {
      // If not logged in, redirect to login
      toast({
        title: "Authentication required",
        description: "Please login to view your cart",
        variant: "destructive"
      });
      navigate('/login');
    }
  }, [navigate, toast]);
  
  useEffect(() => {
    // Save cart items to localStorage whenever they change
    if (isLoggedIn && userType === "customer" && cartItems.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cartItems)); // Changed from "cartItems" to "cart"
    }
  }, [cartItems, isLoggedIn, userType]);
  
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  
  const removeItem = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart."
    });
  };
  
  const applyCoupon = () => {
    setIsApplyingCoupon(true);
    
    // Simulate API call
    setTimeout(() => {
      if (couponCode.toLowerCase() === 'fresh10') {
        const subtotal = calculateSubtotal();
        const newDiscount = subtotal * 0.1; // 10% discount
        setDiscount(newDiscount);
        
        toast({
          title: "Coupon applied",
          description: "You got 10% off your order!"
        });
      } else {
        toast({
          title: "Invalid coupon",
          description: "The coupon code you entered is invalid or expired.",
          variant: "destructive"
        });
      }
      setIsApplyingCoupon(false);
    }, 1000);
  };
  
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = subtotal > 0 ? 40 : 0; // Delivery fee is ₹40
    return subtotal + deliveryFee - discount;
  };
  
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to your cart before checking out.",
        variant: "destructive"
      });
      return;
    }
    
    // Make sure cart is saved with the correct key before navigating
    localStorage.setItem("cart", JSON.stringify(cartItems));
    
    // Navigate to checkout page
    navigate('/checkout');
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/products">
              <Button>
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 md:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Items ({cartItems.length})</h2>
                    <Link to="/products">
                      <Button variant="link" className="text-green-500 p-0 h-auto">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex flex-col md:flex-row gap-4 border-b pb-4">
                        <div className="h-24 w-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:justify-between gap-2">
                            <div>
                              <h3 className="font-semibold">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Sold by: {item.farmerName}
                              </p>
                              <p className="text-sm">
                                ₹{item.price}/{item.unit}
                              </p>
                            </div>
                            
                            <div className="flex items-center md:items-start">
                              <div className="flex items-center border rounded-md">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="h-8 w-8 p-0"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 p-0 h-auto"
                            >
                              <Trash className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                            
                            <div className="font-semibold">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>₹40.00</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Enter coupon code" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <Button 
                        variant="outline" 
                        onClick={applyCoupon}
                        disabled={!couponCode || isApplyingCoupon}
                      >
                        {isApplyingCoupon ? "Applying..." : "Apply"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Try code "FRESH10" for 10% off
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-green-500 hover:bg-green-600" 
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Delivery Information</h3>
                <p className="text-sm text-green-700 mb-2">
                  All orders are processed and delivered within 24-48 hours. Delivery slots:
                </p>
                <ul className="text-sm text-green-700 list-disc pl-5 space-y-1">
                  <li>Morning: 7:00 AM - 10:00 AM</li>
                  <li>Afternoon: 12:00 PM - 3:00 PM</li>
                  <li>Evening: 5:00 PM - 8:00 PM</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Cart;
