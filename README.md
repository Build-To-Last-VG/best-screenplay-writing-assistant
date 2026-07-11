# Stomo — From the story in your heart to the people who need to hear it

A web app for screenwriters, novelists, and TV creators to:
- Answer guided questions about their story
- Generate a beautiful Story Bible
- Export and save their work

**Live at:** stomo-write.com

## Quick Start

1. **Deploy to Vercel**
   ```bash
   git push
   # Vercel auto-deploys
   ```

2. **Configure Supabase**
   - Create a project at supabase.com
   - Run SQL schema from schema.sql
   - Add API keys to Vercel environment variables

3. **Set Environment Variables in Vercel**
   - VITE_SUPABASE_URL: https://vdtiqjwatlxjunqunlyk.supabase.co
   - VITE_SUPABASE_ANON_KEY: [your publishable key]
   - VITE_BUFFER_API_KEY: [your buffer key]

## Files

- `src/App.jsx` - React app with Supabase integration
- `schema.sql` - Database schema (run in Supabase)
- `brand-config.json` - Brand colors and guidelines
- `index.html` - Vite entry point
- `vite.config.js` - Build configuration
- `vercel.json` - Deployment config

## Brand

- **Domain:** stomo-write.com
- **Colors:** Amber (#D97706), Dark Blue (#1E3A8A), Old Paper (#FAF8F3)
- **Tagline:** From the story in your heart to the people who need to hear it

## Next Steps

1. Run schema.sql in Supabase
2. Deploy on Vercel (auto-deploys on git push)
3. Test: Sign up → Create story → Save

## Agent System (Next Weekend)

Marketing, Reach, Product, Tech, and Finance agents to:
- Generate and post content to Buffer
- Track SEO and discoverability
- Manage paid ads (Google, Facebook)
- Monitor infrastructure
- Track metrics and growth

See brand-config.json for marketing guidelines.
