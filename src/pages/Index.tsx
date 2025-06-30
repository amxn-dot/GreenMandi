
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Users, Leaf, TrendingUp, Package, BarChart3, ArrowRight, Star, Heart, Shield, Truck, Clock } from 'lucide-react';
import ProductCard, { Product } from '@/components/ProductCard';
import { useToast } from '@/hooks/use-toast';

// Mock featured products with proper placeholder images
const FEATURED_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    description: "Organically grown, juicy red tomatoes. Perfectly ripened and handpicked.",
    price: 40,
    unit: "kg",
    image: "https://alphaveggies.com/wp-content/uploads/2023/06/fresh-tomatoes-2-scaled.jpg",
    category: "Vegetables",
    farmerId: 1,
    farmerName: "Ramesh Farms"
  },
  {
    id: 2,
    name: "Alphonso Mangoes",
    description: "Premium quality Alphonso mangoes from the farms of Ratnagiri.",
    price: 350,
    unit: "dozen",
    image: "https://alphonsomango.in/cdn/shop/articles/img-1738571803380_91c02d8c-8a6e-4357-8120-c25ecd8ceb71.jpg?v=1741529236",
    category: "Fruits",
    farmerId: 2,
    farmerName: "Shanti Orchards"
  },
  {
    id: 3,
    name: "Organic Potatoes",
    description: "Farm fresh organic potatoes. Perfect for all your cooking needs.",
    price: 30,
    unit: "kg",
    image: "https://5.imimg.com/data5/SELLER/Default/2025/3/498427539/BW/WM/VT/226952059/0-500x500.jpg",
    category: "Vegetables",
    farmerId: 3,
    farmerName: "Krishna Farms"
  },
  {
    id: 4,
    name: "Green Apples",
    description: "Crisp and tart green apples grown in the Himalayan foothills.",
    price: 180,
    unit: "kg",
    image: "https://cdn.mos.cms.futurecdn.net/uW9uHvW5LUYBaoZuSyEsXP.jpg",
    category: "Fruits",
    farmerId: 4,
    farmerName: "Mountain Valley Farms"
  }
];

// Best selling products for hero section
const BEST_PRODUCTS: Product[] = [
  {
    id: 5,
    name: "Premium Basmati Rice",
    description: "Aromatic long-grain basmati rice from Punjab farms.",
    price: 120,
    unit: "kg",
    image: "https://5.imimg.com/data5/SELLER/Default/2024/9/452307189/BC/HV/MJ/226608225/basmati-rice-500x500.jpg",
    category: "Grains",
    farmerId: 5,
    farmerName: "Punjab Rice Mills"
  },
  {
    id: 6,
    name: "Organic Carrots",
    description: "Sweet and crunchy organic carrots, perfect for salads and cooking.",
    price: 45,
    unit: "kg",
    image: "https://www.greendna.in/cdn/shop/products/basket-carrots-close-up-37641_1024x1024@2x.jpg?v=1632668896",
    category: "Vegetables",
    farmerId: 6,
    farmerName: "Green Valley Farms"
  },
  {
    id: 7,
    name: "Fresh Spinach",
    description: "Nutrient-rich fresh spinach leaves, harvested daily.",
    price: 25,
    unit: "bundle",
    image: "https://cdn.mos.cms.futurecdn.net/YEn6vwiU6sG9jiRJrDNLW8-1200-80.jpg",
    category: "Vegetables",
    farmerId: 7,
    farmerName: "Leafy Greens Co."
  }
];

