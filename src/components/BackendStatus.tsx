import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Wifi, WifiOff } from 'lucide-react';

interface BackendStatusProps {
  className?: string;
}

const BackendStatus: React.FC<BackendStatusProps> = ({ className = '' }) => {
  const [backendType, setBackendType] = useState<'supabase' | 'mock' | 'checking'>('checking');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      // Try to import and test Supabase
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Test connection with a simple query
      const { error } = await supabase.from('farmers').select('count').limit(1);
      
      if (!error) {
        setBackendType('supabase');
        setConnectionStatus('connected');
      } else {
        throw new Error('Supabase connection failed');
      }
    } catch (error) {
      // Fallback to mock backend
      setBackendType('mock');
      setConnectionStatus('connected');
      console.log('Using Mock Backend:', error);
    }
  };

  const getStatusBadge = () => {
    if (connectionStatus === 'checking') {
      return <Badge variant="secondary">Checking...</Badge>;
    }

    if (backendType === 'supabase') {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <Wifi className="w-3 h-3 mr-1" />
          Supabase Connected
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-800">
        <WifiOff className="w-3 h-3 mr-1" />
        Mock Backend
      </Badge>
    );
  };

  const getStatusIcon = () => {
    if (connectionStatus === 'connected') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getDescription = () => {
    if (backendType === 'supabase') {
      return 'Connected to cloud database with full functionality.';
    }
    return 'Using local mock data. All features work with sample data.';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {getStatusIcon()}
      {getStatusBadge()}
    </div>
  );
};

export const BackendStatusCard: React.FC = () => {
  const [backendType, setBackendType] = useState<'supabase' | 'mock' | 'checking'>('checking');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase.from('farmers').select('count').limit(1);
      
      setBackendType(!error ? 'supabase' : 'mock');
    } catch (error) {
      setBackendType('mock');
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          Backend Status
          <BackendStatus />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm text-muted-foreground mb-3">
          {backendType === 'supabase' 
            ? 'Connected to cloud database with full functionality.' 
            : 'Using local mock data. All features work with sample data for demonstration.'}
        </div>
        
        {backendType === 'mock' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <h4 className="font-semibold text-blue-800 mb-2">Mock Backend Features:</h4>
            <ul className="text-blue-700 space-y-1 list-disc list-inside">
              <li>Sample farmer profile (Rajesh Kumar from Bangalore)</li>
              <li>Real weather data using your OpenWeatherMap API</li>
              <li>Mock crop journal with sample entries</li>
              <li>Simulated soil and satellite analysis</li>
              <li>Sample market price data</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BackendStatus;