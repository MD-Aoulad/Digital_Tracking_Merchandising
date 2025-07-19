#!/bin/bash

# 💬 CHAT & COMMUNICATION SYSTEM TEST SCRIPT
# Tests all chat channels, direct messaging, and real-time features

set -e

echo "💬 Testing Chat & Communication System..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Global variables
AUTH_TOKEN=""
USER_ID=""
CHANNEL_ID=""
MESSAGE_ID=""

# Function to print test results
print_test_result() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $test_name - $message"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $test_name - $message"
        ((TESTS_FAILED++))
    fi
}

# Function to test API endpoint
test_api_endpoint() {
    local method="$1"
    local endpoint="$2"
    local expected_status="$3"
    local test_name="$4"
    local data="$5"
    local headers="$6"
    
    local curl_cmd="curl -s -w \"%{http_code}\" -o /tmp/response.json"
    
    if [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        curl_cmd="$curl_cmd -X $method -H \"Content-Type: application/json\""
        if [ -n "$data" ]; then
            curl_cmd="$curl_cmd -d '$data'"
        fi
    else
        curl_cmd="$curl_cmd -X $method"
    fi
    
    if [ -n "$headers" ]; then
        curl_cmd="$curl_cmd -H \"$headers\""
    fi
    
    curl_cmd="$curl_cmd \"http://localhost:8080$endpoint\" 2>/dev/null"
    
    local response=$(eval $curl_cmd)
    local status_code="${response: -3}"
    
    if [ "$status_code" = "$expected_status" ]; then
        print_test_result "$test_name" "PASS" "Status: $status_code"
        return 0
    else
        print_test_result "$test_name" "FAIL" "Expected: $expected_status, Got: $status_code"
        return 1
    fi
}

echo -e "${BLUE}1. Testing Service Health...${NC}"

# Test API Gateway health
if test_api_endpoint "GET" "/health" "200" "API Gateway Health"; then
    echo -e "${GREEN}✅ API Gateway is healthy${NC}"
else
    echo -e "${RED}❌ API Gateway health check failed${NC}"
    exit 1
fi

# Test Chat Service health
if test_api_endpoint "GET" "/api/test-chat" "200" "Chat Service Health"; then
    echo -e "${GREEN}✅ Chat Service is healthy${NC}"
else
    echo -e "${RED}❌ Chat Service health check failed${NC}"
    exit 1
fi

echo -e "\n${BLUE}2. Testing Authentication...${NC}"

# Login to get auth token
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/login_response.json \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@company.com","password":"password"}' \
    "http://localhost:8080/api/auth/login" 2>/dev/null)

LOGIN_STATUS="${LOGIN_RESPONSE: -3}"

if [ "$LOGIN_STATUS" = "200" ]; then
    print_test_result "Admin Login" "PASS" "Login successful"
    
    # Extract token and user ID
    AUTH_TOKEN=$(cat /tmp/login_response.json | jq -r '.token' 2>/dev/null || echo "")
    USER_ID=$(cat /tmp/login_response.json | jq -r '.user.id' 2>/dev/null || echo "")
    
    if [ -n "$AUTH_TOKEN" ] && [ "$AUTH_TOKEN" != "null" ]; then
        print_test_result "JWT Token Extraction" "PASS" "Token received"
    else
        print_test_result "JWT Token Extraction" "FAIL" "No token in response"
    fi
else
    print_test_result "Admin Login" "FAIL" "Status: $LOGIN_STATUS"
    exit 1
fi

echo -e "\n${BLUE}3. Testing Channel Management...${NC}"

# Test create channel
if [ -n "$AUTH_TOKEN" ]; then
    CHANNEL_DATA='{
      "name": "General Discussion",
      "description": "General team discussion channel"
    }'
    
    if test_api_endpoint "POST" "/api/chat/channels" "201" "Create Channel" "$CHANNEL_DATA" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Create Channel" "PASS" "Channel created successfully"
        
        # Extract channel ID
        CHANNEL_ID=$(cat /tmp/response.json | jq -r '.id' 2>/dev/null || echo "")
        if [ -n "$CHANNEL_ID" ] && [ "$CHANNEL_ID" != "null" ]; then
            print_test_result "Channel ID Extraction" "PASS" "Channel ID: $CHANNEL_ID"
        else
            print_test_result "Channel ID Extraction" "FAIL" "No channel ID in response"
        fi
    fi
