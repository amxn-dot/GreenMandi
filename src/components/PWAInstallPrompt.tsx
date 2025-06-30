
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

interface PWAInstallPromptProps {
  onDismiss?: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onDismiss }) => {
  const { isInstallable, installApp } = usePWA();

  const handleInstall = async () => {
    const success = await installApp();
    if (success && onDismiss) {
      onDismiss();
    }
  };

  if (!isInstallable) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 md:bottom-6 md:left-auto md:right-6 md:w-80 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Install GreenMandi</CardTitle>
            <CardDescription className="text-sm">
              Get quick access to fresh produce directly from farmers
            </CardDescription>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            onClick={handleInstall}
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Install App
          </Button>
          {onDismiss && (
            <Button
              variant="outline"
              onClick={onDismiss}
              size="sm"
            >
              Later
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;
