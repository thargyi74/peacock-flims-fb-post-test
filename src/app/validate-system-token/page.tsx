'use client';

import { useState } from 'react';

interface ValidationResult {
  success: boolean;
  error?: string;
  details?: string;
  tokenValidation?: {
    isValid: boolean;
    isNeverExpiring: boolean;
    isSystemUser: boolean;
    appId: string;
    userId: string;
    scopes: string[];
    expiresAt: string | null;
  };
  pageAccess?: {
    totalPages: number;
    targetPageFound: boolean;
    targetPageName: string | null;
    targetPagePermissions: string[];
  };
  postsAccess?: {
    success: boolean;
    postsFound?: number;
    error?: string;
    message?: string;
  };
  recommendations?: string[];
}

export default function SystemTokenValidator() {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const validateToken = async () => {
    if (!token) {
      alert('Please enter a token');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/facebook/validate-system-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      setResult(data);
    } catch {
      setResult({
        success: false,
        error: 'Failed to validate token'
      });
    }
    setLoading(false);
  };

  const copyToEnv = () => {
    const envText = `FACEBOOK_ACCESS_TOKEN=${token}`;
    navigator.clipboard.writeText(envText);
    alert('Copied to clipboard! Add this to your .env file');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Facebook System User Token Validator
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Your System User Token</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System User Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste your system user token here..."
            />
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={validateToken}
              disabled={loading || !token}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Validating...' : 'Validate Token'}
            </button>
            
            {result?.success && (
              <button
                onClick={copyToEnv}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Copy to .env
              </button>
            )}
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Validation Results</h3>
            
            {result.success ? (
              <div className="space-y-6">
                {/* Token Info */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium text-green-800 mb-2">Token Information</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Valid:</strong> ✅ Yes</p>
                    <p><strong>Never Expires:</strong> {result.tokenValidation?.isNeverExpiring ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>System User:</strong> {result.tokenValidation?.isSystemUser ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>App ID:</strong> {result.tokenValidation?.appId}</p>
                    <p><strong>Scopes:</strong> {result.tokenValidation?.scopes.join(', ')}</p>
                    {result.tokenValidation?.expiresAt && (
                      <p><strong>Expires At:</strong> {result.tokenValidation.expiresAt}</p>
                    )}
                  </div>
                </div>

                {/* Page Access */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-blue-800 mb-2">Page Access</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Total Pages:</strong> {result.pageAccess?.totalPages}</p>
                    <p><strong>Target Page Found:</strong> {result.pageAccess?.targetPageFound ? '✅ Yes' : '❌ No'}</p>
                    {result.pageAccess?.targetPageName && (
                      <p><strong>Page Name:</strong> {result.pageAccess.targetPageName}</p>
                    )}
                    {result.pageAccess?.targetPagePermissions && result.pageAccess.targetPagePermissions.length > 0 && (
                      <p><strong>Permissions:</strong> {result.pageAccess.targetPagePermissions.join(', ')}</p>
                    )}
                  </div>
                </div>

                {/* Posts Access */}
                {result.postsAccess && (
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-medium text-purple-800 mb-2">Posts Access</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Status:</strong> {result.postsAccess.success ? '✅ Success' : '❌ Failed'}</p>
                      {result.postsAccess.success ? (
                        <p><strong>Posts Found:</strong> {result.postsAccess.postsFound}</p>
                      ) : (
                        <p><strong>Error:</strong> {result.postsAccess.error}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Recommendations</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {result.recommendations?.map((rec: string, index: number) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-medium text-red-800 mb-2">Validation Failed</h4>
                <p className="text-sm text-gray-600">{result.error}</p>
                {result.details && (
                  <p className="text-sm text-gray-500 mt-1">Details: {result.details}</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            How to Create a System User Token
          </h3>
          <ol className="text-sm text-blue-800 space-y-2">
            <li>1. Go to <a href="https://business.facebook.com" target="_blank" className="underline">business.facebook.com</a></li>
            <li>2. Navigate to Business Settings → System Users</li>
            <li>3. Click &quot;Add&quot; to create a new system user</li>
            <li>4. Assign your Facebook App and Page to the system user</li>
            <li>5. Generate a token with &quot;Never&quot; expiration</li>
            <li>6. Test the token using this page</li>
            <li>7. Update your .env file with the validated token</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
