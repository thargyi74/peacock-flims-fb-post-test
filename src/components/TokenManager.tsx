'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';

interface TokenResult {
  success?: boolean;
  longLivedUserToken?: string;
  userTokenExpiresIn?: number;
  pages?: Array<{
    id: string;
    name: string;
    access_token: string;
    tasks?: string[];
  }>;
  targetPageToken?: string;
  message?: string;
  tokenValid?: boolean;
  userInfo?: {
    id: string;
    name: string;
  };
  debugInfo?: {
    app_id: string;
    application: string;
    expires_at: number;
    is_valid: boolean;
    scopes: string[];
  };
  recommendations?: string[];
  error?: string;
}

export default function TokenManager() {
  const [shortToken, setShortToken] = useState('');
  const [result, setResult] = useState<TokenResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const exchangeToken = async () => {
    if (!shortToken.trim()) {
      setError('Please enter a short-lived token');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/facebook/extend-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shortLivedToken: shortToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to exchange token');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentToken = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/facebook/extend-token');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check token');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Facebook Token Manager</h2>
          <p className="text-gray-600">
            Exchange short-lived tokens for long-lived ones or check your current token status
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button 
              onClick={checkCurrentToken} 
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              Check Current Token
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Short-lived Token (optional):</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter your short-lived Facebook access token..."
                value={shortToken}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShortToken(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={exchangeToken} 
                disabled={loading || !shortToken.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                Exchange Token
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  {result.message || 'Token operation completed successfully'}
                </p>
              </div>

              {result.longLivedUserToken && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Long-lived User Token (60 days)</h3>
                  <div className="flex items-center gap-2">
                    <input 
                      value={result.longLivedUserToken} 
                      readOnly 
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(result.longLivedUserToken!, 'user')}
                      className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-1"
                    >
                      {copied === 'user' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {result.userTokenExpiresIn && (
                    <p className="text-sm text-gray-600 mt-2">
                      Expires in: {Math.floor(result.userTokenExpiresIn / 86400)} days
                    </p>
                  )}
                </div>
              )}

              {result.targetPageToken && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Page Access Token (Never Expires)</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    This token should never expire as long as you remain a page admin
                  </p>
                  <div className="flex items-center gap-2">
                    <input 
                      value={result.targetPageToken} 
                      readOnly 
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(result.targetPageToken!, 'page')}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                    >
                      {copied === 'page' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800 text-sm">
                      <strong>Important:</strong> Copy this token and update your FACEBOOK_ACCESS_TOKEN 
                      in your .env file for the best experience.
                    </p>
                  </div>
                </div>
              )}

              {result.pages && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Pages</h3>
                  <div className="space-y-2">
                    {result.pages.map((page) => (
                      <div key={page.id} className="p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="font-medium">{page.name}</div>
                        <div className="text-sm text-gray-600">ID: {page.id}</div>
                        <div className="text-sm text-gray-600">
                          Tasks: {page.tasks?.join(', ') || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.recommendations && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Recommendations</h3>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm">• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Instructions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">To get a never-expiring token:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Make sure you have FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in your .env</li>
              <li>Get a short-lived user access token from Facebook Graph API Explorer</li>
              <li>Paste it above and click &quot;Exchange Token&quot;</li>
              <li>Copy the &quot;Page Access Token&quot; (it never expires)</li>
              <li>Update your FACEBOOK_ACCESS_TOKEN in .env with this token</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Getting Facebook App Credentials:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to <a href="https://developers.facebook.com/" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Facebook Developers</a></li>
              <li>Select your app → Settings → Basic</li>
              <li>Copy App ID and App Secret</li>
              <li>Add them to your .env file</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