const CATEGORIES = [
  {
    name: "Vegetables",
    description: "Fresh farm vegetables",
    image: "https://cdn.britannica.com/17/196817-159-9E487F15/vegetables.jpg",
    count: "50+ items"
  },
  {
    name: "Fruits",
    description: "Seasonal fresh fruits",
    image: "https://mendipvale.nhs.uk/media/2svpgdj0/untitled-design-8.png?rmode=max&width=698&height=392",
    count: "30+ items"
  },
  {
    name: "Herbs/Spices",
    description: "Aromatic herbs & spices",
    image: "https://loveincorporated.blob.core.windows.net/contentimages/gallery/049d63d8-91e5-479f-ae9a-d977b8b51c30-1.jpg",
    count: "20+ items"
  },
  {
    name: "Dairy",
    description: "Fresh dairy products",
    image: "https://images.indianexpress.com/2022/09/Heres-why-milk-and-its-products-arent-good-for-you.jpeg",
    count: "15+ items"
  }
];

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userType = localStorage.getItem('userType');
  const isLoggedIn = !!userType;

  const handleAddToCart = (product: Product) => {
    if (userType === 'farmer') {
      toast({
        title: "Not Available",
        description: "Farmers cannot add items to cart. Switch to customer account to shop.",
        variant: "destructive",
      });
      return;
    }
    
    if (!isLoggedIn || userType !== 'customer') {
      toast({
        title: "Login Required",
        description: "Please login as a customer to add items to cart.",
        variant: "destructive",
      });
      return;
    }
    
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === product.id);
    
    if (existingItemIndex !== -1) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  // Farmer-specific home page
  if (isLoggedIn && userType === 'farmer') {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
          <div className="container mx-auto py-16 px-4">
            {/* Enhanced Hero Section for Farmers */}
            <div className="text-center mb-16">
              <div className="inline-block p-3 bg-green-100 rounded-full mb-6">
                <Leaf className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Welcome to Your Farm Command Center
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Streamline your agricultural business with our comprehensive dashboard. Manage products, track orders, and grow your farm's digital presence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/farmer-dashboard">
                  <Button className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4 shadow-lg">
                    Access Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" className="text-lg px-8 py-4 border-green-200 hover:bg-green-50">
                  View Analytics
                </Button>
              </div>
            </div>
            
            {/* Enhanced Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-fit">
                    <Package className="h-10 w-10 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl mb-3">Product Management</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Effortlessly add, edit, and organize your agricultural products with our intuitive inventory system
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit">
                    <ShoppingBag className="h-10 w-10 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl mb-3">Order Tracking</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Monitor incoming orders in real-time and manage fulfillment with advanced status tracking
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 p-4 bg-orange-100 rounded-full w-fit">
                    <BarChart3 className="h-10 w-10 text-orange-600" />
                  </div>
                  <CardTitle className="text-2xl mb-3">Sales Analytics</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Gain insights into your performance with detailed analytics and revenue tracking tools
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Customer/Guest home page - Enhanced E-commerce experience
  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Enhanced Hero Section */}
        <div className="relative mb-20">
          <div 
            className="relative bg-cover bg-center h-[600px] flex items-center"
            style={{
              backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=600&fit=crop')"
            }}
          >
            <div className="container mx-auto px-8 text-white">
              <div className="max-w-3xl">
                <div className="inline-block p-2 bg-green-500/20 rounded-full mb-6">
                  <Leaf className="h-8 w-8 text-green-300" />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  Farm Fresh
                  <span className="block bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    Delivered Daily
                  </span>
                </h1>
                <p className="text-xl mb-8 leading-relaxed opacity-90">
                  Connect directly with local farmers and enjoy the freshest produce delivered straight to your doorstep. Supporting sustainable agriculture has never been easier.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/products">
                    <Button className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4 shadow-xl">
                      Shop Fresh Products
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Button variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-black">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Stats */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <div className="bg-white rounded-2xl shadow-2xl p-8 grid grid-cols-3 gap-8 min-w-[500px]">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">500+</div>
                <div className="text-sm text-muted-foreground">Fresh Products</div>
              </div>
              <div className="text-center border-x border-gray-200">
                <div className="text-3xl font-bold text-blue-600">100+</div>
                <div className="text-sm text-muted-foreground">Local Farmers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">24h</div>
                <div className="text-sm text-muted-foreground">Fast Delivery</div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-8 px-4">
          {/* Welcome Message for Logged-in Customers */}
          {isLoggedIn && userType === 'customer' && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-20 text-center border border-green-100">
              <h2 className="text-3xl font-bold text-green-700 mb-3">Welcome back!</h2>
              <p className="text-green-600 mb-6 text-lg">Continue your fresh journey with premium produce from trusted local farmers</p>
              <div className="flex justify-center gap-4">
                <Link to="/cart">
                  <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 px-6 py-3">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    View Cart
                  </Button>
                </Link>
                <Link to="/customer-dashboard">
                  <Button className="bg-green-600 hover:bg-green-700 px-6 py-3">
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-fit">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Quality Guaranteed</h3>
              <p className="text-muted-foreground">Every product is quality-checked before delivery</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">Same-day delivery available in most areas</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 p-4 bg-orange-100 rounded-full w-fit">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Always Fresh</h3>
              <p className="text-muted-foreground">Harvested within 24 hours of delivery</p>
            </div>
          </div>

          {/* Enhanced Categories Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Shop by Category</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore our carefully curated selection of fresh produce, organized for your convenience
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {CATEGORIES.map((category) => (
                <Link 
                  key={category.name} 
                  to={`/products?category=${category.name}`}
                  className="group"
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-500 cursor-pointer group-hover:scale-105 border-0 shadow-lg">
                    <div className="aspect-square overflow-hidden rounded-t-xl">
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <CardHeader className="text-center p-6">
                      <CardTitle className="text-xl mb-2">{category.name}</CardTitle>
                      <CardDescription className="text-base mb-2">
                        {category.description}
                      </CardDescription>
                      <p className="text-sm text-green-600 font-semibold">{category.count}</p>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Enhanced Featured Products Section */}
          <div className="mb-20">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold mb-3">Featured Products</h2>
                <p className="text-xl text-muted-foreground">Handpicked premium produce from our most trusted farmers</p>
              </div>
              <Link to="/products">
                <Button variant="outline" className="flex items-center gap-2 px-6 py-3 text-lg border-green-200 hover:bg-green-50">
                  View All Products <ArrowRight size={20} />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {FEATURED_PRODUCTS.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart}
                  showAddToCart={userType !== 'farmer'}
                />
              ))}
            </div>
          </div>

          {/* Enhanced Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <Card className="text-center border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="p-8">
                <div className="mx-auto mb-6 p-4 bg-green-100 rounded-full w-fit">
                  <Leaf className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle className="text-2xl mb-4">100% Organic</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  All our products are certified organic, grown without harmful pesticides or chemicals for your health and safety
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="p-8">
                <div className="mx-auto mb-6 p-4 bg-blue-100 rounded-full w-fit">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
                <CardTitle className="text-2xl mb-4">Support Local Farmers</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Every purchase directly supports local farming communities and promotes sustainable agricultural practices
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="p-8">
                <div className="mx-auto mb-6 p-4 bg-orange-100 rounded-full w-fit">
                  <TrendingUp className="h-12 w-12 text-orange-600" />
                </div>
                <CardTitle className="text-2xl mb-4">Fair Pricing</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Transparent pricing that ensures farmers receive fair compensation while keeping costs reasonable for you
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Enhanced CTA Section */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Kitchen?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of satisfied customers who've made the switch to fresh, local produce. Start your healthy journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-4 shadow-lg">
                  Explore All Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-4">
                Download App
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
