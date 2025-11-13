#!/bin/bash

echo "======================================"
echo "ReceiptBank API - Comprehensive Testing"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3001"
TOKEN=""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
RESPONSE=$(curl -s ${BASE_URL}/health)
echo $RESPONSE | python3 -m json.tool
if echo $RESPONSE | grep -q "ok"; then
  echo -e "${GREEN}✓ Health check passed${NC}"
else
  echo -e "${RED}✗ Health check failed${NC}"
fi
echo ""

# Test 2: User Registration
echo -e "${YELLOW}Test 2: User Registration${NC}"
RESPONSE=$(curl -s -X POST ${BASE_URL}/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"password123","firstName":"Test","lastName":"User"}')
echo $RESPONSE | python3 -m json.tool 2>/dev/null || echo $RESPONSE
if echo $RESPONSE | grep -q "token"; then
  echo -e "${GREEN}✓ Registration successful${NC}"
  TOKEN=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
elif echo $RESPONSE | grep -q "already exists"; then
  echo -e "${YELLOW}⚠ User already exists, trying login...${NC}"
  # Test 3: User Login
  echo -e "${YELLOW}Test 3: User Login${NC}"
  RESPONSE=$(curl -s -X POST ${BASE_URL}/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"testuser@example.com","password":"password123"}')
  echo $RESPONSE | python3 -m json.tool 2>/dev/null || echo $RESPONSE
  if echo $RESPONSE | grep -q "token"; then
    echo -e "${GREEN}✓ Login successful${NC}"
    TOKEN=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
  else
    echo -e "${RED}✗ Login failed${NC}"
  fi
else
  echo -e "${RED}✗ Registration failed${NC}"
fi
echo ""

# Test 4: Get User Profile
if [ ! -z "$TOKEN" ]; then
  echo -e "${YELLOW}Test 4: Get User Profile${NC}"
  RESPONSE=$(curl -s ${BASE_URL}/api/auth/me \
    -H "Authorization: Bearer $TOKEN")
  echo $RESPONSE | python3 -m json.tool 2>/dev/null || echo $RESPONSE
  if echo $RESPONSE | grep -q "email"; then
    echo -e "${GREEN}✓ Profile retrieved${NC}"
  else
    echo -e "${RED}✗ Profile retrieval failed${NC}"
  fi
  echo ""

  # Test 5: Get Receipts (should be empty)
  echo -e "${YELLOW}Test 5: Get Receipts${NC}"
  RESPONSE=$(curl -s ${BASE_URL}/api/receipts \
    -H "Authorization: Bearer $TOKEN")
  echo $RESPONSE | python3 -m json.tool 2>/dev/null || echo $RESPONSE
  if echo $RESPONSE | grep -q "\[\]"; then
    echo -e "${GREEN}✓ Receipts endpoint working (empty array)${NC}"
  elif echo $RESPONSE | grep -q "id"; then
    echo -e "${GREEN}✓ Receipts endpoint working (has receipts)${NC}"
  else
    echo -e "${RED}✗ Receipts endpoint failed${NC}"
  fi
  echo ""

  # Test 6: Get Receipt Stats
  echo -e "${YELLOW}Test 6: Get Receipt Stats${NC}"
  RESPONSE=$(curl -s ${BASE_URL}/api/receipts/stats \
    -H "Authorization: Bearer $TOKEN")
  echo $RESPONSE | python3 -m json.tool 2>/dev/null || echo $RESPONSE
  if echo $RESPONSE | grep -q "totalEarnings"; then
    echo -e "${GREEN}✓ Stats endpoint working${NC}"
  else
    echo -e "${RED}✗ Stats endpoint failed${NC}"
  fi
  echo ""

  # Test 7: Get Withdrawals (should be empty)
  echo -e "${YELLOW}Test 7: Get Withdrawals${NC}"
  RESPONSE=$(curl -s ${BASE_URL}/api/withdrawals \
    -H "Authorization: Bearer $TOKEN")
  echo $RESPONSE | python3 -m json.tool 2>/dev/null || echo $RESPONSE
  if echo $RESPONSE | grep -q "\[\]"; then
    echo -e "${GREEN}✓ Withdrawals endpoint working (empty array)${NC}"
  elif echo $RESPONSE | grep -q "id"; then
    echo -e "${GREEN}✓ Withdrawals endpoint working (has withdrawals)${NC}"
  else
    echo -e "${RED}✗ Withdrawals endpoint failed${NC}"
  fi
  echo ""

  # Test 8: Withdrawal Validation (below minimum)
  echo -e "${YELLOW}Test 8: Test Withdrawal Validation (below minimum)${NC}"
  RESPONSE=$(curl -s -X POST ${BASE_URL}/api/withdrawals/request \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"amount":5,"paymentMethod":"paypal","paymentEmail":"test@paypal.com"}')
  echo $RESPONSE | python3 -m json.tool 2>/dev/null || echo $RESPONSE
  if echo $RESPONSE | grep -iq "minimum"; then
    echo -e "${GREEN}✓ Minimum validation working${NC}"
  else
    echo -e "${YELLOW}⚠ Validation response unexpected${NC}"
  fi
  echo ""

else
  echo -e "${RED}Skipping authenticated tests - no token available${NC}"
fi

# Test 9: Unauthenticated Access
echo -e "${YELLOW}Test 9: Test Unauthenticated Access${NC}"
RESPONSE=$(curl -s ${BASE_URL}/api/receipts)
echo $RESPONSE | python3 -m json.tool 2>/dev/null || echo $RESPONSE
if echo $RESPONSE | grep -q "Unauthorized\|token\|authentication"; then
  echo -e "${GREEN}✓ Authentication required (as expected)${NC}"
else
  echo -e "${RED}✗ Endpoint should require authentication${NC}"
fi
echo ""

echo "======================================"
echo "Test Summary"
echo "======================================"
echo -e "✓ = Test Passed"
echo -e "⚠ = Warning/Expected behavior"
echo -e "✗ = Test Failed"
