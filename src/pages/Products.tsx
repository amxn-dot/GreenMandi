import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import ProductCard, { Product } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Grid3X3, 
  List, 
  Star,
  Leaf,
  MapPin,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PRODUCTS: Product[] = [
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
  },
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
    image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=600&h=400&fit=crop",
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

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);

  const userType = localStorage.getItem('userType');

  useEffect(() => {
    const categoryParam = searchParams.get('category') || 'all';
    setSelectedCategory(categoryParam);
    
    // Load data and apply filters
    const loadProducts = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate loading delay
      
      // Load default products
      let initialProducts = [...PRODUCTS];
      
      // Load farmer products from local storage
      try {
        const storedFarmerProducts = localStorage.getItem('farmerProducts');
        if (storedFarmerProducts) {
          const farmerProducts = JSON.parse(storedFarmerProducts);
          // Only include products that are marked as "listed"
          const listedFarmerProducts = farmerProducts.filter((p: any) => p.listed);
          
          // Convert farmer products to match Product interface
          const formattedFarmerProducts = listedFarmerProducts.map((p: any) => ({
            id: p.id + 1000, // Add offset to avoid ID conflicts with default products
            name: p.name,
            description: p.name, // Use name as description if not available
            price: p.price,
            unit: p.unit,
            image: p.image || '/placeholder.jpg',
            category: p.category,
            farmerId: 999, // Placeholder ID for the current farmer
            farmerName: localStorage.getItem('farmerProfile') ? 
              JSON.parse(localStorage.getItem('farmerProfile') || '{}').farmName || 'Local Farmer' : 
              'Local Farmer'
          }));
          
          // Merge with default products
          initialProducts = [...initialProducts, ...formattedFarmerProducts];
        }
      } catch (error) {
        console.error('Error loading farmer products:', error);
      }
      
      // Category filter
      if (categoryParam !== 'all') {
        initialProducts = initialProducts.filter(p => p.category === categoryParam);
      }
      
      // Set products and filtered products
      setProducts(initialProducts);
      setFilteredProducts([...initialProducts]);
      setIsLoading(false);
    };
    
    loadProducts();
  }, [searchParams]);

  useEffect(() => {
    let currentProducts = [...products];

    // Apply category filter
    if (selectedCategory !== 'all') {
      currentProducts = currentProducts.filter(p => p.category === selectedCategory);
    }

    // Apply search term filter
    if (searchTerm) {
      currentProducts = currentProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply price range filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      if (max) {
        currentProducts = currentProducts.filter(p => p.price >= min && p.price <= max);
      } else {
        currentProducts = currentProducts.filter(p => p.price >= min);
      }
    }

    // Apply sorting
    if (sortBy === 'name') {
      currentProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'price-low') {
      currentProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      currentProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'category') {
      currentProducts.sort((a, b) => a.category.localeCompare(b.category));
    }

    setFilteredProducts(currentProducts);
  }, [products, searchTerm, selectedCategory, sortBy, priceRange]);

  const handleAddToCart = (product: Product) => {
    if (userType === 'farmer') {
      toast({
        title: "Not Available",
        description: "Farmers cannot add items to cart. Switch to customer account to shop.",
        variant: "destructive",
      });
      return;
    }
    
    if (!userType || userType !== 'customer') {
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

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-blue-50/30">
        {/* Enhanced Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-block p-3 bg-white/20 rounded-full mb-6">
              <Leaf className="h-10 w-10" />
            </div>
            <h1 className="text-5xl font-bold mb-4">Fresh Market</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
              Discover premium quality produce from trusted local farmers. Every item is carefully selected for freshness and taste.
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-300" />
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-300" />
                <span>Fresh Daily</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-300" />
                <span>Local Farmers</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-8 px-4">
          {/* Enhanced Search and Filter Section */}
          <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Filter className="h-6 w-6 text-green-600" />
                Find Your Perfect Produce
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search for fresh fruits, vegetables, and more..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-3 text-lg border-green-200 focus:border-green-500"
                />
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="border-green-200 focus:border-green-500">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Price Range</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="border-green-200 focus:border-green-500">
                      <SelectValue placeholder="Any Price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Price</SelectItem>
                      <SelectItem value="0-50">₹0 - ₹50</SelectItem>
                      <SelectItem value="50-100">₹50 - ₹100</SelectItem>
                      <SelectItem value="100-200">₹100 - ₹200</SelectItem>
                      <SelectItem value="200+">₹200+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="border-green-200 focus:border-green-500">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="price-low">Price (Low to High)</SelectItem>
                      <SelectItem value="price-high">Price (High to Low)</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">View</label>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="flex-1"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="flex-1"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredProducts.length} Products Found
              </h2>
              <p className="text-muted-foreground">
                {selectedCategory !== 'all' && `in ${selectedCategory} • `}
                {searchTerm && `matching "${searchTerm}" • `}
                Fresh from local farms
              </p>
            </div>
            
            {/* Active Filters */}
            {(selectedCategory !== 'all' || searchTerm || priceRange !== 'all') && (
              <div className="flex gap-2 flex-wrap">
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {selectedCategory}
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    "{searchTerm}"
                  </Badge>
                )}
                {priceRange !== 'all' && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {priceRange === '200+' ? '₹200+' : `₹${priceRange}`}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading fresh products...</p>
              </div>
            </div>
          ) : (
            /* Products Grid/List */
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8" 
                : "space-y-6"
            }>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={handleAddToCart}
                    showAddToCart={userType !== 'farmer'}
                    viewMode={viewMode}
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="text-center py-16 border-dashed border-2 border-gray-200">
                    <CardContent>
                      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                        <Search className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">No products found</h3>
                      <p className="text-muted-foreground mb-6">
                        Try adjusting your search terms or filters to find what you're looking for.
                      </p>
                      <Button 
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('all');
                          setPriceRange('all');
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Promotional Section */}
          <div className="mt-20">
            <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white border-0 shadow-2xl">
              <CardContent className="p-12 text-center">
                <h3 className="text-3xl font-bold mb-4">Fresh Guarantee</h3>
                <p className="text-xl opacity-90 mb-6 max-w-2xl mx-auto">
                  Not satisfied with your purchase? We offer a 100% freshness guarantee. 
                  Contact us within 24 hours for a full refund or replacement.
                </p>
                <Button className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 text-lg">
                  Learn More About Our Guarantee
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Products;
