import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Check, CreditCard, Calendar, MapPin, Plus, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { v4 as uuidv4 } from 'uuid';

interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');
  const [onlinePaymentType, setOnlinePaymentType] = useState<string>('card');
  const [deliverySlot, setDeliverySlot] = useState<string>('morning');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddressFormComplete, setIsAddressFormComplete] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState({
    subtotal: 0,
    deliveryFee: 40,
    discount: 0,
    total: 0
  });
  
  // Address form
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    email: '',
  });
  
  // Load saved addresses on component mount
  useEffect(() => {
    // Check authentication
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');
    
    if (!userType || !userData) {
      toast({
        title: "Please login to continue",
        description: "You need to be logged in to checkout",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (userType !== 'customer') {
      toast({
        title: "Access denied",
        description: "Only customers can checkout",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    // Load cart items
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
    
    // Calculate totals
    const subtotal = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const discount = subtotal > 100 ? subtotal * 0.1 : 0; // 10% discount for orders over ₹100
    const total = subtotal + 40 - discount; // Add delivery fee, subtract discount
    
    setCartTotal({
      subtotal,
      deliveryFee: 40,
      discount,
      total
    });

    // Load user data and prefill email
    const parsedUserData = JSON.parse(userData);
    setAddressForm(prev => ({ ...prev, email: parsedUserData.email || '' }));
    
    // Load saved addresses
    const savedAddressesList = localStorage.getItem(`savedAddresses_${parsedUserData.email}`);
    
    if (savedAddressesList) {
      const parsedAddresses: SavedAddress[] = JSON.parse(savedAddressesList);
      setSavedAddresses(parsedAddresses);
      
      if (parsedAddresses.length > 0) {
        // Find default address first
        const defaultAddress = parsedAddresses.find(addr => addr.isDefault);
        const addressToSelect = defaultAddress || parsedAddresses[0];
        
        setSelectedAddressId(addressToSelect.id);
        populateAddressForm(addressToSelect);
        setShowAddressForm(false);
        setIsAddressFormComplete(true);
      } else {
        setShowAddressForm(true);
        setIsAddressFormComplete(false);
      }
    } else {
      setShowAddressForm(true);
      setIsAddressFormComplete(false);
    }
  }, [navigate, toast]);
  
  // Populate address form with selected address
  const populateAddressForm = (address: SavedAddress) => {
    setAddressForm({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      email: addressForm.email,
    });
  };
  
  // Select a saved address
  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      populateAddressForm(selectedAddress);
      setIsAddressFormComplete(true);
    }
  };
  
  // Toggle address form visibility
  const handleAddNewAddress = () => {
    setShowAddressForm(true);
    setSelectedAddressId(null);
    setAddressForm({
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      email: addressForm.email,
    });
    setIsAddressFormComplete(false);
  };
  
  // Make an address the default
  const handleSetDefaultAddress = (addressId: string) => {
    const updatedAddresses = savedAddresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    
    setSavedAddresses(updatedAddresses);
    
    // Update in local storage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      localStorage.setItem(`savedAddresses_${parsedUserData.email}`, JSON.stringify(updatedAddresses));
    }
  };
  
  // Delete a saved address
  const handleDeleteAddress = (addressId: string) => {
    const updatedAddresses = savedAddresses.filter(addr => addr.id !== addressId);
    setSavedAddresses(updatedAddresses);
    
    // If the deleted address was selected, reset selection
    if (selectedAddressId === addressId) {
      if (updatedAddresses.length > 0) {
        const firstAddress = updatedAddresses[0];
        setSelectedAddressId(firstAddress.id);
        populateAddressForm(firstAddress);
      } else {
        setSelectedAddressId(null);
        setShowAddressForm(true);
        setIsAddressFormComplete(false);
      }
    }
    
    // Update in local storage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      localStorage.setItem(`savedAddresses_${parsedUserData.email}`, JSON.stringify(updatedAddresses));
    }
  };
  
  // Handle changes to address form
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({ ...prev, [name]: value }));
    
    // Check if all required fields are filled
    const requiredFields = ['fullName', 'phone', 'address', 'city', 'state', 'pincode'];
    const isComplete = requiredFields.every(field => 
      field === name ? value : addressForm[field as keyof typeof addressForm]
    );
    setIsAddressFormComplete(isComplete);
  };
  
  const getDeliverySlotText = (slot: string) => {
    switch(slot) {
      case 'morning': return 'Morning (7:00 AM - 10:00 AM)';
      case 'afternoon': return 'Afternoon (12:00 PM - 3:00 PM)';
      case 'evening': return 'Evening (5:00 PM - 8:00 PM)';
      default: return 'Morning (7:00 AM - 10:00 AM)';
    }
  };
  
  const handlePlaceOrder = async () => {
    if (!isAddressFormComplete) {
      toast({
        title: "Incomplete address",
        description: "Please fill in all required address fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to your cart before checkout.",
        variant: "destructive"
      });
      return;
    }
    
    // Save address if option is selected
    if (saveAddress && showAddressForm) {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        const newAddress: SavedAddress = {
          id: `addr_${Date.now()}`,
          fullName: addressForm.fullName,
          phone: addressForm.phone,
          address: addressForm.address,
          city: addressForm.city,
          state: addressForm.state,
          pincode: addressForm.pincode,
          isDefault: savedAddresses.length === 0,
        };
        
        const updatedAddresses = [...savedAddresses, newAddress];
        setSavedAddresses(updatedAddresses);
        localStorage.setItem(`savedAddresses_${parsedUserData.email}`, JSON.stringify(updatedAddresses));
      }
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create order details
      const orderDetails = {
        orderId: `ORD-${uuidv4().substring(0, 8).toUpperCase()}`,
        date: new Date().toISOString(),
        total: cartTotal.total,
        deliveryAddress: `${addressForm.address}, ${addressForm.city}, ${addressForm.state} ${addressForm.pincode}`,
        phone: addressForm.phone,
        deliverySlot: getDeliverySlotText(deliverySlot),
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : `Online Payment (${onlinePaymentType})`,
        orderItems: cartItems
      };
      
      toast({
        title: "Order placed successfully!",
        description: "Your order has been received and is being processed.",
      });
      
      // Clear cart after successful order
      localStorage.removeItem('cart');
      
      // Navigate to success page with order details
      navigate('/order-success', { state: { orderDetails } });
    } catch (error) {
      toast({
        title: "Error placing order",
        description: "There was a problem processing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground mb-8">Complete your order by providing the details below</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="h-5 w-5 text-green-500" />
                  <h2 className="text-xl font-semibold">Delivery Address</h2>
                </div>
                
                {/* Saved Addresses Section */}
                {savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-lg">Saved Addresses</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleAddNewAddress}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add New Address
                      </Button>
                    </div>
                    
                    <RadioGroup 
                      value={selectedAddressId || ''} 
                      onValueChange={handleSelectAddress}
                      className="space-y-3"
                    >
                      {savedAddresses.map((address) => (
                        <div 
                          key={address.id}
                          className={`border p-4 rounded-md cursor-pointer transition-all ${
                            selectedAddressId === address.id 
                              ? 'border-green-500 bg-green-50' 
                              : 'hover:border-green-200'
                          }`}
                        >
                          <div className="flex justify-between">
                            <div className="flex items-center">
                              <RadioGroupItem 
                                value={address.id}
                                id={`address-${address.id}`}
                                className="mr-2"
                              />
                              <Label htmlFor={`address-${address.id}`} className="cursor-pointer">
                                <div>
                                  <p className="font-medium">{address.fullName} {address.isDefault && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full ml-2">Default</span>}</p>
                                  <p className="text-sm text-muted-foreground">{address.address}</p>
                                  <p className="text-sm text-muted-foreground">{address.city}, {address.state} {address.pincode}</p>
                                  <p className="text-sm text-muted-foreground">Phone: {address.phone}</p>
                                </div>
                              </Label>
                            </div>
                            <div className="flex flex-col space-y-1">
                              {!address.isDefault && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetDefaultAddress(address.id);
                                  }}
                                >
                                  Set as Default
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAddress(address.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}
                
                {/* New Address Form */}
                {(showAddressForm || savedAddresses.length === 0) && (
                  <>
                    {savedAddresses.length > 0 && (
                      <div className="mb-4">
                        <h3 className="font-medium mb-2">New Address</h3>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={addressForm.fullName}
                          onChange={handleAddressChange}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={addressForm.phone}
                          onChange={handleAddressChange}
                          placeholder="+91 98765 43210"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={addressForm.address}
                        onChange={handleAddressChange}
                        placeholder="Street address, apartment, etc."
                        rows={3}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                        <Input
                          id="city"
                          name="city"
                          value={addressForm.city}
                          onChange={handleAddressChange}
                          placeholder="Mumbai"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                        <Input
                          id="state"
                          name="state"
                          value={addressForm.state}
                          onChange={handleAddressChange}
                          placeholder="Maharashtra"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode <span className="text-red-500">*</span></Label>
                        <Input
                          id="pincode"
                          name="pincode"
                          value={addressForm.pincode}
                          onChange={handleAddressChange}
                          placeholder="400001"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="email">Email (for order updates)</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={addressForm.email}
                        onChange={handleAddressChange}
                        placeholder="you@example.com"
                      />
                    </div>
                    
                    <div className="mt-4 flex items-center space-x-2">
                      <Checkbox 
                        id="saveAddress" 
                        checked={saveAddress}
                        onCheckedChange={(checked) => setSaveAddress(checked as boolean)}
                      />
                      <Label htmlFor="saveAddress" className="text-sm cursor-pointer">
                        Save this address for future orders
                      </Label>
                    </div>
                  </>
                )}
              </div>
              
              {/* Delivery Time */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <h2 className="text-xl font-semibold">Delivery Time</h2>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose your preferred delivery slot (all orders are delivered within 24-48 hours):
                  </p>
                  
                  <RadioGroup 
                    value={deliverySlot} 
                    onValueChange={setDeliverySlot}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3"
                  >
                    <Label htmlFor="morning" className={`border rounded-lg p-4 cursor-pointer hover:bg-green-50 hover:border-green-200 ${
                      deliverySlot === "morning" ? "bg-green-50 border-green-500" : ""
                    }`}>
                      <RadioGroupItem value="morning" id="morning" className="sr-only" />
                      <div className="flex flex-col">
                        <span className="font-medium">Morning</span>
                        <span className="text-muted-foreground text-sm">7:00 AM - 10:00 AM</span>
                      </div>
                    </Label>
                    
                    <Label htmlFor="afternoon" className={`border rounded-lg p-4 cursor-pointer hover:bg-green-50 hover:border-green-200 ${
                      deliverySlot === "afternoon" ? "bg-green-50 border-green-500" : ""
                    }`}>
                      <RadioGroupItem value="afternoon" id="afternoon" className="sr-only" />
                      <div className="flex flex-col">
                        <span className="font-medium">Afternoon</span>
                        <span className="text-muted-foreground text-sm">12:00 PM - 3:00 PM</span>
                      </div>
                    </Label>
                    
                    <Label htmlFor="evening" className={`border rounded-lg p-4 cursor-pointer hover:bg-green-50 hover:border-green-200 ${
                      deliverySlot === "evening" ? "bg-green-50 border-green-500" : ""
                    }`}>
                      <RadioGroupItem value="evening" id="evening" className="sr-only" />
                      <div className="flex flex-col">
                        <span className="font-medium">Evening</span>
                        <span className="text-muted-foreground text-sm">5:00 PM - 8:00 PM</span>
                      </div>
                    </Label>
                  </RadioGroup>
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="h-5 w-5 text-green-500" />
                  <h2 className="text-xl font-semibold">Payment Method</h2>
                </div>
                
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-4">
                    <Label htmlFor="cod" className={`flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:bg-green-50 hover:border-green-200 ${
                      paymentMethod === "cod" ? "bg-green-50 border-green-500" : ""
                    }`}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cod" id="cod" />
                        <span className="font-medium">Cash on Delivery</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pay when you receive your order
                      </div>
                    </Label>
                    
                    <div className={`flex flex-col border rounded-lg p-4 cursor-pointer hover:bg-green-50 hover:border-green-200 ${
                      paymentMethod === "online" ? "bg-green-50 border-green-500" : ""
                    }`}>
                      <Label htmlFor="online" className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="online" id="online" />
                          <span className="font-medium">Online Payment</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Cards, UPI, Wallets, & Net Banking
                        </div>
                      </Label>
                      
                      {/* Online Payment Options */}
                      {paymentMethod === "online" && (
                        <div className="mt-4 pl-6">
                          <p className="text-sm mb-3 font-medium">Select a payment method:</p>
                          <RadioGroup 
                            value={onlinePaymentType} 
                            onValueChange={setOnlinePaymentType}
                            className="space-y-3"
                          >
                            <Label htmlFor="card" className="flex items-center space-x-2 p-2 border rounded cursor-pointer">
                              <RadioGroupItem value="card" id="card" />
                              <div className="flex items-center">
                                <img src="https://cdn.jsdelivr.net/gh/payment-logos/payment-logos@master/logos/visa/visa.svg" 
                                     alt="Visa" className="h-6 mr-2" />
                                <img src="https://cdn.jsdelivr.net/gh/payment-logos/payment-logos@master/logos/mastercard/mastercard.svg" 
                                     alt="Mastercard" className="h-6 mr-2" />
                                <img src="https://cdn.jsdelivr.net/gh/payment-logos/payment-logos@master/logos/amex/amex.svg" 
                                     alt="American Express" className="h-6" />
                              </div>
                              <span className="ml-2">Credit / Debit Card</span>
                            </Label>
                            
                            <Label htmlFor="upi" className="flex items-center space-x-2 p-2 border rounded cursor-pointer">
                              <RadioGroupItem value="upi" id="upi" />
                              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" 
                                   alt="UPI" className="h-6 mr-2" />
                              <span>UPI</span>
                            </Label>
                            
                            <Label htmlFor="netbanking" className="flex items-center space-x-2 p-2 border rounded cursor-pointer">
                              <RadioGroupItem value="netbanking" id="netbanking" />
                              <span>Net Banking</span>
                            </Label>
                            
                            <Label htmlFor="wallet" className="flex items-center space-x-2 p-2 border rounded cursor-pointer">
                              <RadioGroupItem value="wallet" id="wallet" />
                              <span>Mobile Wallets</span>
                              <div className="flex items-center ml-2">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" 
                                    alt="Google Pay" className="h-4 mr-2" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg"
                                    alt="Paytm" className="h-4 mr-2" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg"
                                    alt="PhonePe" className="h-4" />
                              </div>
                            </Label>
                          </RadioGroup>
                          
                          {/* Additional input fields based on selected payment type */}
                          {onlinePaymentType === "card" && (
                            <div className="mt-4 space-y-3">
                              <div>
                                <Label htmlFor="cardNumber">Card Number</Label>
                                <Input 
                                  id="cardNumber"
                                  placeholder="1234 5678 9012 3456"
                                  className="mt-1"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor="expiry">Expiry (MM/YY)</Label>
                                  <Input 
                                    id="expiry"
                                    placeholder="MM/YY"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="cvv">CVV</Label>
                                  <Input 
                                    id="cvv"
                                    placeholder="123"
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="nameOnCard">Name on Card</Label>
                                <Input 
                                  id="nameOnCard"
                                  placeholder="John Doe"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}
                          
                          {onlinePaymentType === "upi" && (
                            <div className="mt-4">
                              <Label htmlFor="upiId">UPI ID</Label>
                              <Input 
                                id="upiId"
                                placeholder="name@upi"
                                className="mt-1"
                              />
                            </div>
                          )}
                          
                          {onlinePaymentType === "netbanking" && (
                            <div className="mt-4 space-y-3">
                              <Label>Select your bank</Label>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                {["SBI", "HDFC", "ICICI", "Axis", "PNB", "BoB"].map((bank) => (
                                  <Button 
                                    key={bank}
                                    variant="outline" 
                                    className="justify-start"
                                  >
                                    {bank} Bank
                                  </Button>
                                ))}
                                <Button variant="outline" className="justify-start">
                                  Other Banks
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {onlinePaymentType === "wallet" && (
                            <div className="mt-4 space-y-3">
                              <Label>Select your wallet</Label>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                {[
                                  { name: "Google Pay", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" },
                                  { name: "Paytm", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" },
                                  { name: "PhonePe", logo: "https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" },
                                  { name: "Amazon Pay", logo: "" },
                                ].map((wallet) => (
                                  <Button 
                                    key={wallet.name}
                                    variant="outline" 
                                    className="justify-start"
                                  >
                                    {wallet.logo && (
                                      <img src={wallet.logo} alt={wallet.name} className="h-4 mr-2" />
                                    )}
                                    {wallet.name}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <div className="p-1 bg-green-50 rounded-full mr-2">
                                <Check className="h-3 w-3 text-green-500" />
                              </div>
                              All transactions are secure and encrypted
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{cartTotal.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>₹{cartTotal.deliveryFee.toFixed(2)}</span>
                  </div>
                  
                  {cartTotal.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount (10%)</span>
                      <span>-₹{cartTotal.discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{cartTotal.total.toFixed(2)}</span>
                  </div>
                  
                  <Button 
                    className="w-full bg-green-500 hover:bg-green-600" 
                    disabled={isProcessing || !isAddressFormComplete || cartItems.length === 0}
                    onClick={handlePlaceOrder}
                  >
                    {isProcessing ? "Processing..." : `Place Order • ₹${cartTotal.total.toFixed(2)}`}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    By placing your order, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;
