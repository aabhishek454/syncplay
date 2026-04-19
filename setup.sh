#!/bin/bash
git init
git add .
git commit -m "feat: syncplay real-time music controller"
gh repo create syncplay --public --source=. --remote=origin --push
echo "Repo created. Now add these GitHub secrets:"
echo "  VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID"
echo "  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY"
