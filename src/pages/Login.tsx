
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Tractor, Mail, Lock, Eye, EyeOff } from 'lucide-react';

import { authService } from '../services/authService';
import useFormValidation from '@/hooks/useFormValidation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Define validation rules
  const { validateForm, validateSingleField, errors: validationErrors } = useFormValidation({
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      required: true,
      minLength: 6
    }
  });
  
  const handleInputChange = (field: string, value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    validateSingleField(field, value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate form
      const formData = { email, password };
      const isValid = validateForm(formData);
      
      if (!isValid) {
        setIsLoading(false);
        return;
      }
      
      // Call the authentication service with userType
      const response = await authService.login(email, password, userType);
      
      toast({
        title: "Login successful",
        description: `Welcome back to GreenMandi!`,
      });
      
      // Redirect based on user type
      if (response.userType === 'customer') {
        navigate('/'); // Redirect to home page for customers
      } else {
        navigate('/farmer-dashboard'); // Redirect to farmer dashboard
      }
      
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // For demo purposes - preset credentials
  const setDemoCredentials = (type: string) => {
    if (type === 'customer') {
      setEmail('customer@example.com');
      setPassword('password123');
    } else {
      setEmail('farmer@example.com');
      setPassword('password123');
    }
    setUserType(type);
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-green-50 via-white to-orange-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-2">Welcome Back</h1>
            <p className="text-muted-foreground text-lg">Sign in to your GreenMandi account</p>
          </div>
          
          <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="text-center pb-2 bg-gradient-to-r from-green-500/10 to-orange-500/10">
              <CardTitle className="text-2xl font-bold text-foreground">Login</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Choose your account type and enter your credentials
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              <Tabs defaultValue="customer" onValueChange={setUserType} className="w-full">
                <TabsList className="grid grid-cols-2 w-full h-14 bg-gray-100 rounded-2xl p-1">
                  <TabsTrigger 
                    value="customer" 
                    onClick={() => setDemoCredentials('customer')}
                    className="h-12 rounded-xl font-semibold text-base data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Customer
                  </TabsTrigger>
                  <TabsTrigger 
                    value="farmer" 
                    onClick={() => setDemoCredentials('farmer')}
                    className="h-12 rounded-xl font-semibold text-base data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <Tractor className="w-4 h-4" />
                    Farmer
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold text-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="email"
                      placeholder="Enter your email"
                      type="email"
                      value={email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className={`pl-12 h-14 text-base bg-gray-50/50 border-2 ${validationErrors.email ? 'border-red-500' : 'border-gray-200'} focus:border-green-500 focus:bg-white transition-all duration-300`}
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-base font-semibold text-foreground">Password</Label>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-green-600 hover:text-green-700 transition-colors duration-200 font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      placeholder="Enter your password"
                      className={`pl-12 pr-12 h-14 text-base bg-gray-50/50 border-2 ${validationErrors.password ? 'border-red-500' : 'border-gray-200'} focus:border-green-500 focus:bg-white transition-all duration-300`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.password}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className={`w-full h-14 text-base font-bold rounded-2xl shadow-lg transition-all duration-300 ${
                    userType === 'customer' 
                      ? 'bg-green-600 hover:bg-green-700 hover:shadow-xl' 
                      : 'bg-orange-600 hover:bg-orange-700 hover:shadow-xl'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
              <div className="text-center">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link 
                  to={`/register?type=${userType}`} 
                  className="text-green-600 hover:text-green-700 transition-colors duration-200 font-semibold"
                >
                  Create Account
                </Link>
              </div>
              
              <div className="text-xs text-center text-muted-foreground bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <p className="mb-2 font-semibold text-gray-700">Demo Credentials</p>
                <div className="space-y-1">
                  <p><span className="font-medium">Customer:</span> customer@example.com / password123</p>
                  <p><span className="font-medium">Farmer:</span> farmer@example.com / password123</p>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;
