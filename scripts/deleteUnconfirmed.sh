#!/bin/bash

BASE_URL="http://localhost:8000"
DATA='{"days": 2}'

response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/bookings/deleteNonConfirmed" \
  -H "Content-Type: application/json" \
  -d "$DATA")

echo "Response: $response"
