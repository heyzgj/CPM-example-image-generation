'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiKeyService, type ApiKeyStatus } from "@/lib/api-key-service";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<ApiKeyStatus>({
    isConfigured: false,
    isValid: false,
    lastValidated: null,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load initial status
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const currentStatus = await apiKeyService.getApiKeyStatus();
      setStatus(currentStatus);
    } catch (error) {
      console.error('Failed to load API key status:', error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await apiKeyService.storeApiKey(apiKey.trim());
      setApiKey(''); // Clear input
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await loadStatus(); // Refresh status
    } catch (error) {
      console.error('Failed to save API key:', error);
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to save API key'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (!confirm('Are you sure you want to delete your API key? This cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      await apiKeyService.deleteApiKey();
      await loadStatus(); // Refresh status
    } catch (error) {
      console.error('Failed to delete API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const result = await apiKeyService.testConnection();
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
      await loadStatus(); // Refresh status
    } catch (error) {
      console.error('Failed to test connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!status.isConfigured) return 'bg-gray-400';
    if (status.isValid) return 'bg-green-400';
    return 'bg-red-400';
  };

  const getStatusText = () => {
    if (!status.isConfigured) return 'Not configured';
    if (status.isValid) return 'Valid and ready';
    return status.error || 'Invalid or expired';
  };

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your API key and app preferences
          </p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">✓ Success! API key updated successfully.</p>
          </div>
        )}

        <div className="space-y-6">
          {/* API Key Section */}
          <Card>
            <CardHeader>
              <CardTitle>Gemini API Key</CardTitle>
              <CardDescription>
                Your API key is stored securely in your browser and never sent to our servers.
                You need a Gemini API key to use the image transformation features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleSaveApiKey}
                    disabled={!apiKey.trim() || isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
                {status.error && (
                  <p className="mt-2 text-sm text-red-600">{status.error}</p>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">How to get your API key:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Visit the <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
                  <li>Sign in with your Google account</li>
                  <li>Create a new API key</li>
                  <li>Copy and paste it above</li>
                </ol>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">API Key Status</p>
                  <p className="text-sm text-gray-500">{getStatusText()}</p>
                  {status.lastValidated && (
                    <p className="text-xs text-gray-400">
                      Last validated: {status.lastValidated.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
              </div>

              {status.isConfigured && (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={isLoading}
                    size="sm"
                  >
                    {isLoading ? 'Testing...' : 'Test Connection'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDeleteApiKey}
                    disabled={isLoading}
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    Delete Key
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card>
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
              <CardDescription>
                Your data security is our priority
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-green-600 mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p>API key is encrypted using Web Crypto API and stored only in your browser</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-green-600 mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p>No server-side storage of your API credentials</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-green-600 mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p>Direct API calls to Google&apos;s servers</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-green-600 mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p>Device-specific encryption keys ensure maximum security</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 