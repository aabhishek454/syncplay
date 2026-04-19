#!/usr/bin/env bash
set -e

npm i -g vercel

vercel login

vercel link

vercel env pull .env.local

vercel --prod

echo "🚀 Deployment complete! Live URL:"
vercel ls | grep "(production)" | awk '{print $2}'
