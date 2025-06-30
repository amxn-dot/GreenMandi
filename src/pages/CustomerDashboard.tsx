import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, MapPin, Clock, ArrowRight, Calendar, Package, Heart, Settings, ShoppingBag, UserRound, Plus, Trash, Edit3, Phone, Mail, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Badge } from '@/components/ui/badge';

interface Order {
  id: string;
  date: string;
  status: 'Delivered' | 'Processing' | 'Shipped';
  total: number;
  items: number;
  deliveryAddress?: string;
  paymentMethod?: string;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  address: string;
  userType: string;
  farmName?: string;
  farmLocation?: string;
  farmDescription?: string;
}

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
  userEmail: string;
}

// Address form schema
const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(6, "Valid ZIP code is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  isDefault: z.boolean().default(false)
});

type AddressFormValues = z.infer<typeof addressSchema>;

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [activeTab, setActiveTab] = useState('orders');
  
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  
  // Initialize the form
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      isDefault: false
    }
  });
  
  useEffect(() => {
    // Check if user is logged in
    const userType = localStorage.getItem('userType');
    if (!userType || userType !== 'customer') {
      toast({
        title: "Authentication required",
        description: "Please login to access your dashboard",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    // Load user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
    }
    
    // Load addresses from localStorage
    const storedAddresses = localStorage.getItem('userAddresses');
    if (storedAddresses) {
      const parsedAddresses = JSON.parse(storedAddresses);
      // Filter addresses for current user
      const currentUserEmail = JSON.parse(localStorage.getItem('userData') || '{}').email;
      const userAddresses = parsedAddresses.filter(
        (addr: Address) => addr.userEmail === currentUserEmail
      );
      setAddresses(userAddresses);
    } else {
      // Initialize with default address if user has address in profile
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (userData.address) {
        const defaultAddress: Address = {
          id: `addr_${Date.now()}`,
          name: userData.name || 'Default Address',
          street: userData.address || '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          phone: userData.phone || '+91 98765 43210',
          isDefault: true,
          userEmail: userData.email
        };
        
        const newAddresses = [defaultAddress];
        setAddresses(newAddresses);
        localStorage.setItem('userAddresses', JSON.stringify(newAddresses));
      }
    }
    
    // Load real orders from localStorage
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for loading indicator
        
        // Get orders from localStorage
        const savedOrders = localStorage.getItem('orders');
        if (savedOrders) {
          const parsedOrders = JSON.parse(savedOrders);
          
          // Get user email to filter orders for the current user
          const currentUserEmail = JSON.parse(localStorage.getItem('userData') || '{}').email;
          
          // Filter orders for current user and sort by date (newest first)
          const userOrders = parsedOrders
            .filter((order: any) => order.userEmail === currentUserEmail)
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
          setOrders(userOrders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error('Failed to load orders:', error);
        toast({
          title: "Error loading data",
          description: "Failed to load your order history",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrders();
  }, [navigate, toast]);

  // Handle tab navigation
  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  // Handle opening the add address dialog
  const openAddAddressDialog = () => {
    form.reset({
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      isDefault: false
    });
    setEditingAddressId(null);
    setIsAddressDialogOpen(true);
  };

  // Handle opening the edit address dialog
  const openEditAddressDialog = (address: Address) => {
    form.reset({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      phone: address.phone,
      isDefault: address.isDefault
    });
    setEditingAddressId(address.id);
    setIsAddressDialogOpen(true);
  };

  // Handle form submission for adding/editing an address
  const onSubmitAddress = (data: AddressFormValues) => {
    try {
      const currentUserEmail = JSON.parse(localStorage.getItem('userData') || '{}').email;
      
      // Create new address object with proper typing
      const newAddress: Address = {
        id: editingAddressId || `addr_${Date.now()}`,
        name: data.name,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        phone: data.phone,
        isDefault: data.isDefault,
        userEmail: currentUserEmail
      };
      
      // Update addresses state and localStorage
      let updatedAddresses: Address[];
      
      if (editingAddressId) {
        // Editing existing address
        updatedAddresses = addresses.map(addr => 
          addr.id === editingAddressId ? newAddress : addr
        );
        
        toast({
          title: "Address updated",
          description: "Your address has been updated successfully",
        });
      } else {
        // Adding new address
        updatedAddresses = [...addresses, newAddress];
        
        toast({
          title: "Address added",
          description: "Your new address has been added successfully",
        });
      }
      
      // If this is set as default, update other addresses
      if (data.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === newAddress.id
        }));
      }
      
      // Update state and localStorage
      setAddresses(updatedAddresses);
      
      // Get all user addresses
      const allStoredAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
      const otherUserAddresses = allStoredAddresses.filter(
        (addr: Address) => addr.userEmail !== currentUserEmail
      );
      
      // Combine with updated addresses
      const combinedAddresses = [...otherUserAddresses, ...updatedAddresses];
      localStorage.setItem('userAddresses', JSON.stringify(combinedAddresses));
      
      // Close the dialog
      setIsAddressDialogOpen(false);
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Error",
        description: "Failed to save address. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle deleting an address
  const handleDeleteAddress = (addressId: string) => {
    try {
      // Filter out the address to be deleted
      const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
      
      // If the deleted address was the default and we have other addresses,
      // set the first one as default
      if (updatedAddresses.length > 0 && !updatedAddresses.some(addr => addr.isDefault)) {
        updatedAddresses[0].isDefault = true;
      }
      
      // Update state
      setAddresses(updatedAddresses);
      
      // Update localStorage
      const currentUserEmail = JSON.parse(localStorage.getItem('userData') || '{}').email;
      const allStoredAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
      const otherUserAddresses = allStoredAddresses.filter(
        (addr: Address) => addr.userEmail !== currentUserEmail
      );
      
      const combinedAddresses = [...otherUserAddresses, ...updatedAddresses];
      localStorage.setItem('userAddresses', JSON.stringify(combinedAddresses));
      
      toast({
        title: "Address deleted",
        description: "The address has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle setting an address as default
  const setDefaultAddress = (addressId: string) => {
    try {
      // Update all addresses, setting isDefault to true for the selected address only
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }));
      
      // Update state
      setAddresses(updatedAddresses);
      
      // Update localStorage
      const currentUserEmail = JSON.parse(localStorage.getItem('userData') || '{}').email;
      const allStoredAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
      const otherUserAddresses = allStoredAddresses.filter(
        (addr: Address) => addr.userEmail !== currentUserEmail
      );
      
      const combinedAddresses = [...otherUserAddresses, ...updatedAddresses];
      localStorage.setItem('userAddresses', JSON.stringify(combinedAddresses));
      
      toast({
        title: "Default address updated",
        description: "Your default delivery address has been updated",
      });
    } catch (error) {
      console.error('Error setting default address:', error);
      toast({
        title: "Error",
        description: "Failed to update default address. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-orange-50/30">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          {/* Enhanced Header Section */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  Welcome Back!
                </h1>
                {userData && (
                  <div className="space-y-1">
                    <p className="text-xl text-muted-foreground">Hello, {userData.name} 👋</p>
                    <p className="text-sm text-muted-foreground">Manage your orders, addresses, and account settings</p>
                  </div>
                )}
              </div>
              
              {/* Quick Stats Cards */}
              <div className="flex gap-4">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <Package className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{orders.length}</div>
                    <div className="text-xs opacity-90">Total Orders</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <MapPin className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{addresses.length}</div>
                    <div className="text-xs opacity-90">Saved Addresses</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 absolute top-0 left-0"></div>
              </div>
              <p className="mt-6 text-lg text-muted-foreground">Loading your dashboard...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Enhanced Sidebar */}
              <div className="xl:col-span-1 space-y-6">
                {/* User Profile Card */}
                {userData && (
                  <Card className="bg-gradient-to-br from-white to-green-50/30 border border-green-100 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                            <UserRound className="h-10 w-10 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg">{userData.name}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="h-3 w-3 mr-1" />
                            {userData.email}
                          </div>
                          {userData.phone && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="h-3 w-3 mr-1" />
                              {userData.phone}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                          Premium Customer
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Enhanced Navigation */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-2">
                    <div className="space-y-1">
                      <Button
                        variant={activeTab === 'orders' ? 'default' : 'ghost'}
                        className={`w-full justify-start ${
                          activeTab === 'orders' 
                            ? 'bg-green-500 text-white shadow-md' 
                            : 'hover:bg-green-50 text-gray-700'
                        } transition-all duration-200 rounded-lg p-3`}
                        onClick={() => handleTabChange('orders')}
                      >
                        <ShoppingBag className="mr-3 h-4 w-4" />
                        My Orders
                      </Button>
                      
                      <Button
                        variant={activeTab === 'address' ? 'default' : 'ghost'}
                        className={`w-full justify-start ${
                          activeTab === 'address' 
                            ? 'bg-orange-500 text-white shadow-md' 
                            : 'hover:bg-orange-50 text-gray-700'
                        } transition-all duration-200 rounded-lg p-3`}
                        onClick={() => handleTabChange('address')}
                      >
                        <MapPin className="mr-3 h-4 w-4" />
                        Addresses
                      </Button>
                      
                      <Button
                        variant={activeTab === 'wishlist' ? 'default' : 'ghost'}
                        className={`w-full justify-start ${
                          activeTab === 'wishlist' 
                            ? 'bg-pink-500 text-white shadow-md' 
                            : 'hover:bg-pink-50 text-gray-700'
                        } transition-all duration-200 rounded-lg p-3`}
                        onClick={() => handleTabChange('wishlist')}
                      >
                        <Heart className="mr-3 h-4 w-4" />
                        Wishlist
                      </Button>
                      
                      <Button
                        variant={activeTab === 'settings' ? 'default' : 'ghost'}
                        className={`w-full justify-start ${
                          activeTab === 'settings' 
                            ? 'bg-gray-600 text-white shadow-md' 
                            : 'hover:bg-gray-50 text-gray-700'
                        } transition-all duration-200 rounded-lg p-3`}
                        onClick={() => handleTabChange('settings')}
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Help Card */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-blue-900">Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-blue-700">
                      Our customer support team is here to help you with any questions.
                    </p>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Contact Support
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Content Area */}
              <div className="xl:col-span-3">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                  {/* Orders Tab */}
                  <TabsContent value="orders" className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
                        <p className="text-muted-foreground">Track and manage your orders</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="border-green-200 text-green-700 hover:bg-green-50"
                        onClick={() => navigate('/products')}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Continue Shopping
                      </Button>
                    </div>
                    
                    {orders.length > 0 ? (
                      <div className="grid gap-6">
                        {orders.map((order) => (
                          <Card key={order.id} className="shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300">
                            <CardContent className="p-6">
                              <div className="flex flex-col lg:flex-row justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-lg">{order.id}</h3>
                                    <Badge className={
                                      order.status === 'Delivered' ? 'bg-green-100 text-green-800 border-green-200' :
                                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                      'bg-orange-100 text-orange-800 border-orange-200'
                                    }>
                                      {order.status}
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center text-muted-foreground">
                                      <Calendar className="h-4 w-4 mr-2 text-green-600" />
                                      <span>Order Date: {order.date}</span>
                                    </div>
                                    <div className="flex items-center text-muted-foreground">
                                      <Package className="h-4 w-4 mr-2 text-blue-600" />
                                      <span>{order.items} items</span>
                                    </div>
                                    {order.deliveryAddress && (
                                      <div className="flex items-start text-muted-foreground md:col-span-2">
                                        <MapPin className="h-4 w-4 mr-2 mt-0.5 text-orange-600" />
                                        <span className="line-clamp-2">Delivery: {order.deliveryAddress}</span>
                                      </div>
                                    )}
                                    {order.paymentMethod && (
                                      <div className="flex items-center text-muted-foreground">
                                        <CreditCard className="h-4 w-4 mr-2 text-purple-600" />
                                        <span>Payment: {order.paymentMethod}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-end justify-between min-w-[150px]">
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-green-600">₹{order.total.toFixed(2)}</p>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-green-200 text-green-700 hover:bg-green-50"
                                    onClick={() => navigate(`/order-details/${order.id}`)}
                                  >
                                    View Details
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
                            <ShoppingCart className="h-12 w-12 text-green-600" />
                          </div>
                          <h3 className="text-xl font-bold mb-2">No orders yet</h3>
                          <p className="text-muted-foreground text-center mb-6 max-w-md">
                            Start your fresh journey with us! Browse our premium selection of farm-fresh products.
                          </p>
                          <Button 
                            onClick={() => navigate('/products')}
                            className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                          >
                            Explore Products
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                  
                  {/* Address Tab */}
                  <TabsContent value="address">
                    <Card className="shadow-lg border-0">
                      <CardHeader className="border-b border-gray-100">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-2xl">Delivery Addresses</CardTitle>
                            <CardDescription className="text-base">
                              Manage your delivery locations for faster checkout
                            </CardDescription>
                          </div>
                          <Button 
                            onClick={openAddAddressDialog} 
                            className="bg-green-600 hover:bg-green-700 shadow-lg"
                          >
                            <Plus className="h-4 w-4 mr-2" /> 
                            Add Address
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        {addresses.length > 0 ? (
                          <div className="grid gap-6">
                            {addresses.map((address) => (
                              <Card key={address.id} className="border border-gray-200 hover:border-green-300 transition-colors">
                                <CardContent className="p-6">
                                  <div className="flex justify-between items-start">
                                    <div className="space-y-3 flex-1">
                                      <div className="flex items-center gap-3">
                                        <h4 className="font-bold text-lg">{address.name}</h4>
                                        {address.isDefault && (
                                          <Badge className="bg-green-100 text-green-800 border-green-200">
                                            Default
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="space-y-1 text-muted-foreground">
                                        <p className="font-medium">{address.street}</p>
                                        <p>{address.city}, {address.state} {address.zipCode}</p>
                                        <div className="flex items-center">
                                          <Phone className="h-3 w-3 mr-2" />
                                          <span>{address.phone}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-2 ml-4">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => openEditAddressDialog(address)}
                                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                      >
                                        <Edit3 className="h-4 w-4 mr-1" />
                                        Edit
                                      </Button>
                                      {!address.isDefault && (
                                        <>
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setDefaultAddress(address.id)}
                                            className="border-green-200 text-green-700 hover:bg-green-50"
                                          >
                                            Set Default
                                          </Button>
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleDeleteAddress(address.id)}
                                            className="border-red-200 text-red-700 hover:bg-red-50"
                                          >
                                            <Trash className="h-4 w-4" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-16">
                            <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
                              <MapPin className="h-12 w-12 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No addresses saved</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                              Add your delivery addresses to make checkout faster and easier.
                            </p>
                            <Button 
                              onClick={openAddAddressDialog} 
                              className="bg-orange-600 hover:bg-orange-700 shadow-lg"
                            >
                              Add Your First Address
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Wishlist Tab */}
                  <TabsContent value="wishlist">
                    <Card className="shadow-lg border-0">
                      <CardHeader className="border-b border-gray-100">
                        <CardTitle className="text-2xl">My Wishlist</CardTitle>
                        <CardDescription className="text-base">
                          Your favorite products saved for later
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-16">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="w-24 h-24 rounded-full bg-pink-100 flex items-center justify-center mb-6">
                            <Heart className="h-12 w-12 text-pink-600" />
                          </div>
                          <h3 className="text-xl font-bold mb-2">Your wishlist is empty</h3>
                          <p className="text-muted-foreground max-w-md mb-6">
                            Browse our fresh products and click the heart icon to save your favorites for later.
                          </p>
                          <Button 
                            onClick={() => navigate('/products')}
                            className="bg-pink-600 hover:bg-pink-700 shadow-lg"
                          >
                            Browse Products
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Settings Tab */}
                  <TabsContent value="settings">
                    <Card className="shadow-lg border-0">
                      <CardHeader className="border-b border-gray-100">
                        <CardTitle className="text-2xl">Account Settings</CardTitle>
                        <CardDescription className="text-base">
                          Manage your account preferences and security
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 space-y-8">
                        {/* Profile Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                            <div>
                              <h4 className="font-bold text-blue-900">Profile Information</h4>
                              <p className="text-blue-700">
                                Update your account's profile information and email address.
                              </p>
                            </div>
                            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                              Update Profile
                            </Button>
                          </div>
                        </div>
                        
                        {/* Security Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                            <div>
                              <h4 className="font-bold text-green-900">Change Password</h4>
                              <p className="text-green-700">
                                Ensure your account is using a secure password.
                              </p>
                            </div>
                            <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                              Change Password
                            </Button>
                          </div>
                        </div>
                        
                        {/* Notifications Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                            <div>
                              <h4 className="font-bold text-orange-900">Notification Preferences</h4>
                              <p className="text-orange-700">
                                Manage how we contact you about updates and promotions.
                              </p>
                            </div>
                            <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                              Update Preferences
                            </Button>
                          </div>
                        </div>
                        
                        {/* Danger Zone */}
                        <div className="border-t border-red-200 pt-8">
                          <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                            <h4 className="font-bold text-red-900 mb-2">Danger Zone</h4>
                            <p className="text-red-700 mb-4">
                              Permanently delete your account and all of your data. This action cannot be undone.
                            </p>
                            <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Address Dialog - Enhanced */}
      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingAddressId ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitAddress)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="ZIP Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-green-200 bg-green-50/50 p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 mt-1 rounded border-green-300 text-green-600 focus:ring-green-500"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-green-900">
                        Set as default address
                      </FormLabel>
                      <p className="text-sm text-green-700">
                        This address will be used as your default delivery location
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddressDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingAddressId ? 'Update Address' : 'Save Address'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default CustomerDashboard;
