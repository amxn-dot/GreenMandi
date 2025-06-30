import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import ProductCard, { Product } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Star, Package } from 'lucide-react';

// Mock farmer data
const MOCK_FARMERS = [
  {
    id: 1,
    name: "Ramesh Farms",
    location: "Pune, Maharashtra",
    rating: 4.8,
    totalProducts: 12,
    description: "Organic farming specialist with 15+ years of experience in sustainable agriculture."
  },
  {
    id: 2,
    name: "Shanti Orchards",
    location: "Nashik, Maharashtra", 
    rating: 4.6,
    totalProducts: 8,
    description: "Premium fruit grower specializing in mangoes and seasonal fruits."
  },
  {
    id: 3,
    name: "Krishna Farms",
    location: "Aurangabad, Maharashtra",
    rating: 4.9,
    totalProducts: 15,
    description: "Multi-crop organic farm focusing on vegetables and herbs."
  },
  {
    id: 4,
    name: "Mountain Valley Farms",
    location: "Mahabaleshwar, Maharashtra",
    rating: 4.7,
    totalProducts: 6,
    description: "High-altitude farming specializing in apples and seasonal vegetables."
  }
];

const MOCK_PRODUCTS: Product[] = [
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
    name: "Fresh Spinach",
    description: "Nutrient-rich spinach leaves, perfect for salads and cooking.",
    price: 30,
    unit: "bundle",
    image: "https://cdn.mos.cms.futurecdn.net/YEn6vwiU6sG9jiRJrDNLW8-1200-80.jpg",
    category: "Vegetables",
    farmerId: 1,
    farmerName: "Ramesh Farms"
  },
  {
    id: 6,
    name: "Organic Carrots",
    description: "Sweet and crunchy carrots grown without pesticides.",
    price: 45,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400&h=400&fit=crop",
    category: "Vegetables",
    farmerId: 3,
    farmerName: "Krishna Farms"
  },
  {
    id: 7,
    name: "Fresh Bananas",
    description: "Naturally ripened sweet bananas.",
    price: 60,
    unit: "dozen",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop",
    category: "Fruits",
    farmerId: 2,
    farmerName: "Shanti Orchards"
  },
  {
    id: 8,
    name: "Organic Onions",
    description: "Medium-sized onions with excellent flavor for your daily cooking.",
    price: 35,
    unit: "kg",
    image: "https://static.wixstatic.com/media/5a432c_93f3a535380c49428c997e5a6f6bf6a4~mv2.jpg/v1/fill/w_560,h_560,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/5a432c_93f3a535380c49428c997e5a6f6bf6a4~mv2.jpg",
    category: "Vegetables",
    farmerId: 3,
    farmerName: "Krishna Farms"
  },
];

const convertFarmerProductToCustomerProduct = (farmerProduct: any, farmerId: number, farmerName: string): Product => {
  return {
    id: farmerProduct.id + 1000,
    name: farmerProduct.name,
    description: `Fresh ${farmerProduct.name.toLowerCase()} from our farm.`,
    price: farmerProduct.price,
    unit: farmerProduct.unit,
    image: farmerProduct.image || '/placeholder.jpg',
    category: farmerProduct.category,
    farmerId: farmerId,
    farmerName: farmerName
  };
};

