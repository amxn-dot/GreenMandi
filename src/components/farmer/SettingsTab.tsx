
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

interface FarmerProfile {
  farmName: string;
  farmerName: string;
  location: string;
  phone: string;
  description: string;
}

interface SettingsTabProps {
  farmerProfile: FarmerProfile;
  isSavingProfile: boolean;
  onProfileChange: (field: keyof FarmerProfile, value: string) => void;
  onSaveProfile: () => void;
  onResetProfile: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ 
  farmerProfile, 
  isSavingProfile, 
  onProfileChange, 
  onSaveProfile, 
  onResetProfile 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Farmer Profile</CardTitle>
        <CardDescription>
          Update your farm details and settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="farmName">Farm Name *</Label>
            <Input 
              id="farmName" 
              value={farmerProfile.farmName}
              onChange={(e) => onProfileChange('farmName', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="farmerName">Owner Name *</Label>
            <Input 
              id="farmerName" 
              value={farmerProfile.farmerName}
              onChange={(e) => onProfileChange('farmerName', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Farm Location *</Label>
            <Input 
              id="location" 
              value={farmerProfile.location}
              onChange={(e) => onProfileChange('location', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Contact Number *</Label>
            <Input 
              id="phone" 
              value={farmerProfile.phone}
              onChange={(e) => onProfileChange('phone', e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">About Your Farm</Label>
          <Textarea 
            id="description" 
            rows={4}
            value={farmerProfile.description}
            onChange={(e) => onProfileChange('description', e.target.value)}
          />
        </div>
        
        <div className="flex justify-between pt-6 border-t">
          <Button 
            variant="outline"
            onClick={onResetProfile}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSaveProfile}
            disabled={isSavingProfile}
            className="bg-green-500 hover:bg-green-600"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSavingProfile ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;
