import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from "lucide-react";

export default function NetworkErrorHandler({ error, onRetry, showRetry = true, fullPage = false }) {
  const isNetworkError = error?.message?.includes('Network Error') || 
                        error?.code === 'ERR_NETWORK' ||
                        error?.name === 'AxiosError' ||
                        error?.message?.includes('fetch') ||
                        !navigator.onLine;

  if (!isNetworkError) return null;

  const isOffline = !navigator.onLine;

  const content = (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {isOffline ? (
            <WifiOff className="w-8 h-8 text-red-600" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-red-600" />
          )}
        </div>
        <CardTitle className="text-xl text-slate-900">
          {isOffline ? 'You\'re Offline' : 'Connection Problem'}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {isOffline ? (
              <div>
                <p className="mb-2">No internet connection detected.</p>
                <p>Please check your connection and try again.</p>
              </div>
            ) : (
              <div>
                We're having trouble connecting to our servers. This could be due to:
                <ul className="list-disc list-inside mt-2 text-left">
                  <li>Temporary network connectivity issues</li>
                  <li>Server maintenance</li>
                  <li>Firewall or proxy restrictions</li>
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
        
        {showRetry && (
          <div className="space-y-3">
            <Button 
              onClick={onRetry} 
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {isOffline ? 'Check Connection' : 'Try Again'}
            </Button>
            <p className="text-sm text-slate-500">
              {isOffline ? 
                'Make sure you have an active internet connection.' :
                'If the problem persists, please try again in a few minutes or contact support.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return <div className="mt-8">{content}</div>;
}