import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Tractor, Mail, Lock, Phone, MapPin, Building, Eye, EyeOff } from 'lucide-react';
import useFormValidation from '@/hooks/useFormValidation'; // Assuming this hook is correctly implemented

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmCpfirmPassword] = useState(false); // Fix: Typo in state name

  // Get user type from URL query param
  const queryParams = new URLSearchParams(location.search);
  const typeFromQuery = queryParams.get('type');
  const [userType, setUserType] = useState<string>(typeFromQuery || 'customer');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Farmer-specific fields
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmDescription, setFarmDescription] = useState('');

  // Initialize useFormValidation at the top level
  const { validateForm, validateSingleField, errors: validationErrors } = useFormValidation({
    name: {
      required: true,
      pattern: /^[A-Za-z\s]+$/,  // Only letters and spaces
      minLength: 3
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
      required: true,
      pattern: /^[0-9]{10}$/,  // 10 digits only
      custom: (value) => {
        if (!/^[0-9]+$/.test(value)) return "Phone number must contain only digits";
        return null;
      }
    },
    address: {
      required: true,
      minLength: 10
    },
    password: {
      required: true,
      minLength: 8,
      custom: (value) => {
        if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
        if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
        if (!/[0-9]/.test(value)) return "Password must contain at least one number";
        if (!/[^A-Za-z0-9]/.test(value)) return "Password must contain at least one special character";
        return null;
      }
    },
    confirmPassword: {
      required: true,
      custom: (value) => {
        if (value !== password) return "Passwords do not match";
        return null;
      }
    },
    farmName: {
      required: userType === 'farmer', // Conditionally required
      pattern: /^[A-Za-z0-9\s]+$/  // Alphanumeric and spaces
    },
    farmLocation: {
      required: userType === 'farmer' // Conditionally required
    }
  });

  useEffect(() => {
    // Update the user type if it changes in the URL
    if (typeFromQuery) {
      setUserType(typeFromQuery);
    }
  }, [typeFromQuery]);

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'name': setName(value); break;
      case 'email': setEmail(value); break;
      case 'phone': setPhone(value); break;
      case 'address': setAddress(value); break;
      case 'password': setPassword(value); break;
      case 'confirmPassword': setConfirmPassword(value); break;
      case 'farmName': setFarmName(value); break;
      case 'farmLocation': setFarmLocation(value); break;
      case 'farmDescription': setFarmDescription(value); break;
    }
    // Validate the single field immediately
    validateSingleField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare form data for full form validation
      const formData = {
        name,
        email,
        phone,
        address,
        password,
        confirmPassword,
        ...(userType === 'farmer' && {
          farmName,
          farmLocation,
          farmDescription: farmDescription // Include description in data for validation if needed, otherwise omit
        })
      };

      // Validate the entire form
      const isValid = validateForm(formData);

      if (!isValid) {
        setIsLoading(false);
        // Toast for overall validation failure (optional, as individual errors are shown)
        toast({
          title: "Validation Error",
          description: "Please correct the errors in the form.",
          variant: "destructive",
        });
        return;
      }

      // Prepare user data for API
      const userData = {
        name,
        email,
        password,
        phone,
        address,
        userType,
        // Include farmer fields if user is a farmer
        ...(userType === 'farmer' && {
          farmName,
          farmLocation,
          farmDescription
        })
      };

      // Send registration request to backend API
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Registration error:', errorData);
        throw new Error(errorData.message || `Registration failed with status: ${response.status}`);
      }

      const data = await response.json();

      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now login.",
      });

      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);

      // Check for network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Connection Error",
          description: "Cannot connect to the server. Please check if the backend is running.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration failed",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-green-50 via-white to-orange-50">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-2">Join GreenMandi</h1>
            <p className="text-muted-foreground text-lg">Create your account and start your journey</p>
          </div>

          <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="text-center pb-4 bg-gradient-to-r from-green-500/10 to-orange-500/10">
              <CardTitle className="text-2xl font-bold text-foreground">Create Account</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Choose your role and fill in your details
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
              <Tabs defaultValue={userType} onValueChange={setUserType} className="mb-8">
                <TabsList className="grid grid-cols-2 w-full h-14 bg-gray-100 rounded-2xl p-1">
                  <TabsTrigger
                    value="customer"
                    className="h-12 rounded-xl font-semibold text-base data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Customer
                  </TabsTrigger>
                  <TabsTrigger
                    value="farmer"
                    className="h-12 rounded-xl font-semibold text-base data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <Tractor className="w-4 h-4" />
                    Farmer
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-semibold">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className={`pl-12 h-12 bg-gray-50/50 border-2 ${validationErrors.name ? 'border-red-500' : 'border-gray-200'} focus:border-green-500 focus:bg-white transition-all duration-300`}
                      />
                    </div>
                    {validationErrors.name && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base font-semibold">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        id="phone"
                        placeholder="+91 98765 43210"
                        type="tel"
                        value={phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                        className={`pl-12 h-12 bg-gray-50/50 border-2 ${validationErrors.phone ? 'border-red-500' : 'border-gray-200'} focus:border-green-500 focus:bg-white transition-all duration-300`}
                      />
                    </div>
                    {validationErrors.phone && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="email"
                      placeholder="Enter your email address"
                      type="email"
                      value={email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className={`pl-12 h-12 bg-gray-50/50 border-2 ${validationErrors.email ? 'border-red-500' : 'border-gray-200'} focus:border-green-500 focus:bg-white transition-all duration-300`}
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-base font-semibold">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-muted-foreground w-5 h-5" />
                    <Textarea
                      id="address"
                      placeholder="Enter your complete address"
                      value={address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      required
                      className={`pl-12 pt-4 min-h-[60px] bg-gray-50/50 border-2 ${validationErrors.address ? 'border-red-500' : 'border-gray-200'} focus:border-green-500 focus:bg-white transition-all duration-300`}
                    />
                  </div>
                  {validationErrors.address && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.address}</p>
                  )}
                </div>

                {userType === 'farmer' && (
                  <div className="space-y-6 p-6 bg-orange-50/50 rounded-2xl border-2 border-orange-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Building className="w-5 h-5 text-orange-600" />
                      <h3 className="font-bold text-lg text-orange-800">Farm Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="farmName" className="text-base font-semibold">Farm Name</Label>
                        <Input
                          id="farmName"
                          placeholder="e.g., Green Valley Farm"
                          value={farmName}
                          onChange={(e) => handleInputChange('farmName', e.target.value)}
                          required={userType === 'farmer'}
                          className={`h-12 bg-white border-2 ${validationErrors.farmName ? 'border-red-500' : 'border-orange-200'} focus:border-orange-500 transition-all duration-300`}
                        />
                        {validationErrors.farmName && (
                          <p className="text-sm text-red-500 mt-1">{validationErrors.farmName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="farmLocation" className="text-base font-semibold">Farm Location</Label>
                        <Input
                          id="farmLocation"
                          placeholder="Village, District, State"
                          value={farmLocation}
                          onChange={(e) => handleInputChange('farmLocation', e.target.value)}
                          required={userType === 'farmer'}
                          className={`h-12 bg-white border-2 ${validationErrors.farmLocation ? 'border-red-500' : 'border-orange-200'} focus:border-orange-500 transition-all duration-300`}
                        />
                        {validationErrors.farmLocation && (
                          <p className="text-sm text-red-500 mt-1">{validationErrors.farmLocation}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="farmDescription" className="text-base font-semibold">Farm Description</Label>
                      <Textarea
                        id="farmDescription"
                        placeholder="Tell us about your farm, crops you grow, and farming practices..."
                        value={farmDescription}
                        onChange={(e) => handleInputChange('farmDescription', e.target.value)}
                        className="min-h-[80px] bg-white border-2 border-orange-200 focus:border-orange-500 transition-all duration-300"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-base font-semibold">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className={`pl-12 pr-12 h-12 bg-gray-50/50 border-2 ${validationErrors.password ? 'border-red-500' : 'border-gray-200'} focus:border-green-500 focus:bg-white transition-all duration-300`}
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-base font-semibold">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        required
                        className={`pl-12 pr-12 h-12 bg-gray-50/50 border-2 ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-200'} focus:border-green-500 focus:bg-white transition-all duration-300`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmCpfirmPassword(!showConfirmPassword)} // Fix: Typo
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {validationErrors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.confirmPassword}</p>
                    )}
                  </div>
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
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="px-8 pb-8">
              <div className="text-center w-full">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link
                  to="/login"
                  className="text-green-600 hover:text-green-700 transition-colors duration-200 font-semibold"
                >
                  Sign In
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Register;