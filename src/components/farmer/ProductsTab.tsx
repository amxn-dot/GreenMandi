import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash, ShoppingBag } from 'lucide-react';
// Assuming Product interface is also defined or imported here if not already
// Example:
// interface Product {
//   id: number;
//   name: string;
//   category: string;
//   stock: number;
//   price: number;
//   unit: string;
//   image: string;
//   listed: boolean;
//   description?: string;
//   farmerId?: string;
// }


interface Product {
  id: string; // Change from number to string
  name: string;
  category: string;
  stock: number;
  price: number;
  unit: string;
  image: string;
  listed: boolean;
  description?: string;
  farmerId?: string;
}


interface ProductsTabProps {
  products: Product[];
  onNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => Promise<void>; // Change from number to string
  onUpdateProductListing: (product: Product, listed: boolean) => Promise<void>;
}

const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  onNewProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateProductListing
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>Manage your product listings</CardDescription>
          </div>
          <Button onClick={onNewProduct}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first product to start selling on GreenMandi.
            </p>
            <Button onClick={onNewProduct}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Product</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Stock</th>
                  <th className="text-left py-3 px-4 font-medium">Price</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="ml-3 font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{product.category}</td>
                    <td className="py-3 px-4">
                      {product.stock} {product.unit}
                    </td>
                    <td className="py-3 px-4">₹{product.price}/{product.unit}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.listed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.listed ? 'Listed' : 'Unlisted'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteProduct(product.id)} 
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={product.listed ? "destructive" : "default"}
                          size="sm"
                          onClick={() => onUpdateProductListing(product, !product.listed)}
                        >
                          {product.listed ? 'Unlist' : 'List'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsTab;