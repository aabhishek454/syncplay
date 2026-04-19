#!/bin/bash
npm install -g vercel
vercel login
vercel link
vercel env pull .env.local
vercel --prod
echo "Live at your Vercel URL above"
