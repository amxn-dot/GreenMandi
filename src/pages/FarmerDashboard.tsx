// src/pages/FarmerDashboard.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, Settings, Package, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OverviewCards from '@/components/farmer/OverviewCards';
import OrdersTab from '@/components/farmer/OrdersTab';
import ProductsTab from '@/components/farmer/ProductsTab';
import SettingsTab from '@/components/farmer/SettingsTab';
import OrderDetailsDialog from '@/components/farmer/OrderDetailsDialog';
import ProductFormDialog from '@/components/farmer/ProductFormDialog';

// Import Product, Order, and FarmerProfile from the centralized types file
import { Product, Order, FarmerProfile, ProductForm } from '@/types';
import { productService } from '@/services/productService';

// SAMPLE_PRODUCTS now uses string IDs for consistency
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'sample-prod-1',
    name: 'Organic Tomatoes',
    category: 'Vegetables',
    stock: 50,
    price: 40,
    unit: 'kg',
    image: '/tomato.jpg',
    listed: true,
    description: "Fresh organic tomatoes",
    farmerId: 'sampleFarmer1'
  },
  {
    id: 'sample-prod-2',
    name: 'Fresh Spinach',
    category: 'Vegetables',
    stock: 30,
    price: 25,
    unit: 'bundle',
    image: '/spinach.jpg',
    listed: true,
    description: "Daily harvested fresh spinach",
    farmerId: 'sampleFarmer1'
  },
  {
    id: 'sample-prod-3',
    name: 'Green Chilies',
    category: 'Vegetables',
    stock: 15,
    price: 15,
    unit: '100g',
    image: '/chilies.jpg',
    listed: true,
    description: "Spicy green chilies",
    farmerId: 'sampleFarmer1'
  },
  {
    id: 'sample-prod-4',
    name: 'Organic Potatoes',
    category: 'Vegetables',
    stock: 100,
    price: 30,
    unit: 'kg',
    image: '/potato.jpg',
    listed: false,
    description: "Farm fresh organic potatoes",
    farmerId: 'sampleFarmer1'
  }
];

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewingOrder, setIsViewingOrder] = useState(false);

  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile>({
    farmName: '',
    farmerName: '',
    location: '',
    phone: '',
    description: ''
  });

  const [newProduct, setNewProduct] = useState<ProductForm>({
    name: '',
    category: 'Vegetables',
    stock: 0,
    price: 0,
    unit: 'kg',
    image: '',
    description: ''
  });

  const saveProductsToLocalStorage = useCallback((productsToSave: Product[]) => {
    localStorage.setItem('farmerProducts', JSON.stringify(productsToSave));
  }, []);

  // Define loadFarmerProfile and loadData inside the component but outside useEffect
  // to avoid re-creating them on every render unless their dependencies change.
  // Using useCallback for loadFarmerProfile isn't strictly necessary if it doesn't
  // have dependencies that change frequently, but it's good practice.

  const loadFarmerProfile = useCallback(() => {
    const storedProfile = localStorage.getItem('farmerProfile');
    const userData = localStorage.getItem('userData');

    if (storedProfile) {
      setFarmerProfile(JSON.parse(storedProfile));
    } else if (userData) {
      const user = JSON.parse(userData);
      const initialProfile: FarmerProfile = {
        farmName: user.farmName || '',
        farmerName: user.name || '',
        location: user.farmLocation || '',
        phone: user.phone || '',
        description: user.farmDescription || ''
      };
      setFarmerProfile(initialProfile);
      localStorage.setItem('farmerProfile', JSON.stringify(initialProfile));
    }
  }, []); // No dependencies for loadFarmerProfile

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      loadFarmerProfile(); // Call the memoized version

      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const farmerId = userData._id;

      if (farmerId) {
        try {
          console.log('Fetching products for farmer ID:', farmerId);
          const farmerProducts = await productService.getFarmerProducts(farmerId);
          console.log('Products received from API:', farmerProducts);

          if (farmerProducts && Array.isArray(farmerProducts)) {
            const validatedProducts: Product[] = farmerProducts.map((product: any) => ({
              id: product.id || product._id,
              name: product.name,
              category: product.category,
              stock: product.stock,
              price: product.price,
              unit: product.unit,
              image: product.image,
              listed: typeof product.listed === 'boolean' ? product.listed : true,
              description: product.description || '',
              farmerId: product.farmerId || farmerId
            }));

            setProducts(validatedProducts);
            saveProductsToLocalStorage(validatedProducts);
          } else {
            throw new Error('Invalid products data received from API');
          }
        } catch (error) {
          console.error('Failed to load products from API:', error);
          toast({
            title: "Product Load Warning",
            description: "Could not fetch products from server. Falling back to local cache.",
            variant: "destructive"
          });

          const storedProducts = localStorage.getItem('farmerProducts');
          if (storedProducts) {
            setProducts(JSON.parse(storedProducts));
          } else {
            const sampleProductsWithFarmerId = SAMPLE_PRODUCTS.map(p => ({
              ...p,
              id: p.id,
              farmerId: farmerId,
              listed: typeof p.listed === 'boolean' ? p.listed : false
            }));
            setProducts(sampleProductsWithFarmerId);
            saveProductsToLocalStorage(sampleProductsWithFarmerId);
          }
        }

        const farmerOrders = JSON.parse(localStorage.getItem('farmerOrders') || '[]');
        const uniqueOrdersMap = new Map<string, Order>();
        farmerOrders.forEach((order: Order) => {
          uniqueOrdersMap.set(order.id, order);
        });
        setOrders(Array.from(uniqueOrdersMap.values()));

      } else {
        console.error('No farmer ID found in user data');
        toast({
          title: "Authentication Error",
          description: "Your farmer ID could not be found. Please try logging out and back in.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load your dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast, saveProductsToLocalStorage, loadFarmerProfile]); // Dependencies for loadData

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (!userType || userType !== 'farmer') {
      toast({
        title: "Authentication required",
        description: "Please login as a farmer to access the dashboard",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    loadData(); // Call the memoized loadData function

  }, [navigate, toast, loadData]); // Dependencies for useEffect

  const handleSaveProduct = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const farmerId = userData._id;

      if (!farmerId) {
        toast({
          title: "Error",
          description: "Farmer ID not found. Cannot save product.",
          variant: "destructive"
        });
        return;
      }

      if (currentProduct) {
        const updatedProductPayload = {
          ...newProduct,
          farmerId: farmerId
        };

        const productId = currentProduct.id;

        const responseProduct = await productService.updateProduct(productId, updatedProductPayload);

        setProducts(prevProducts => {
          const updatedProducts = prevProducts.map(p =>
            (p.id === productId ? { ...p, ...responseProduct, id: responseProduct._id || responseProduct.id } : p)
          );
          saveProductsToLocalStorage(updatedProducts);
          return updatedProducts;
        });

        toast({
          title: "Product updated",
          description: `${newProduct.name} has been updated.`
        });
      } else {
        const newProductData: Omit<Product, 'id'> = {
          name: newProduct.name,
          category: newProduct.category,
          stock: newProduct.stock,
          price: newProduct.price,
          unit: newProduct.unit,
          image: newProduct.image || '/placeholder.jpg',
          description: newProduct.description,
          listed: true,
          farmerId: farmerId
        };

        const createdProduct = await productService.createProduct(newProductData);

        const formattedProduct: Product = {
          ...createdProduct,
          id: createdProduct._id || createdProduct.id
        };

        setProducts(prevProducts => {
          const updatedProducts = [...prevProducts, formattedProduct];
          saveProductsToLocalStorage(updatedProducts);
          return updatedProducts;
        });

        toast({
          title: "Product added",
          description: `${newProduct.name} has been added to your inventory.`
        });
      }

      setIsAddingProduct(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error saving product",
        description: error instanceof Error ? error.message : "There was a problem saving your product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleNewProduct = () => {
    setCurrentProduct(null);
    setNewProduct({
      name: '',
      category: 'Vegetables',
      stock: 0,
      price: 0,
      unit: 'kg',
      image: '',
      description: ''
    });
    setIsAddingProduct(true);
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      stock: product.stock,
      price: product.price,
      unit: product.unit,
      image: product.image,
      description: product.description || ''
    });
    setIsAddingProduct(true);
  };

  const handleProductFormChange = (field: keyof ProductForm, value: string | number) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await productService.deleteProduct(productId);
      setProducts(prevProducts => {
        const updatedProducts = prevProducts.filter(p => p.id !== productId);
        saveProductsToLocalStorage(updatedProducts);
        return updatedProducts;
      });
      toast({
        title: "Product deleted",
        description: "The product has been successfully removed.",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProductListing = async (product: Product, listed: boolean) => {
    try {
      await productService.updateProductListing(product.id, listed);
      setProducts(prevProducts => {
        const updatedProducts = prevProducts.map(p =>
          (p.id === product.id ? { ...p, listed } : p)
        );
        saveProductsToLocalStorage(updatedProducts);
        return updatedProducts;
      });
      toast({
        title: "Product listing updated",
        description: `Product status changed to ${listed ? 'listed' : 'unlisted'}.`,
      });
    } catch (error) {
      console.error('Error updating product listing:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update product listing.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateOrderStatus = (order: Order, newStatus: Order['status']) => {
    const updatedOrders = orders.map(o =>
      o.id === order.id ? { ...o, status: newStatus } : o
    );

    setOrders(updatedOrders);
    localStorage.setItem('farmerOrders', JSON.stringify(updatedOrders));

    toast({
      title: "Order updated",
      description: `Order ${order.id} status updated to ${newStatus}.`
    });
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewingOrder(true);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);

    try {
      if (!farmerProfile.farmName || !farmerProfile.farmerName || !farmerProfile.location || !farmerProfile.phone) {
        throw new Error("Please fill in all required fields");
      }

      localStorage.setItem('farmerProfile', JSON.stringify(farmerProfile));

      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        const updatedUserData = {
          ...userData,
          name: farmerProfile.farmerName,
          farmName: farmerProfile.farmName,
          farmLocation: farmerProfile.location,
          farmDescription: farmerProfile.description,
          phone: farmerProfile.phone
        };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
      }

      toast({
        title: "Profile updated",
        description: "Your farmer profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleProfileChange = (field: keyof FarmerProfile, value: string) => {
    setFarmerProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResetProfile = () => {
    const storedProfile = localStorage.getItem('farmerProfile');
    if (storedProfile) {
      setFarmerProfile(JSON.parse(storedProfile));
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-green-500 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
                  <p className="text-gray-600 text-lg">Welcome back! Manage your farm business efficiently.</p>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
            </div>
          ) : (
            <div className="space-y-8">
              <OverviewCards products={products} orders={orders} />

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <Tabs defaultValue="orders" className="w-full">
                  <TabsList className="w-full justify-start bg-gray-50 border-b border-gray-200 rounded-none p-0 h-auto">
                    <TabsTrigger
                      value="orders"
                      className="px-6 py-4 text-base font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500"
                    >
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Orders Management
                    </TabsTrigger>
                    <TabsTrigger
                      value="products"
                      className="px-6 py-4 text-base font-semibold data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-green-500"
                    >
                      <Package className="mr-2 h-5 w-5" />
                      Product Inventory
                    </TabsTrigger>
                    <TabsTrigger
                      value="settings"
                      className="px-6 py-4 text-base font-semibold data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                    >
                      <Settings className="mr-2 h-5 w-5" />
                      Farm Settings
                    </TabsTrigger>
                  </TabsList>

                  <div className="p-6">
                    <TabsContent value="orders" className="mt-0">
                      <OrdersTab
                        orders={orders}
                        onUpdateOrderStatus={handleUpdateOrderStatus}
                        onViewOrder={handleViewOrder}
                      />
                    </TabsContent>

                    <TabsContent value="products" className="mt-0">
                      <ProductsTab
                        products={products}
                        onNewProduct={handleNewProduct}
                        onEditProduct={handleEditProduct}
                        onDeleteProduct={handleDeleteProduct}
                        onUpdateProductListing={handleUpdateProductListing}
                      />
                    </TabsContent>

                    <TabsContent value="settings" className="mt-0">
                      <SettingsTab
                        farmerProfile={farmerProfile}
                        isSavingProfile={isSavingProfile}
                        onProfileChange={handleProfileChange}
                        onSaveProfile={handleSaveProfile}
                        onResetProfile={handleResetProfile}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              <OrderDetailsDialog
                order={selectedOrder}
                isOpen={isViewingOrder}
                onClose={() => setIsViewingOrder(false)}
              />

              <ProductFormDialog
                isOpen={isAddingProduct}
                currentProduct={currentProduct}
                productForm={newProduct}
                onClose={() => setIsAddingProduct(false)}
                onSave={handleSaveProduct}
                onFormChange={handleProductFormChange}
              />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default FarmerDashboard;