'use client';

import { useState } from 'react';

interface TestResults {
  success: boolean;
  summary: {
    overallStatus: string;
    checksCompleted: {
      tokenValid: boolean;
      hasAdminAccess: boolean;
      isAdminOfTargetPage: boolean;
      pageAccessible: boolean;
      postsAccessible: boolean;
    };
    recommendations: string[];
  };
  results: {
    tokenCheck: {
      success: boolean;
      error: string;
      data: unknown;
    };
    adminCheck: {
      success: boolean;
      error: string;
      data: unknown;
    };
    pageInfo: {
      success: boolean;
      error: string;
      data: unknown;
    };
    postsCheck: {
      success: boolean;
      error: string;
      data: unknown;
    };
    errors: string[];
  };
  timestamp: string;
}

export default function TestConnectionPage() {
  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [customPageId, setCustomPageId] = useState('');
  const [customToken, setCustomToken] = useState('');

  const runTest = async () => {
    setLoading(true);
    setResults(null);

    try {
      const params = new URLSearchParams();
      if (customPageId.trim()) params.append('page_id', customPageId.trim());
      if (customToken.trim()) params.append('access_token', customToken.trim());

      const url = `/api/facebook/test-connection${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      setResults(data);
    } catch (error) {
      setResults({
        success: false,
        summary: {
          overallStatus: 'ERROR',
          checksCompleted: {
            tokenValid: false,
            hasAdminAccess: false,
            isAdminOfTargetPage: false,
            pageAccessible: false,
            postsAccessible: false
          },
          recommendations: ['Check your network connection and try again']
        },
        results: {
          tokenCheck: { success: false, error: 'Network error', data: null },
          adminCheck: { success: false, error: 'Network error', data: null },
          pageInfo: { success: false, error: 'Network error', data: null },
          postsCheck: { success: false, error: 'Network error', data: null },
          errors: ['Network error occurred']
        },
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? '✅' : '❌';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-green-600 bg-green-50 border-green-200';
      case 'PARTIAL_SUCCESS': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'ERROR': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Facebook API Connection Test
          </h1>
          
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h2 className="text-lg font-medium text-blue-900 mb-2">What This Test Does</h2>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Validates your Facebook access token</li>
              <li>• Checks if you have admin access to Facebook pages</li>
              <li>• Verifies page information access</li>
              <li>• Tests ability to fetch posts from your page</li>
              <li>• Provides recommendations for fixing issues</li>
            </ul>
          </div>

          <div className="mb-6 space-y-4">
            <div>
              <label htmlFor="customPageId" className="block text-sm font-medium text-gray-700 mb-2">
                Page ID (optional - uses .env if empty)
              </label>
              <input
                id="customPageId"
                type="text"
                value={customPageId}
                onChange={(e) => setCustomPageId(e.target.value)}
                placeholder="Enter Facebook Page ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="customToken" className="block text-sm font-medium text-gray-700 mb-2">
                Access Token (optional - uses .env if empty)
              </label>
              <input
                id="customToken"
                type="password"
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                placeholder="Enter Facebook Access Token"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={runTest}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-6 rounded-md transition-colors"
          >
            {loading ? 'Running Tests...' : 'Test Facebook Connection'}
          </button>

          {results && (
            <div className="mt-8 space-y-6">
              {/* Overall Status */}
              <div className={`border rounded-md p-4 ${getStatusColor(results.summary.overallStatus)}`}>
                <h2 className="text-xl font-bold mb-2">
                  Overall Status: {results.summary.overallStatus}
                </h2>
                <p className="text-sm">
                  Test completed at {new Date(results.timestamp).toLocaleString()}
                </p>
              </div>

              {/* Checks Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Test Results Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(results.summary.checksCompleted).map(([key, status]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-lg">{getStatusIcon(status)}</span>
                      <span className="text-sm font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Results */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Token Check */}
                {results.results.tokenCheck && (
                  <div className="bg-white border border-gray-200 rounded-md p-4">
                    <h4 className="font-medium text-gray-800 mb-2">
                      {getStatusIcon(results.results.tokenCheck.success)} Token Validation
                    </h4>
                    {results.results.tokenCheck.success ? (
                      <div className="text-sm text-gray-600">
                        <p><strong>User:</strong> {(results.results.tokenCheck.data as any)?.name || 'N/A'}</p>
                        <p><strong>ID:</strong> {(results.results.tokenCheck.data as any)?.id || 'N/A'}</p>
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">
                        Error: {results.results.tokenCheck.error || 'Token validation failed'}
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Check */}
                {results.results.adminCheck && (
                  <div className="bg-white border border-gray-200 rounded-md p-4">
                    <h4 className="font-medium text-gray-800 mb-2">
                      {getStatusIcon(results.results.adminCheck.success)} Admin Access
                    </h4>
                    {results.results.adminCheck.success ? (
                      <div className="text-sm text-gray-600">
                        <p><strong>Total Pages:</strong> {(results.results.adminCheck.data as any)?.totalPages || 0}</p>
                        <p><strong>Admin of Target:</strong> {getStatusIcon((results.results.adminCheck.data as any)?.isAdminOfTargetPage)}</p>
                        {(results.results.adminCheck.data as any)?.targetPageInfo && (
                          <p><strong>Page:</strong> {(results.results.adminCheck.data as any)?.targetPageInfo.name}</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">
                        Error: {results.results.adminCheck.error || 'Admin access failed'}
                      </div>
                    )}
                  </div>
                )}

                {/* Page Info */}
                {results.results.pageInfo && (
                  <div className="bg-white border border-gray-200 rounded-md p-4">
                    <h4 className="font-medium text-gray-800 mb-2">
                      {getStatusIcon(results.results.pageInfo.success)} Page Information
                    </h4>
                    {results.results.pageInfo.success ? (
                      <div className="text-sm text-gray-600">
                        <p><strong>Name:</strong> {(results.results.pageInfo.data as any)?.name || 'N/A'}</p>
                        <p><strong>Category:</strong> {(results.results.pageInfo.data as any)?.category || 'N/A'}</p>
                        <p><strong>Fans:</strong> {(results.results.pageInfo.data as any)?.fan_count || 'N/A'}</p>
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">
                        Error: {results.results.pageInfo.error || 'Page access failed'}
                      </div>
                    )}
                  </div>
                )}

                {/* Posts Check */}
                {results.results.postsCheck && (
                  <div className="bg-white border border-gray-200 rounded-md p-4">
                    <h4 className="font-medium text-gray-800 mb-2">
                      {getStatusIcon(results.results.postsCheck.success)} Posts Access
                    </h4>
                    {results.results.postsCheck.success ? (
                      <div className="text-sm text-gray-600">
                        <p><strong>Posts Found:</strong> {(results.results.postsCheck.data as any)?.totalPosts || 0}</p>
                        {(results.results.postsCheck.data as any)?.samplePosts?.length > 0 && (
                          <div className="mt-2">
                            <p><strong>Recent Posts:</strong></p>
                            <ul className="mt-1 space-y-1">
                              {(results.results.postsCheck.data as any).samplePosts.map((post: any, index: number) => (
                                <li key={post.id} className="text-xs">
                                  {index + 1}. {post.message || 'No text content'}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">
                        Error: {results.results.postsCheck.error || 'Posts access failed'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {results.summary.recommendations.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-yellow-800 mb-3">Recommendations</h3>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    {results.summary.recommendations.map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Errors */}
              {results.results.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-red-800 mb-3">Errors Encountered</h3>
                  <ul className="text-red-700 text-sm space-y-1">
                    {results.results.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