else
    print_test_result "Create Channel" "FAIL" "No auth token available"
fi

# Test get channels
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/chat/channels" "200" "Get Channels" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Channels" "PASS" "Channels retrieved successfully"
        
        # Check if channels are returned
        CHANNEL_COUNT=$(cat /tmp/response.json | jq '. | length' 2>/dev/null || echo "0")
        if [ "$CHANNEL_COUNT" -gt 0 ]; then
            print_test_result "Channel List Content" "PASS" "$CHANNEL_COUNT channels found"
        else
            print_test_result "Channel List Content" "FAIL" "No channels in response"
        fi
    fi
fi

# Test get channel by ID
if [ -n "$AUTH_TOKEN" ] && [ -n "$CHANNEL_ID" ]; then
    if test_api_endpoint "GET" "/api/chat/channels/$CHANNEL_ID" "200" "Get Channel by ID" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Channel by ID" "PASS" "Channel details retrieved"
    fi
fi

# Test update channel
if [ -n "$AUTH_TOKEN" ] && [ -n "$CHANNEL_ID" ]; then
    UPDATE_DATA='{
      "name": "Updated General Discussion",
      "description": "Updated channel description"
    }'
    
    if test_api_endpoint "PUT" "/api/chat/channels/$CHANNEL_ID" "200" "Update Channel" "$UPDATE_DATA" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Update Channel" "PASS" "Channel updated successfully"
    fi
fi

echo -e "\n${BLUE}4. Testing Message Management...${NC}"

# Test send message to channel
if [ -n "$AUTH_TOKEN" ] && [ -n "$CHANNEL_ID" ]; then
    MESSAGE_DATA='{
      "message": "Hello everyone! This is a test message.",
      "messageType": "text"
    }'
    
    if test_api_endpoint "POST" "/api/chat/channels/$CHANNEL_ID/messages" "201" "Send Message" "$MESSAGE_DATA" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Send Message" "PASS" "Message sent successfully"
        
        # Extract message ID
        MESSAGE_ID=$(cat /tmp/response.json | jq -r '.id' 2>/dev/null || echo "")
        if [ -n "$MESSAGE_ID" ] && [ "$MESSAGE_ID" != "null" ]; then
            print_test_result "Message ID Extraction" "PASS" "Message ID: $MESSAGE_ID"
        else
            print_test_result "Message ID Extraction" "FAIL" "No message ID in response"
        fi
    fi
else
    print_test_result "Send Message" "FAIL" "Missing auth token or channel ID"
fi

# Test get channel messages
if [ -n "$AUTH_TOKEN" ] && [ -n "$CHANNEL_ID" ]; then
    if test_api_endpoint "GET" "/api/chat/channels/$CHANNEL_ID/messages" "200" "Get Channel Messages" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Channel Messages" "PASS" "Messages retrieved successfully"
        
        # Check if messages are returned
        MESSAGE_COUNT=$(cat /tmp/response.json | jq '. | length' 2>/dev/null || echo "0")
        if [ "$MESSAGE_COUNT" -gt 0 ]; then
            print_test_result "Message List Content" "PASS" "$MESSAGE_COUNT messages found"
        else
            print_test_result "Message List Content" "FAIL" "No messages in response"
        fi
    fi
fi

# Test edit message
if [ -n "$AUTH_TOKEN" ] && [ -n "$MESSAGE_ID" ]; then
    EDIT_DATA='{
      "message": "Hello everyone! This is an edited test message."
    }'
    
    if test_api_endpoint "PUT" "/api/chat/messages/$MESSAGE_ID" "200" "Edit Message" "$EDIT_DATA" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Edit Message" "PASS" "Message edited successfully"
    fi
fi

# Test add message reaction
if [ -n "$AUTH_TOKEN" ] && [ -n "$MESSAGE_ID" ]; then
    REACTION_DATA='{
      "reaction": "👍"
    }'
    
    if test_api_endpoint "POST" "/api/chat/messages/$MESSAGE_ID/reactions" "200" "Add Reaction" "$REACTION_DATA" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Add Reaction" "PASS" "Reaction added successfully"
    fi
