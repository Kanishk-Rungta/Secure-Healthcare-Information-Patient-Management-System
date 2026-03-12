#!/bin/bash

# This script generates secure random values for environment variables
# Run this in your terminal before setting Vercel environment variables

echo "======================================================"
echo "Secure Environment Variable Generator"
echo "======================================================"
echo ""

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    echo "Error: openssl is required. Please install it."
    exit 1
fi

echo "Generating secure random values..."
echo ""

echo "1. JWT_SECRET (Access Token):"
JWT_SECRET=$(openssl rand -base64 32)
echo "   $JWT_SECRET"
echo ""

echo "2. JWT_REFRESH_SECRET (Refresh Token):"
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
echo "   $JWT_REFRESH_SECRET"
echo ""

echo "3. ENCRYPTION_KEY (32 hex characters):"
ENCRYPTION_KEY=$(openssl rand -hex 16)
echo "   $ENCRYPTION_KEY"
echo ""

echo "4. SESSION_SECRET:"
SESSION_SECRET=$(openssl rand -base64 32)
echo "   $SESSION_SECRET"
echo ""

echo "======================================================"
echo "IMPORTANT: Copy these values to Vercel"
echo "======================================================"
echo ""
echo "Backend Environment Variables to add in Vercel:"
echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo "SESSION_SECRET=$SESSION_SECRET"
echo ""
echo "======================================================"
