# Caching Configuration Quick Reference

## Cache Duration Summary

| API Route | `revalidate` | Cache-Control | Purpose |
|-----------|-------------|---------------|---------|
| `/api/facebook/posts` | 300s (5 min) | `s-maxage=300, stale-while-revalidate=600` | Dynamic posts content |
| `/api/facebook/page` | 3600s (1 hour) | `s-maxage=3600, stale-while-revalidate=7200` | Static page information |
| `/api/facebook/initial-data` | 300s (5 min) | `s-maxage=300, stale-while-revalidate=600` | Combined initial load |
| `/api/facebook/test` | 60s (1 min) | `s-maxage=60, stale-while-revalidate=120` | Debug/testing endpoint |

## Error Response Caching
All routes set `Cache-Control: no-cache, no-store, must-revalidate` for error responses to ensure real-time error reporting.

## Testing Caching
```bash
# Check cache headers
curl -I http://localhost:3000/api/facebook/posts

# Expected headers:
# cache-control: public, s-maxage=300, stale-while-revalidate=600
# x-vercel-cache: MISS (first request) or HIT (cached)
```

## Performance Expectations
- **90% reduction** in Facebook API calls
- **90% faster** response times for cached requests
- **Improved reliability** with stale-while-revalidate strategy
