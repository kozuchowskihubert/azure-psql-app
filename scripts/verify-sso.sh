#!/bin/bash

# SSO Feature Verification Script
# Tests if Single Sign-On is properly configured and working

set -e

APP_URL="https://notesapp-dev-app.azurewebsites.net"

echo "========================================="
echo "SSO Feature Verification"
echo "========================================="
echo ""
echo "App URL: $APP_URL"
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
echo "-------------------"
HEALTH=$(curl -s "$APP_URL/health")
echo "$HEALTH" | jq . 2>/dev/null || echo "$HEALTH"
echo ""

# Test 2: Check if auth routes exist
echo "Test 2: Auth Status Endpoint"
echo "----------------------------"
echo "Testing: $APP_URL/api/auth/status"
AUTH_STATUS=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$APP_URL/api/auth/status")
HTTP_CODE=$(echo "$AUTH_STATUS" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE=$(echo "$AUTH_STATUS" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Auth endpoint is available"
    echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ Auth endpoint not found (SSO not enabled)"
else
    echo "⚠️  HTTP Status: $HTTP_CODE"
fi
echo ""

# Test 3: Check Azure AD login endpoint
echo "Test 3: Azure AD Login Endpoint"
echo "-------------------------------"
echo "Testing: $APP_URL/api/auth/login/azure"
AZURE_LOGIN=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$APP_URL/api/auth/login/azure")
HTTP_CODE=$(echo "$AZURE_LOGIN" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Azure AD login endpoint exists"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ Azure AD login endpoint not found"
else
    echo "⚠️  HTTP Status: $HTTP_CODE"
fi
echo ""

# Test 4: Check Google login endpoint
echo "Test 4: Google Login Endpoint"
echo "-----------------------------"
echo "Testing: $APP_URL/api/auth/login/google"
GOOGLE_LOGIN=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$APP_URL/api/auth/login/google")
HTTP_CODE=$(echo "$GOOGLE_LOGIN" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Google login endpoint exists"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ Google login endpoint not found"
else
    echo "⚠️  HTTP Status: $HTTP_CODE"
fi
echo ""

# Test 5: Calendar API
echo "Test 5: Calendar API"
echo "--------------------"
echo "Testing: $APP_URL/api/calendar/events"
CALENDAR=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$APP_URL/api/calendar/events")
HTTP_CODE=$(echo "$CALENDAR" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
    echo "✅ Calendar API endpoint exists"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ Calendar API not enabled"
else
    echo "⚠️  HTTP Status: $HTTP_CODE"
fi
echo ""

# Test 6: Meeting API
echo "Test 6: Meeting API"
echo "-------------------"
echo "Testing: $APP_URL/api/meetings/rooms"
MEETINGS=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$APP_URL/api/meetings/rooms")
HTTP_CODE=$(echo "$MEETINGS" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
    echo "✅ Meeting API endpoint exists"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ Meeting API not enabled"
else
    echo "⚠️  HTTP Status: $HTTP_CODE"
fi
echo ""

# Summary
echo "========================================="
echo "Summary"
echo "========================================="
echo ""
echo "Based on the tests above:"
echo ""
echo "If endpoints return 404:"
echo "  → Feature flags are not enabled in Azure"
echo "  → Run: ./infra/enable-features.sh"
echo ""
echo "If endpoints return 401:"
echo "  → APIs are enabled but require authentication"
echo "  → This is expected behavior"
echo ""
echo "If endpoints return 200:"
echo "  → APIs are enabled and working"
echo ""
echo "To enable SSO, you need to:"
echo "1. Register Azure AD application"
echo "2. Register Google OAuth application"
echo "3. Set environment variables:"
echo "   - ENABLE_SSO=true"
echo "   - AZURE_AD_CLIENT_ID=..."
echo "   - AZURE_AD_CLIENT_SECRET=..."
echo "   - GOOGLE_CLIENT_ID=..."
echo "   - GOOGLE_CLIENT_SECRET=..."
echo ""
echo "See: docs/IMPLEMENTATION_GUIDE.md"
echo ""
