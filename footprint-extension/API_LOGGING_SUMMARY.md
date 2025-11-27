# CogniSense API Integration & Logging Summary

## 🚀 Overview
Your Digital Footprint Tracker extension now has comprehensive API logging and integration with the CogniSense Backend API. All communication with the backend endpoints is now logged in detail for monitoring and debugging.

## 📡 API Integration Status

### ✅ Implemented Endpoints
1. **POST `/api/v1/tracking/ingest`** - Activity data tracking
2. **POST `/api/v1/content/analyze`** - Content analysis for sentiment, emotions, and categorization
3. **GET `/api/v1/ping`** - Connectivity testing
4. **GET `/api/v1/categories/labels`** - Fetch available content categories

### 🏗️ Backend Configuration
- **Base URL**: `http://localhost:8080/api/v1`
- **Authentication**: Bearer token support (when available)
- **User ID Management**: Automatic user ID generation and persistence

## 🔍 Enhanced Logging System

### Logger Features
The extension now includes a comprehensive logging system with these features:

```javascript
Logger.info()    // General information messages
Logger.warn()    // Warning messages
Logger.error()   // Error messages
Logger.api()     // Detailed API request/response logging
```

### What Gets Logged

#### 🌐 API Communications
- **Request Details**: Method, endpoint, full payload
- **Response Data**: Complete response with status codes
- **Error Handling**: Detailed error messages and status codes
- **Timing Information**: Request/response timing

#### 📊 Tracking Operations
- **Pause/Resume Actions**: State changes with timestamps
- **Time Tracking**: Session duration and site timing
- **Tab Navigation**: Active tab switching and URL changes
- **Content Analysis**: Sentiment and emotion analysis results

#### ⚙️ Extension Lifecycle
- **Initialization**: Extension startup and configuration
- **Storage Operations**: Data persistence and retrieval
- **Message Handling**: Communication between popup and background

### Example Log Output

```
[FOOTPRINT-TRACKER] 🚀 Digital Footprint Tracker background script initialized
[FOOTPRINT-TRACKER] 📡 API Base URL: http://localhost:8080/api/v1
[FOOTPRINT-TRACKER] Testing API connectivity...
[FOOTPRINT-API] GET /ping
  📤 Request Payload: null
  📥 Response: { "status": "ok", "version": "1.0.0" }
[FOOTPRINT-TRACKER] API connectivity test successful
[FOOTPRINT-TRACKER] ⏸️ TRACKING PAUSED
[FOOTPRINT-TRACKER] 💾 Saving 45s for github.com
[FOOTPRINT-API] POST /tracking/ingest
  📤 Request Payload: {
    "user_id": "user_1699123456789",
    "url": "https://github.com/...",
    "title": "GitHub Repository",
    "text": "Code repository content...",
    "start_ts": 1699123411.789,
    "end_ts": 1699123456.789,
    "duration_seconds": 45.0,
    "clicks": 12,
    "keypresses": 234,
    "engagement_score": 0.246
  }
  📥 Response: { "success": true, "tracking_id": "track_xyz123" }
```

## 🔧 API Functionality Details

### 1. Activity Tracking (`/tracking/ingest`)
**Purpose**: Send user browsing activity data to backend
**Payload includes**:
- User ID, URL, page title
- Start/end timestamps
- Duration in seconds
- User interaction data (clicks, keypresses)
- Calculated engagement score

**Logging**: Full request/response with timing information

### 2. Content Analysis (`/content/analyze`)
**Purpose**: Analyze page content for sentiment, emotions, and categorization
**Features**:
- Automatic content analysis when text is available
- Sentiment analysis (positive/negative/neutral)
- Emotion detection (joy, anger, sadness, etc.)
- Content categorization (work, entertainment, etc.)

**Logging**: Analysis requests with content snippets and full analysis results

### 3. Connectivity Testing (`/ping`)
**Purpose**: Verify backend is accessible
**When**: Extension initialization
**Logging**: Connection status and response timing

### 4. Category Management (`/categories/labels`)
**Purpose**: Fetch available content categories from backend
**When**: Extension initialization
**Logging**: Number of categories fetched and category list

## 🎛️ Enhanced Features

### Real-time Status Updates
- Pause/resume state tracking with immediate API notification
- Session data synchronization
- Tab switching with proper time attribution

### Error Handling & Resilience
- Graceful fallback when API is unavailable
- Retry logic for failed requests
- Detailed error logging with status codes

### User Privacy
- Configurable privacy mode
- Excluded sites management
- Content analysis can be disabled

## 🔍 How to Monitor API Communications

### Using Browser Dev Tools
1. Open Chrome DevTools (F12)
2. Go to **Console** tab
3. Look for messages starting with `[FOOTPRINT-TRACKER]` and `[FOOTPRINT-API]`

### Log Categories
- `🚀` - Initialization and startup
- `📡` - API connectivity
- `💾` - Data storage operations
- `⏸️/▶️` - Pause/resume actions
- `📊` - Statistics and analytics
- `🔍` - Content analysis
- `⚠️` - Warnings and errors

## 🚀 Ready for Production

The extension is now fully equipped with:
- ✅ Comprehensive API logging
- ✅ Error handling and resilience
- ✅ Full CogniSense API integration
- ✅ Real-time tracking with pause/play
- ✅ Content analysis capabilities
- ✅ Privacy and configuration controls

You can now monitor all API communications in the browser console and have full visibility into the data flow between your extension and the CogniSense backend!