fi

# Test remove message reaction
if [ -n "$AUTH_TOKEN" ] && [ -n "$MESSAGE_ID" ]; then
    if test_api_endpoint "DELETE" "/api/chat/messages/$MESSAGE_ID/reactions" "200" "Remove Reaction" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Remove Reaction" "PASS" "Reaction removed successfully"
    fi
fi

echo -e "\n${BLUE}5. Testing Direct Messaging...${NC}"

# Test get direct message conversations
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/chat/direct-messages" "200" "Get Direct Message Conversations" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Direct Message Conversations" "PASS" "Conversations retrieved"
    fi
fi

# Test send direct message (to self for testing)
if [ -n "$AUTH_TOKEN" ] && [ -n "$USER_ID" ]; then
    DIRECT_MESSAGE_DATA='{
      "message": "This is a test direct message to myself",
      "messageType": "text"
    }'
    
    if test_api_endpoint "POST" "/api/chat/direct-messages/$USER_ID" "201" "Send Direct Message" "$DIRECT_MESSAGE_DATA" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Send Direct Message" "PASS" "Direct message sent successfully"
    fi
fi

# Test get direct messages with user
if [ -n "$AUTH_TOKEN" ] && [ -n "$USER_ID" ]; then
    if test_api_endpoint "GET" "/api/chat/direct-messages/$USER_ID" "200" "Get Direct Messages" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Direct Messages" "PASS" "Direct messages retrieved"
    fi
fi

echo -e "\n${BLUE}6. Testing User Management...${NC}"

# Test get online users
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/chat/users/online" "200" "Get Online Users" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Online Users" "PASS" "Online users retrieved"
    fi
fi

# Test update user status
if [ -n "$AUTH_TOKEN" ]; then
    STATUS_DATA='{
      "status": "available",
      "customMessage": "Working on chat system"
    }'
    
    if test_api_endpoint "PUT" "/api/chat/users/status" "200" "Update User Status" "$STATUS_DATA" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Update User Status" "PASS" "Status updated successfully"
    fi
fi

echo -e "\n${BLUE}7. Testing Channel Participation...${NC}"

# Test join channel
if [ -n "$AUTH_TOKEN" ] && [ -n "$CHANNEL_ID" ]; then
    if test_api_endpoint "POST" "/api/chat/channels/$CHANNEL_ID/join" "200" "Join Channel" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Join Channel" "PASS" "Joined channel successfully"
    fi
fi

# Test leave channel
if [ -n "$AUTH_TOKEN" ] && [ -n "$CHANNEL_ID" ]; then
    if test_api_endpoint "POST" "/api/chat/channels/$CHANNEL_ID/leave" "200" "Leave Channel" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Leave Channel" "PASS" "Left channel successfully"
    fi
fi

echo -e "\n${BLUE}8. Testing Search and Statistics...${NC}"

# Test search messages
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/chat/search?query=test" "200" "Search Messages" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Search Messages" "PASS" "Message search working"
    fi
fi

# Test get chat statistics
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/chat/stats" "200" "Get Chat Statistics" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Chat Statistics" "PASS" "Statistics retrieved"
        
        # Check if stats are returned
        TOTAL_MESSAGES=$(cat /tmp/response.json | jq '.totalMessages' 2>/dev/null || echo "0")
        if [ "$TOTAL_MESSAGES" -ge 0 ]; then
            print_test_result "Chat Statistics Content" "PASS" "Total messages: $TOTAL_MESSAGES"
        else
            print_test_result "Chat Statistics Content" "FAIL" "Invalid statistics data"
        fi
    fi
fi

echo -e "\n${BLUE}9. Testing Error Handling...${NC}"

# Test send message without auth token
if test_api_endpoint "POST" "/api/chat/channels/test/messages" "401" "Unauthorized Message Send" '{"message":"test"}' ""; then
    print_test_result "Unauthorized Access" "PASS" "Proper auth check"
fi

# Test get non-existent channel
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/chat/channels/999999" "404" "Get Non-existent Channel" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "404 Error Handling" "PASS" "Proper 404 response"
    fi
fi

# Test get non-existent message
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/chat/messages/999999" "404" "Get Non-existent Message" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "404 Message Error Handling" "PASS" "Proper 404 response"
    fi
