# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Next.js project for displaying Facebook posts from a Facebook page using the Facebook Graph API with `pages_read_engagement` and `pages_read_user_content` permissions.

## Key Technologies
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Facebook Graph API

## Code Generation Guidelines
- Use TypeScript for all new files
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Implement proper error handling for API calls
- Use environment variables for sensitive data like API keys
- Follow React best practices with hooks and components
- Ensure responsive design for mobile and desktop

## Facebook Graph API Integration
- Use `pages_read_engagement` permission for engagement metrics
- Use `pages_read_user_content` permission for reading posts
- Implement proper error handling for API failures
- Cache API responses when appropriate
- Handle rate limiting and pagination

## Security Considerations
- Never expose Facebook access tokens in client-side code
- Use Next.js API routes for server-side API calls
- Validate all incoming data
- Implement proper CORS settings
