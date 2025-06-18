# Facebook Page Posts Display

A Next.js application that displays Facebook posts from a Facebook page using the Facebook Graph API with `pages_read_engagement` and `pages_read_user_content` permissions.

## Features

- 📱 Responsive design for mobile and desktop
- 🔄 Real-time post fetching from Facebook Graph API
- 📄 Pagination support for loading more posts
- 💬 Display post engagement metrics (likes, comments, shares)
- 🖼️ Support for post images and attachments
- ⚡ Fast loading with Next.js App Router
- 🎨 Beautiful UI with Tailwind CSS

## Technologies Used

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Facebook Graph API** for data fetching
- **Lucide React** for icons
- **Axios** for HTTP requests
- **date-fns** for date formatting

## Setup Instructions

### 1. Facebook App Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add the "Facebook Login" product to your app
4. Generate an access token with the following permissions:
   - `pages_read_engagement`
   - `pages_read_user_content`
5. Get your Facebook Page ID

### 2. Environment Configuration


1. Copy the environment variables:

   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your Facebook credentials:

   ```bash
   FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here
   FACEBOOK_PAGE_ID=your_facebook_page_id_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 3. Installation and Development

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```text
src/
├── app/
│   ├── api/facebook/          # API routes for Facebook Graph API
│   │   ├── posts/route.ts     # Posts endpoint
│   │   └── page/route.ts      # Page info endpoint
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main page component
├── components/
│   ├── LoadingSpinner.tsx     # Loading component
│   ├── PageHeader.tsx         # Facebook page header
│   └── PostCard.tsx           # Individual post display
├── hooks/
│   └── useFacebookData.ts     # Custom hook for Facebook API
├── lib/
│   └── facebook-service.ts    # Facebook API service
└── types/
    └── facebook.ts            # TypeScript types
```

## API Endpoints

- `GET /api/facebook/posts` - Fetch Facebook posts with pagination
- `GET /api/facebook/page` - Fetch Facebook page information

## Facebook Graph API Permissions

This application requires the following Facebook Graph API permissions:

- **pages_read_engagement**: To read engagement data (likes, comments, shares)
- **pages_read_user_content**: To read posts and other content from the page

## Troubleshooting

### Common Issues

1. **"Failed to fetch posts"**: Check your access token and page ID
2. **CORS errors**: Ensure you're using the API routes, not direct client-side calls
3. **Rate limiting**: Implement proper caching and respect Facebook's rate limits

### Getting Your Facebook Page ID

1. Go to your Facebook page
2. Click "About" in the left sidebar
3. Scroll down to find "Page ID" or use the Graph API Explorer

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
