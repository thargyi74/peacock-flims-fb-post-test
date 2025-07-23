export default function GetPageIdPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Get Page ID</h1>
          <p className="text-gray-600">
            This page can be used to retrieve the Facebook Page ID from the environment configuration.
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold text-blue-800 mb-2">Current Page ID:</h2>
            <code className="text-blue-700">
              {process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID || 'Not configured publicly'}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
