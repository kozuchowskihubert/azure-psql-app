#!/bin/bash

# 🧪 PayU Payment Test Monitor
# Quick commands for testing PayU subscription flow

echo "🧪 HAOS.fm PayU Payment Test Monitor"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
function test_auth_session() {
    echo -e "${BLUE}📋 Testing /api/auth/me${NC}"
    echo "Enter your session cookie (or press enter to skip):"
    read -r SESSION_COOKIE
    
    if [ -z "$SESSION_COOKIE" ]; then
        curl -s https://haos.fm/api/auth/me | jq
    else
        curl -s https://haos.fm/api/auth/me --cookie "haos_session=$SESSION_COOKIE" | jq
    fi
}

function test_subscription_plans() {
    echo -e "${BLUE}📋 Testing /api/subscriptions/plans${NC}"
    curl -s https://haos.fm/api/subscriptions/plans | jq '.plans[] | {name, price_monthly: .priceMonthlyFormatted, trial_days}'
}

function test_current_subscription() {
    echo -e "${BLUE}📋 Testing /api/subscriptions/current${NC}"
    echo "Enter your session cookie:"
    read -r SESSION_COOKIE
    
    if [ -z "$SESSION_COOKIE" ]; then
        echo -e "${RED}❌ Session cookie required${NC}"
        return
    fi
    
    curl -s https://haos.fm/api/subscriptions/current --cookie "haos_session=$SESSION_COOKIE" | jq
}

function check_database_subscription() {
    echo -e "${BLUE}📋 Checking subscription in database${NC}"
    echo "Enter user ID:"
    read -r USER_ID
    
    if [ -z "$USER_ID" ]; then
        echo -e "${RED}❌ User ID required${NC}"
        return
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${YELLOW}⚠️  DATABASE_URL not set. Set it first:${NC}"
        echo "export DATABASE_URL='your-connection-string'"
        return
    fi
    
    psql "$DATABASE_URL" -c "
        SELECT 
            us.id,
            us.plan_code,
            us.status,
            us.billing_cycle,
            us.current_period_start::date as start_date,
            us.current_period_end::date as end_date,
            us.trial_end::date as trial_end,
            us.created_at::timestamp as created
        FROM user_subscriptions us
        WHERE us.user_id = $USER_ID
        ORDER BY us.created_at DESC
        LIMIT 1;
    "
}

function watch_vercel_logs() {
    echo -e "${BLUE}📋 Watching Vercel logs for webhook calls${NC}"
    echo "Press Ctrl+C to stop"
    echo ""
    
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Vercel CLI not installed${NC}"
        echo "Install: npm i -g vercel"
        return
    fi
    
    vercel logs --follow | grep -E "PayU|webhook|subscription|COMPLETED"
}

function simulate_webhook() {
    echo -e "${BLUE}📋 Simulating PayU webhook (LOCAL ONLY)${NC}"
    echo "Enter user ID:"
    read -r USER_ID
    
    if [ -z "$USER_ID" ]; then
        echo -e "${RED}❌ User ID required${NC}"
        return
    fi
    
    EXT_ORDER_ID="HAOS_${USER_ID}_$(date +%s)"
    
    echo ""
    echo "Sending webhook to http://localhost:3000..."
    echo "extOrderId: $EXT_ORDER_ID"
    echo ""
    
    curl -X POST http://localhost:3000/api/payments/webhooks/payu \
        -H "Content-Type: application/json" \
        -H "OpenPayU-Signature: signature=test;algorithm=MD5" \
        -d "{
            \"order\": {
                \"orderId\": \"TEST_$(date +%s)\",
                \"extOrderId\": \"$EXT_ORDER_ID\",
                \"status\": \"COMPLETED\",
                \"totalAmount\": \"1999\",
                \"currencyCode\": \"PLN\",
                \"buyer\": {
                    \"email\": \"test@haos.fm\"
                }
            }
        }" | jq
}

function test_subscribe_endpoint() {
    echo -e "${BLUE}📋 Testing /api/subscriptions/subscribe${NC}"
    echo "Enter session cookie:"
    read -r SESSION_COOKIE
    
    if [ -z "$SESSION_COOKIE" ]; then
        echo -e "${RED}❌ Session cookie required${NC}"
        return
    fi
    
    echo "Plan code (basic/premium/pro):"
    read -r PLAN_CODE
    PLAN_CODE=${PLAN_CODE:-basic}
    
    curl -X POST https://haos.fm/api/subscriptions/subscribe \
        -H "Content-Type: application/json" \
        -H "Cookie: haos_session=$SESSION_COOKIE" \
        -d "{
            \"planCode\": \"$PLAN_CODE\",
            \"billingCycle\": \"monthly\",
            \"provider\": \"payu\"
        }" | jq
}

function open_test_pages() {
    echo -e "${BLUE}📋 Opening test pages in browser${NC}"
    
    open https://haos.fm/login.html
    sleep 1
    open https://haos.fm/subscription.html
    sleep 1
    open https://haos.fm/test-oauth.html
    
    echo -e "${GREEN}✅ Opened 3 tabs${NC}"
}

# Menu
while true; do
    echo ""
    echo -e "${YELLOW}Choose a test:${NC}"
    echo "1) Test /api/auth/me (check session)"
    echo "2) Test /api/subscriptions/plans"
    echo "3) Test /api/subscriptions/current"
    echo "4) Test /api/subscriptions/subscribe"
    echo "5) Check database subscription"
    echo "6) Watch Vercel logs (webhook monitor)"
    echo "7) Simulate webhook (LOCAL only)"
    echo "8) Open test pages in browser"
    echo "9) Exit"
    echo ""
    echo -n "Enter choice [1-9]: "
    read -r choice
    
    case $choice in
        1) test_auth_session ;;
        2) test_subscription_plans ;;
        3) test_current_subscription ;;
        4) test_subscribe_endpoint ;;
        5) check_database_subscription ;;
        6) watch_vercel_logs ;;
        7) simulate_webhook ;;
        8) open_test_pages ;;
        9) echo "Goodbye!"; exit 0 ;;
        *) echo -e "${RED}Invalid choice${NC}" ;;
    esac
done
