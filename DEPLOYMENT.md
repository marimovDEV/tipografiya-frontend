# PrintERP Deployment Guide

## Prerequisites
- Vercel account (vercel.com)
- GitHub repository with this code
- Supabase project configured

## Environment Variables

Set these in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`

## Deployment Steps

1. Push code to GitHub main branch
2. Connect repository in Vercel
3. Add environment variables
4. Deploy automatically triggers

## Database Migrations

Run SQL scripts in order:
1. `scripts/001_create_base_schema.sql` - Foundation tables
2. `scripts/002_create_profile_trigger.sql` - User profile automation
3. `scripts/003_create_qc_tables.sql` - QC & inspection tables
4. `scripts/004_create_finance_tables.sql` - Finance tables

## Testing

Access the app at: `https://your-vercel-app.vercel.app`

Default test user login will be created in Supabase auth.
