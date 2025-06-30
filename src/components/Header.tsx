import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Menu, Search, Leaf } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userType, setUserType] = React.useState<"customer" | "farmer" | null>(null);
  const [cartItemCount, setCartItemCount] = React.useState(0);

  // Check authentication state from localStorage
  React.useEffect(() => {
    const checkAuthState = () => {
      const storedUserType = localStorage.getItem("userType");
      const storedUserData = localStorage.getItem("userData");
      
      if (storedUserType && storedUserData) {
        setIsLoggedIn(true);
        setUserType(storedUserType as "customer" | "farmer");
      } else {
        setIsLoggedIn(false);
        setUserType(null);
      }

      // Update cart count for customers
      if (storedUserType === "customer") {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCartItemCount(totalItems);
      } else {
        setCartItemCount(0);
      }
    };

    // Check initial state
    checkAuthState();

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkAuthState);
    
    // Also check periodically in case localStorage changes in same tab
    const interval = setInterval(checkAuthState, 1000);

    return () => {
      window.removeEventListener('storage', checkAuthState);
      clearInterval(interval);
    };
  }, []);

  const handleCartClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      toast({
        title: "Authentication required",
        description: "Please login to view your cart",
        variant: "destructive"
      });
      navigate('/login');
    }
  };

  const handleProfileClick = () => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication required",
        description: "Please login to access your profile",
        variant: "destructive"
      });
      navigate('/login');
    } else {
      navigate('/profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userType");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUserType(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  const scrollToFooter = (e: React.MouseEvent) => {
    e.preventDefault();
    const footer = document.querySelector('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const NavLinks = () => (
    <div className="flex gap-8 items-center">
      <Link to="/" className="nav-link">
        Home
      </Link>
      <Link to="/products" className="nav-link">
        {userType === 'farmer' ? 'My Products' : 'Products'}
      </Link>
      <a href="#" onClick={scrollToFooter} className="nav-link">
        About Us
      </a>
      <a href="#" onClick={scrollToFooter} className="nav-link">
        Contact
      </a>
    </div>
  );

  const AuthButtons = () => (
    <div className="flex items-center gap-3">
      {isLoggedIn ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-full h-11 w-11 p-0 hover:bg-green-50/80 border border-gray-200/60 shadow-soft">
              <User className="h-5 w-5 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 shadow-2xl border-gray-200/60 bg-white/95 backdrop-blur-md rounded-xl">
            <DropdownMenuItem className="hover:bg-green-50/80 rounded-lg">
              <Link to={`/${userType}-dashboard`} className="w-full">
                Dashboard
              </Link>
            </DropdownMenuItem>
            {userType !== 'farmer' && (
              <DropdownMenuItem className="hover:bg-green-50/80 rounded-lg">
                <Link to="/profile" className="w-full">
                  Profile
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-50/80 text-red-600 rounded-lg">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Button 
            variant="ghost" 
            className="rounded-full h-11 w-11 p-0 hover:bg-green-50/80 border border-gray-200/60 shadow-soft"
            onClick={handleProfileClick}
          >
            <User className="h-5 w-5 text-gray-600" />
          </Button>
          <Link to="/login">
            <Button variant="outline" className="hidden md:inline-flex border-green-500/60 text-green-600 hover:bg-green-50/80 font-medium rounded-xl shadow-soft">
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button className="btn-primary shadow-lg">
              Register
            </Button>
          </Link>
        </>
      )}
      
      {isLoggedIn && userType === "customer" && (
        <Link to="/cart" onClick={handleCartClick}>
          <Button variant="ghost" className="rounded-full h-11 w-11 p-0 relative hover:bg-green-50/80 border border-gray-200/60 shadow-soft">
            <ShoppingCart className="h-5 w-5 text-gray-600" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium shadow-lg">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </Button>
        </Link>
      )}
    </div>
  );

  const SearchBox = () => (
    <div className="relative hidden md:flex items-center flex-1 max-w-lg mx-6">
      <input 
        type="text" 
        placeholder="Search for vegetables, fruits..." 
        className="w-full rounded-2xl border border-gray-200/60 bg-gray-50/50 px-4 py-3 text-sm shadow-soft placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:border-green-500 focus-visible:bg-white transition-all duration-200 backdrop-blur-sm"
      />
      <Search className="absolute right-3 h-4 w-4 text-gray-400" />
    </div>
  );

  const MobileMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden hover:bg-green-50/80 rounded-xl shadow-soft">
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-white/95 backdrop-blur-md border-r border-gray-200/60">
        <div className="flex flex-col gap-6 py-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-green-500 to-yellow-500 p-2 rounded-xl shadow-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent">
              GreenMandi
            </span>
          </Link>
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full rounded-2xl border border-gray-200/60 bg-gray-50/50 px-3 py-3 text-sm shadow-soft placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:border-green-500"
            />
            <Search className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
          </div>
          <div className="flex flex-col space-y-4">
            <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors font-medium py-2">Home</Link>
            <Link to="/products" className="text-gray-700 hover:text-green-600 transition-colors font-medium py-2">
              {userType === 'farmer' ? 'My Products' : 'Products'}
            </Link>
            <a href="#" onClick={scrollToFooter} className="text-gray-700 hover:text-green-600 transition-colors font-medium py-2">About Us</a>
            <a href="#" onClick={scrollToFooter} className="text-gray-700 hover:text-green-600 transition-colors font-medium py-2">Contact</a>
          </div>
          <hr className="border-gray-200" />
          <div className="flex flex-col space-y-3">
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="flex-1">
                  <Button variant="outline" className="w-full border-green-500/60 text-green-600 hover:bg-green-50/80">Login</Button>
                </Link>
                <Link to="/register" className="flex-1">
                  <Button className="bg-green-600 hover:bg-green-700 w-full">Register</Button>
                </Link>
              </>
            ) : (
              <div className="flex flex-col space-y-3 w-full">
                <Link to={`/${userType}-dashboard`}>
                  <Button variant="outline" className="w-full">Dashboard</Button>
                </Link>
                {userType !== 'farmer' && (
                  <Link to="/profile">
                    <Button variant="outline" className="w-full">Profile</Button>
                  </Link>
                )}
                {userType === "customer" && (
                  <Link to="/cart" onClick={handleCartClick}>
                    <Button variant="outline" className="w-full relative">
                      Cart
                      {cartItemCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                          {cartItemCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-soft border-b border-gray-200/60">
      <div className="container mx-auto py-4 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <MobileMenu />
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-green-500 to-yellow-500 p-2 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent">
                GreenMandi
              </span>
            </Link>
            {!isMobile && <NavLinks />}
          </div>
          
          <SearchBox />
          
          <AuthButtons />
        </div>
      </div>
    </header>
  );
};

export default Header;
