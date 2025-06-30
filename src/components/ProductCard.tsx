
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Star } from 'lucide-react';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  image: string;
  category: string;
  farmerId: number;
  farmerName: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  showAddToCart?: boolean;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  showAddToCart = true,
  viewMode = 'grid'
}) => {
  const [imageError, setImageError] = React.useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };

  const getImageSrc = () => {
    if (imageError || !product.image) {
      if (product.category === 'Fruits') {
        return 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop';
      } else if (product.category === 'Vegetables') {
        return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop';
      } else {
        return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop';
      }
    }
    return product.image;
  };

  return (
    <Card className={`modern-card h-full flex ${viewMode === 'list' ? 'flex-row' : 'flex-col'} group`}>
      <div className="aspect-square overflow-hidden rounded-t-2xl bg-gradient-to-br from-gray-50 to-gray-100 relative">
        <img 
          src={getImageSrc()} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={handleImageError}
          loading="lazy"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-600 shadow-soft">
          {product.category}
        </div>
      </div>
      <CardHeader className="flex-grow p-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
            {product.name}
          </CardTitle>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-xs text-gray-600">4.5</span>
          </div>
        </div>
        <CardDescription className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
          {product.description}
        </CardDescription>
        <Link 
          to={`/farmers/${encodeURIComponent(product.farmerName)}`}
          className="text-sm text-green-600 hover:text-green-700 bg-green-50/50 hover:bg-green-50 rounded-lg px-2 py-1 w-fit transition-all duration-200 font-medium"
        >
          by {product.farmerName}
        </Link>
      </CardHeader>
      <CardContent className="pt-0 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-gradient">
            ₹{product.price}
            <span className="text-sm font-normal text-gray-500">/{product.unit}</span>
          </div>
        </div>
        {showAddToCart && (
          <Button 
            onClick={() => onAddToCart(product)} 
            className="w-full btn-primary group relative overflow-hidden"
          >
            <div className="flex items-center justify-center gap-2 relative z-10">
              <ShoppingCart className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
              <span>Add to Cart</span>
            </div>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
