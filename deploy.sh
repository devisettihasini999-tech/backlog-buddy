#!/usr/bin/env bash
# ============================================================================
# Backlog Buddy - deploy helper
#   1) push to GitHub    2) deploy to Vercel (needs a valid VERCEL_TOKEN)
# ============================================================================
set -e
cd "$(dirname "$0")"

GITHUB_REPO="${GITHUB_REPO:-https://github.com/devisettihasini999-tech/backlog-buddy.git}"

echo "==> Pushing to GitHub"
git add -A
git commit -q -m "Update Backlog Buddy" || echo "   nothing to commit"
git push -q "$GITHUB_REPO" main
echo "   pushed"

if [ -z "$VERCEL_TOKEN" ]; then
  echo ""
  echo "==> VERCEL_TOKEN is not set - skipping the Vercel deployment."
  echo "    Create a token at https://vercel.com/account/tokens then run:"
  echo "      VERCEL_TOKEN=xxxx ./deploy.sh"
  exit 0
fi

echo ""
echo "==> Deploying to Vercel"
npx --yes vercel@latest deploy --prod --yes --token "$VERCEL_TOKEN"
