
import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Image } from 'lucide-react';

interface Product {
  id: string; // Changed from number to string
  name: string;
  category: string;
  stock: number;
  price: number;
  unit: string;
  image: string;
  listed: boolean;
}

interface ProductForm {
  name: string;
  category: string;
  stock: number;
  price: number;
  unit: string;
  image: string;
}

interface ProductFormDialogProps {
  isOpen: boolean;
  currentProduct: Product | null;
  productForm: ProductForm;
  onClose: () => void;
  onSave: () => void;
  onFormChange: (field: keyof ProductForm, value: string | number) => void;
}

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({ 
  isOpen, 
  currentProduct, 
  productForm, 
  onClose, 
  onSave, 
  onFormChange 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        onFormChange('image', imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] glass-effect"> {/* Add glass-effect class here */}
        <DialogHeader>
          <DialogTitle>
            {currentProduct ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {currentProduct 
              ? 'Update the details of your existing product.' 
              : 'Fill in the details for your new product.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input 
              id="productName" 
              value={productForm.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              placeholder="e.g. Organic Tomatoes"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={productForm.category}
                onValueChange={(value) => onFormChange('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vegetables">Vegetables</SelectItem>
                  <SelectItem value="Fruits">Fruits</SelectItem>
                  <SelectItem value="Herbs">Herbs</SelectItem>
                  <SelectItem value="Dairy">Dairy</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input 
                id="stock" 
                type="number" 
                value={productForm.stock.toString()}
                onChange={(e) => onFormChange('stock', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input 
                id="price" 
                type="number" 
                value={productForm.price.toString()}
                onChange={(e) => onFormChange('price', parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select 
                value={productForm.unit}
                onValueChange={(value) => onFormChange('unit', value)}
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilogram (kg)</SelectItem>
                  <SelectItem value="g">Gram (g)</SelectItem>
                  <SelectItem value="dozen">Dozen</SelectItem>
                  <SelectItem value="piece">Piece</SelectItem>
                  <SelectItem value="bundle">Bundle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Product Photo</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input 
                  value={productForm.image}
                  onChange={(e) => onFormChange('image', e.target.value)}
                  placeholder="Enter image URL or upload a photo"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={triggerFileUpload}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            {productForm.image && (
              <div className="mt-2">
                <div className="relative w-24 h-24 border border-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={productForm.image} 
                    alt="Product preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.jpg';
                    }}
                  />
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Upload a photo or enter an image URL for your product.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}>
            {currentProduct ? 'Update Product' : 'Add Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
