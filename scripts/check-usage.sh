#!/bin/bash

# Free Tier Usage Checker
# Quick script to check your usage across all free services

echo "📊 Free Tier Usage Checker"
echo "=========================="
echo ""

echo "🔍 Check these URLs for your current usage:"
echo ""

echo "1. GitHub Actions (CI/CD):"
echo "   https://github.com/settings/billing"
echo "   Free: 2000 minutes/month (public) or 500 minutes/month (private)"
echo ""

echo "2. Vercel (Frontend):"
echo "   Run: vercel usage"
echo "   Or: https://vercel.com/dashboard"
echo "   Free: 100GB bandwidth/month"
echo ""

echo "3. Render (Backend):"
echo "   https://dashboard.render.com"
echo "   Free: 750 hours/month"
echo ""

echo "4. Supabase (Database):"
echo "   https://supabase.com/dashboard"
echo "   Free: 500MB database, 50MB file storage"
echo ""

echo "💡 Tips:"
echo "- Check usage weekly"
echo "- Monitor before you hit limits"
echo "- Optimize to stay free longer"
echo "- Only upgrade when necessary"
echo ""

echo "📚 For optimization tips:"
echo "   npm run usage:optimize"
echo ""

echo "🚀 For upgrade recommendations:"
echo "   npm run usage:upgrade"
echo ""

echo "📖 Full guide: FREE_TIER_STRATEGIES.md" 