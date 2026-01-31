# Vercel Deployment Guide

## Environment Variables Setup

When deploying to Vercel, you need to set the following environment variables in your Vercel project settings:

### Required Variables

1. **NEXT_PUBLIC_API_URL**
   - Your Render backend service URL
   - Example: `https://your-app.onrender.com`

2. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Example: `https://your-project.supabase.co`

3. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous/public key
   - Found in Supabase Dashboard → Settings → API

4. **NEXTAUTH_URL**
   - Your production URL
   - For Vercel: `https://your-app.vercel.app`
   - Vercel automatically provides `VERCEL_URL`, but you can set `NEXTAUTH_URL` explicitly

5. **NEXTAUTH_SECRET**
   - A random secret string for NextAuth
   - Generate with: `openssl rand -base64 32`
   - Or use any secure random string generator

### How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `NEXT_PUBLIC_API_URL`)
   - **Value**: Your actual value
   - **Environment**: Select which environments (Production, Preview, Development)
4. Click **Save**

### Important Notes

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Never commit `.env.local` to git (it's already in `.gitignore`)
- After adding environment variables, redeploy your application
- Vercel automatically provides `VERCEL_URL` environment variable

### Quick Setup Checklist

- [ ] Set `NEXT_PUBLIC_API_URL` to your Render backend URL
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` from Supabase dashboard
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase dashboard
- [ ] Set `AUTH_URL` to your Vercel production URL
- [ ] Generate and set `AUTH_SECRET`
- [ ] Set `AUTH_GOOGLE_ID` from Google Cloud Console
- [ ] Set `AUTH_GOOGLE_SECRET` from Google Cloud Console
- [ ] Redeploy your application