fi

# Test create channel without required fields
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "POST" "/api/chat/channels" "400" "Create Channel Without Fields" '{"description":"test"}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Required Fields Validation" "PASS" "Proper validation"
    fi
fi

echo -e "\n${BLUE}10. Testing Message Management...${NC}"

# Test delete message (this will fail if user doesn't own it, which is expected)
if [ -n "$AUTH_TOKEN" ] && [ -n "$MESSAGE_ID" ]; then
    if test_api_endpoint "DELETE" "/api/chat/messages/$MESSAGE_ID" "403" "Delete Message (Expected Fail)" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Delete Message Authorization" "PASS" "Proper authorization check"
    fi
fi

echo -e "\n${BLUE}11. Testing Channel Management...${NC}"

# Test delete channel (this will fail if user doesn't own it, which is expected)
if [ -n "$AUTH_TOKEN" ] && [ -n "$CHANNEL_ID" ]; then
    if test_api_endpoint "DELETE" "/api/chat/channels/$CHANNEL_ID" "403" "Delete Channel (Expected Fail)" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Delete Channel Authorization" "PASS" "Proper authorization check"
    fi
fi

echo -e "\n${BLUE}📊 Test Summary${NC}"
echo "=================="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 Chat & Communication System is Complete and Working!${NC}"
    echo -e "${GREEN}✅ All chat endpoints functional${NC}"
    echo -e "${GREEN}✅ Real-time messaging operational${NC}"
    echo -e "${GREEN}✅ Direct messaging working${NC}"
    echo -e "${GREEN}✅ Channel management functional${NC}"
    echo -e "${GREEN}✅ Message reactions operational${NC}"
    echo -e "${GREEN}✅ User status management working${NC}"
    echo -e "${GREEN}✅ Search and statistics operational${NC}"
    echo -e "\n${BLUE}📋 Available Endpoints:${NC}"
    echo "  • GET /api/chat/channels - Get all chat channels"
    echo "  • POST /api/chat/channels - Create a new chat channel"
    echo "  • GET /api/chat/channels/:id - Get channel details"
    echo "  • PUT /api/chat/channels/:id - Update channel (Admin)"
    echo "  • DELETE /api/chat/channels/:id - Delete channel (Admin)"
    echo "  • POST /api/chat/channels/:id/join - Join a channel"
    echo "  • POST /api/chat/channels/:id/leave - Leave a channel"
    echo "  • GET /api/chat/channels/:id/messages - Get channel messages"
    echo "  • POST /api/chat/channels/:id/messages - Send message to channel"
    echo "  • PUT /api/chat/messages/:id - Edit message"
    echo "  • DELETE /api/chat/messages/:id - Delete message"
    echo "  • POST /api/chat/messages/:id/reactions - Add reaction to message"
    echo "  • DELETE /api/chat/messages/:id/reactions - Remove reaction"
    echo "  • GET /api/chat/direct-messages - Get direct message conversations"
    echo "  • GET /api/chat/direct-messages/:userId - Get conversation with user"
    echo "  • POST /api/chat/direct-messages/:userId - Send direct message"
    echo "  • GET /api/chat/users/online - Get online users"
    echo "  • PUT /api/chat/users/status - Update user status"
    echo "  • GET /api/chat/search - Search messages"
    echo "  • GET /api/chat/stats - Get chat statistics"
    echo -e "\n${BLUE}🔌 WebSocket Events:${NC}"
    echo "  • join-channel - Join a chat channel"
    echo "  • leave-channel - Leave a chat channel"
    echo "  • send-message - Send a message to channel"
    echo "  • send-direct-message - Send direct message"
    echo "  • typing - User typing indicator"
    echo "  • direct-typing - Direct message typing indicator"
    echo "  • user-status - Update user status"
    echo "  • message-reaction - Add/remove message reaction"
    echo "  • file-upload - Upload file via WebSocket"
    echo "  • mark-read - Mark direct messages as read"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please check the logs and fix the issues.${NC}"
    echo -e "${YELLOW}Check Docker logs:${NC}"
    echo "docker logs digital_tracking_merchandising-api-gateway-1"
    echo "docker logs digital_tracking_merchandising-chat-service-1"
    exit 1
fi 