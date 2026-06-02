#!/bin/bash

TEST_URL="http://localhost:3000"
LOGIN_EMAIL="test-male@example.com"
LOGIN_PASSWORD="password123"

echo "🔐 Testing Login API..."
LOGIN_RESPONSE=$(curl -s -X POST "$TEST_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$LOGIN_EMAIL\",\"password\":\"$LOGIN_PASSWORD\"}")

echo "Login response: $LOGIN_RESPONSE"

# Extract token (adjust based on actual response structure)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  # Try alternate field names
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
fi

if [ -n "$TOKEN" ]; then
  echo "✅ Got token: ${TOKEN:0:20}..."
  
  echo ""
  echo "📍 Testing /api/me endpoint..."
  curl -s -H "Authorization: Bearer $TOKEN" "$TEST_URL/api/me" | jq .
else
  echo "❌ No token in response"
  echo "Full response: $LOGIN_RESPONSE"
fi

echo ""
echo "🖼️  Testing celebrity image endpoints..."
echo "Female 1 image:"
curl -s -I "$TEST_URL/images/celebrities/female_1.jpg" | head -5

echo ""
echo "🔍 Checking image file existence on disk..."
if [ -f "public/images/celebrities/female_1.jpg" ]; then
  echo "✅ female_1.jpg exists"
  ls -lh public/images/celebrities/female_*.jpg | wc -l
  echo "  Female images found"
else
  echo "❌ female_1.jpg not found"
  echo "Contents of public/images/celebrities/:"
  ls -la public/images/celebrities/ 2>/dev/null || echo "Directory not found"
fi
