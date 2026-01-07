'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';

export function ApiDebugger() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      setResult(`Testing connection to: ${apiUrl}\n\n`);
      
      // Test 1: Basic connection
      const response = await axios.get(`${apiUrl}/api/auth/`, {
        timeout: 5000,
      });
      
      setResult(prev => prev + `✅ API is reachable\n`);
      setResult(prev => prev + `Status: ${response.status}\n`);
      setResult(prev => prev + `Headers: ${JSON.stringify(response.headers, null, 2)}\n`);
    } catch (error: any) {
      setResult(prev => prev + `❌ Error: ${error.message}\n`);
      if (error.response) {
        setResult(prev => prev + `Response Status: ${error.response.status}\n`);
        setResult(prev => prev + `Response Data: ${JSON.stringify(error.response.data, null, 2)}\n`);
      } else if (error.request) {
        setResult(prev => prev + `No response received. Check CORS or network.\n`);
      }
    }
    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      setResult(`Testing login to: ${apiUrl}/api/auth/login/\n\n`);
      
      const response = await axios.post(
        `${apiUrl}/api/auth/login/`,
        {
          email: 'test@example.com',
          password: 'testpassword123'
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      
      setResult(prev => prev + `✅ Login endpoint is working\n`);
      setResult(prev => prev + `Response: ${JSON.stringify(response.data, null, 2)}\n`);
    } catch (error: any) {
      if (error.response) {
        setResult(prev => prev + `Response Status: ${error.response.status}\n`);
        setResult(prev => prev + `Response Data: ${JSON.stringify(error.response.data, null, 2)}\n`);
        
        if (error.response.status === 401 || error.response.status === 400) {
          setResult(prev => prev + `\n✅ Endpoint is working (credentials invalid as expected)\n`);
        }
      } else if (error.request) {
        setResult(prev => prev + `❌ No response received\n`);
        setResult(prev => prev + `Check CORS settings or network connectivity\n`);
      } else {
        setResult(prev => prev + `❌ Error: ${error.message}\n`);
      }
    }
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>API Connection Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testConnection} disabled={loading}>
            Test API Connection
          </Button>
          <Button onClick={testLogin} disabled={loading} variant="secondary">
            Test Login Endpoint
          </Button>
        </div>
        
        {result && (
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
            {result}
          </pre>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</p>
        </div>
      </CardContent>
    </Card>
  );
}
