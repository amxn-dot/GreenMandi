
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserRound, Save } from 'lucide-react';

interface UserData {
  name: string;
  email: string;
  phone: string;
  address: string;
  userType: string;
  farmName?: string;
  farmLocation?: string;
  farmDescription?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmDescription, setFarmDescription] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const userType = localStorage.getItem('userType');
    if (!userType) {
      toast({
        title: "Authentication required",
        description: "Please login to access your profile",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    // Load user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const parsedUserData: UserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
      
      // Set form values
      setName(parsedUserData.name || '');
      setEmail(parsedUserData.email || '');
      setPhone(parsedUserData.phone || '');
      setAddress(parsedUserData.address || '');
      
      if (parsedUserData.userType === 'farmer') {
        setFarmName(parsedUserData.farmName || '');
        setFarmLocation(parsedUserData.farmLocation || '');
        setFarmDescription(parsedUserData.farmDescription || '');
      }
    }
  }, [navigate, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!userData) throw new Error("User data not found");
      
      const updatedUserData = {
        ...userData,
        name,
        email,
        phone,
        address,
        ...(userData.userType === 'farmer' && {
          farmName,
          farmLocation,
          farmDescription
        })
      };
      
      // Save updated user data
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      setIsEditing(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">Your Profile</CardTitle>
                  <CardDescription>
                    View and update your personal information
                  </CardDescription>
                </div>
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <UserRound className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!isEditing}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!isEditing}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={!isEditing}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  {userData.userType === 'farmer' && (
                    <div className="space-y-4 border-t border-border pt-4 mt-4">
                      <h3 className="font-medium">Farm Details</h3>
                      <div className="space-y-2">
                        <Label htmlFor="farmName">Farm Name</Label>
                        <Input
                          id="farmName"
                          value={farmName}
                          onChange={(e) => setFarmName(e.target.value)}
                          disabled={!isEditing}
                          required={userData.userType === 'farmer'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="farmLocation">Farm Location</Label>
                        <Input
                          id="farmLocation"
                          value={farmLocation}
                          onChange={(e) => setFarmLocation(e.target.value)}
                          disabled={!isEditing}
                          required={userData.userType === 'farmer'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="farmDescription">Farm Description</Label>
                        <Textarea
                          id="farmDescription"
                          value={farmDescription}
                          onChange={(e) => setFarmDescription(e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <div className="flex justify-end mt-6 space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-green-500 hover:bg-green-600"
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
            {!isEditing && (
              <CardFooter className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={() => setIsEditing(true)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Edit Profile
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