const Farmers: React.FC = () => {
  const { farmerName } = useParams<{ farmerName: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [farmer, setFarmer] = useState<any>(null);
  const [farmerProducts, setFarmerProducts] = useState<Product[]>([]);
  
  const userType = localStorage.getItem('userType');

  useEffect(() => {
    if (!farmerName) {
      navigate('/products');
      return;
    }

    const decodedFarmerName = decodeURIComponent(farmerName);
    console.log('Looking for farmer:', decodedFarmerName);
    
    // Check if this is a local farmer (from farmer products)
    const farmerProductsData = localStorage.getItem('farmerProducts');
    const farmerProfile = localStorage.getItem('farmerProfile');
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    
    let actualFarmerName = decodedFarmerName;
    let foundFarmer = null;
    
    // First check: farmer products and profile data
    if (farmerProductsData && farmerProfile) {
      try {
        const storedProducts = JSON.parse(farmerProductsData);
        const profile = JSON.parse(farmerProfile);
        
        // Check if any product has this farmer name or if it matches profile
        const hasMatchingProduct = storedProducts.some((product: any) => 
          product.farmerName === decodedFarmerName || 
          profile.farmerName === decodedFarmerName ||
          profile.farmName === decodedFarmerName
        );
        
        if (hasMatchingProduct) {
          // Create a dynamic farmer based on the profile
          foundFarmer = {
            id: 999,
            name: profile.farmName || profile.farmerName || decodedFarmerName,
            location: profile.location || "Maharashtra, India",
            rating: 4.5,
            totalProducts: storedProducts.filter((p: any) => p.listed && p.stock > 0).length,
            description: profile.description || "Fresh produce directly from local farms."
          };
          actualFarmerName = foundFarmer.name;
        }
      } catch (error) {
        console.error('Error loading farmer profile:', error);
      }
    }
    
    // Second check: look in allUsers for registered farmers
    if (!foundFarmer) {
      const registeredFarmer = allUsers.find((user: any) => 
        user.userType === 'farmer' && (
          user.farmName === decodedFarmerName || 
          user.name === decodedFarmerName ||
          user.farmerName === decodedFarmerName
        )
      );
      
      if (registeredFarmer) {
        foundFarmer = {
          id: 998, // Use different ID for registered farmers without products
          name: registeredFarmer.farmName || registeredFarmer.name,
          location: registeredFarmer.farmLocation || registeredFarmer.address || "Maharashtra, India",
          rating: 4.5,
          totalProducts: 0, // New farmers start with 0 products
          description: registeredFarmer.farmDescription || "Fresh produce directly from local farms."
        };
        actualFarmerName = foundFarmer.name;
        console.log('Found registered farmer:', foundFarmer);
      }
    }
    
    // Third check: mock farmers
    if (!foundFarmer) {
      foundFarmer = MOCK_FARMERS.find(f => f.name === decodedFarmerName);
    }
    
    if (!foundFarmer) {
      console.log('Farmer not found:', decodedFarmerName);
      toast({
        title: "Farmer not found",
        description: "The farmer you're looking for doesn't exist.",
        variant: "destructive"
      });
      navigate('/products');
      return;
    }

    setFarmer(foundFarmer);

    // Get farmer's products
    let products: Product[] = [];
    
    if (foundFarmer.id === 999) {
      // Local Farmer with products - get from localStorage
      if (farmerProductsData) {
        try {
          const storedProducts = JSON.parse(farmerProductsData);
          const listedProducts = storedProducts
            .filter((product: any) => product.listed && product.stock > 0)
            .map((product: any) => convertFarmerProductToCustomerProduct(product, 999, actualFarmerName));
          products = listedProducts;
        } catch (error) {
          console.error('Error loading farmer products:', error);
        }
      }
    } else if (foundFarmer.id === 998) {
      // Registered farmer without products yet - empty array
      products = [];
    } else {
      // Mock farmers - get from MOCK_PRODUCTS
      products = MOCK_PRODUCTS.filter(product => product.farmerId === foundFarmer.id);
    }

    setFarmerProducts(products);
  }, [farmerName, navigate, toast]);

  const handleAddToCart = (product: Product) => {
    if (userType === 'farmer') {
      toast({
        title: "Not Available",
        description: "Farmers cannot add items to cart. Switch to customer account to shop.",
        variant: "destructive",
      });
      return;
    }
    
    const userData = localStorage.getItem('userData');
    const currentUserType = localStorage.getItem('userType');
    
    if (!userData || currentUserType !== 'customer') {
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

  if (!farmer) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading farmer details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/products')}
          className="mb-6 hover:bg-green-50/80"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        {/* Farmer Header */}
        <div className="modern-card p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="bg-gradient-to-br from-green-500 to-yellow-500 p-4 rounded-2xl shadow-lg">
              <Package className="h-12 w-12 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{farmer.name}</h1>
              <div className="flex items-center gap-4 text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{farmer.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{farmer.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span>{farmerProducts.length} products</span>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{farmer.description}</p>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Products from {farmer.name}</h2>
          <p className="text-gray-600">Fresh produce directly from this farm</p>
        </div>

        {farmerProducts.length === 0 ? (
          <div className="text-center py-12 modern-card">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products available</h3>
            <p className="text-gray-600">This farmer doesn't have any products listed currently.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {farmerProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
                showAddToCart={userType !== 'farmer'}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Farmers;
