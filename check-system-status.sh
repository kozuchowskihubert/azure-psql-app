#!/bin/bash

# HAOS.fm System Status Check
# Quick diagnostic for OAuth and subscription system

echo "🔍 HAOS.fm System Status Check"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Check API endpoints
echo -e "${BLUE}1. Testing API Endpoints${NC}"
echo "-----------------------------------"

echo -n "  /api/auth/me (no cookie): "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://haos.fm/api/auth/me)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✅ $STATUS${NC}"
else
    echo -e "${RED}❌ $STATUS${NC}"
fi

echo -n "  /api/subscriptions/plans: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://haos.fm/api/subscriptions/plans)
PLANS=$(curl -s https://haos.fm/api/subscriptions/plans | jq -r '.plans | length' 2>/dev/null)
if [ "$STATUS" = "200" ] && [ "$PLANS" = "4" ]; then
    echo -e "${GREEN}✅ $STATUS (4 plans)${NC}"
else
    echo -e "${RED}❌ $STATUS ($PLANS plans)${NC}"
fi

echo -n "  /auth/google: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L https://haos.fm/auth/google)
if [ "$STATUS" = "302" ] || [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✅ $STATUS${NC}"
else
    echo -e "${RED}❌ $STATUS${NC}"
fi

echo ""

# 2. Check pages
echo -e "${BLUE}2. Testing Pages${NC}"
echo "-----------------------------------"

PAGES=(
    "https://haos.fm/login.html"
    "https://haos.fm/subscription.html"
    "https://haos.fm/account.html"
    "https://haos.fm/debug-session.html"
)

for page in "${PAGES[@]}"; do
    NAME=$(basename "$page")
    echo -n "  $NAME: "
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$page")
    if [ "$STATUS" = "200" ]; then
        echo -e "${GREEN}✅ $STATUS${NC}"
    else
        echo -e "${RED}❌ $STATUS${NC}"
    fi
done

echo ""

# 3. Check PayU configuration
echo -e "${BLUE}3. PayU Configuration${NC}"
echo "-----------------------------------"

PLANS_DATA=$(curl -s https://haos.fm/api/subscriptions/plans)
HAS_PAYU=$(echo "$PLANS_DATA" | jq -r '.providers | index("payu")' 2>/dev/null)

if [ "$HAS_PAYU" != "null" ]; then
    echo -e "  PayU provider: ${GREEN}✅ Available${NC}"
    
    # Show plans with prices
    echo ""
    echo "  Available plans:"
    echo "$PLANS_DATA" | jq -r '.plans[] | "    • \(.name): \(.priceMonthlyFormatted)/month"' 2>/dev/null
else
    echo -e "  PayU provider: ${RED}❌ Not available${NC}"
fi

echo ""

# 4. Summary
echo -e "${BLUE}4. System Status Summary${NC}"
echo "-----------------------------------"

AUTH_OK=$([ "$STATUS" = "200" ] && echo "1" || echo "0")
PLANS_OK=$([ "$PLANS" = "4" ] && echo "1" || echo "0")
PAYU_OK=$([ "$HAS_PAYU" != "null" ] && echo "1" || echo "0")

TOTAL=$((AUTH_OK + PLANS_OK + PAYU_OK))

if [ "$TOTAL" = "3" ]; then
    echo -e "${GREEN}✅ All systems operational!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Open: https://haos.fm/debug-session.html"
    echo "  2. Test Google OAuth login"
    echo "  3. Verify session persists (cookie exists)"
    echo "  4. Test PayU checkout on subscription page"
elif [ "$TOTAL" -ge "2" ]; then
    echo -e "${YELLOW}⚠️  Most systems working ($TOTAL/3)${NC}"
    echo "Check failed items above"
else
    echo -e "${RED}❌ Critical issues detected ($TOTAL/3)${NC}"
    echo "Review all failed checks above"
fi

echo ""
echo "-----------------------------------"
echo "🔗 Quick Links:"
echo "   Debug:        https://haos.fm/debug-session.html"
echo "   Login:        https://haos.fm/login.html"
echo "   Subscription: https://haos.fm/subscription.html"
echo "   Account:      https://haos.fm/account.html"
echo ""
