
# 🦶 Digital Footprint Tracker

An advanced browser extension for comprehensive digital activity tracking and analysis. Monitor your online behavior, analyze content consumption, and gain insights into your digital habits with AI-powered analytics.

## 🌟 Features

### Core Tracking
- **Time Tracking**: Accurate session duration monitoring across all websites
- **Engagement Analytics**: Track clicks, keystrokes, scrolls, mouse movements, and form interactions
- **Site Categorization**: Automatic classification of websites (productivity, entertainment, social, etc.)
- **Privacy-First**: All data stored locally with optional API integration

### Advanced Analysis (Phase 1)
- **Content Analysis**: AI-powered sentiment and content quality analysis
- **Emotional Balance**: Track emotional tone of consumed content (positive/negative/neutral)
- **Bias Detection**: Identify potentially biased or harmful content
- **Topic Extraction**: Automatic identification of content themes and categories
- **Readability Scoring**: Analyze complexity of consumed content

### Productivity Insights
- **Productivity Score**: Calculate daily/weekly productivity percentages
- **Time Distribution**: Visualize time spent across different categories
- **Usage Patterns**: Identify productive vs. distracting hours
- **Weekly Trends**: Track changes in digital behavior over time

### Personalization
- **Custom Categories**: Define your own website categories during onboarding
- **Site Classification**: Customize whether sites are productive, entertainment, etc.
- **Exclude Lists**: Protect privacy by excluding sensitive domains
- **Configurable Analysis**: Enable/disable specific tracking features

### Smart Insights
- **Personalized Suggestions**: AI-generated recommendations for healthier digital habits
- **Content Bubble Detection**: Identify echo chambers and suggest diverse sources
- **Emotional Balance Monitoring**: Recommendations for balanced content consumption
- **Usage Alerts**: Notifications for excessive screen time or unproductive periods

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Modern browser (Chrome/Firefox/Edge)

### Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd footprint-extension

# Install dependencies
npm install

# Build the extension
npm run build

# For development with hot reload
npm run dev
```

### Browser Installation
1. Open your browser's extension management page
   - Chrome: `chrome://extensions`
   - Firefox: `about:addons`
   - Edge: `edge://extensions`

2. Enable "Developer mode"

3. Click "Load unpacked" and select the `dist` folder

## 📊 Dashboard Integration

The extension is designed to work with a separate dashboard website for comprehensive analytics:

### Backend API Endpoints
Configure these in your backend to receive extension data:

- `POST /sessions` - Session duration and metadata
- `POST /content-analysis` - Content analysis results
- `POST /engagement` - User interaction metrics

### Dashboard Features
- Daily/weekly activity summaries
- Productivity vs. distraction analysis
- Emotional balance visualization
- Content category breakdowns
- Historical trend analysis
- Personalized insights and recommendations

## ⚙️ Configuration

### Settings Overview
Access settings through the extension popup → Settings

#### Analysis Features
- **Content Scanning**: Enable/disable text analysis
- **Emotional Analysis**: Track sentiment of consumed content
- **Bias Detection**: Identify potentially harmful or biased content
- **Productivity Tracking**: Monitor productive vs. distracting time

#### Privacy Controls
- **Exclude Lists**: Domains to exclude from tracking
- **Scan Interval**: Frequency of content analysis (15s - 5m)
- **Data Export**: Export all tracking data as JSON
- **Data Clearing**: Remove all stored data

#### Custom Categories
- **Site Classification**: Define custom categories for websites
- **Productivity Rules**: Set which sites count as productive
- **Personal Workflow**: Adapt tracking to your specific needs

### Environment Variables
```env
VITE_API_BASE_URL=https://your-backend-api.com
```

## 🔒 Privacy & Security

### Data Storage
- **Local First**: All data stored locally in browser storage
- **No External Tracking**: No data sent to third parties without explicit configuration
- **Sensitive Data Protection**: Passwords, payment info automatically excluded
- **User Control**: Complete control over data collection and retention

### Security Features
- **Input Filtering**: Automatic detection and exclusion of sensitive inputs
- **Domain Exclusion**: Ability to exclude any domain from tracking
- **Data Encryption**: Local data can be encrypted (optional)
- **Audit Trail**: Complete visibility into what data is collected

## 🛠️ Development

### Project Structure
```
src/
├── background/         # Service worker and background processing
├── content/           # Content script for page analysis
├── popup/            # Extension popup UI
├── options/          # Settings and configuration UI
├── utils/
│   ├── categories.js    # Website categorization logic
│   ├── contentAnalysis.js # AI content analysis
│   └── analytics.js     # Data processing and insights
└── assets/           # Icons and static assets
```

### Key Technologies
- **React** - UI framework for popup and options pages
- **Vite** - Build tool and development server
- **Chrome Extension API** - Browser integration
- **Local Storage** - Client-side data persistence

### Building Features
```bash
# Watch mode for development
npm run dev

# Production build
npm run build

# Lint code
npm run lint
```

### API Integration
To connect with your backend dashboard:

1. Set up the API endpoints listed above
2. Configure `VITE_API_BASE_URL` in your environment
3. Set `DEV_MODE = false` in `background.js`
4. Handle authentication as needed for your backend

## 📈 Analytics Overview

### Metrics Collected
- **Time Data**: Session duration, focus time, active hours
- **Engagement**: Clicks, keystrokes, scrolls, mouse movements
- **Content**: Text analysis, sentiment, topics, readability
- **Behavioral**: Site categories, navigation patterns, interaction types

### Insights Generated
- **Productivity Score**: Based on time spent in productive categories
- **Emotional Balance**: Sentiment distribution of consumed content
- **Content Diversity**: Variety of topics and sources
- **Usage Patterns**: Peak productive hours, distraction triggers

### Personalized Recommendations
- **Time Management**: Suggestions for better time allocation
- **Content Balance**: Recommendations for healthier content diet
- **Productivity**: Tips for reducing distracting activities
- **Well-being**: Guidance for digital wellness

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Add comprehensive comments for complex logic
- Test across different browsers
- Ensure privacy and security best practices
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues, feature requests, or questions:

1. Check the existing Issues on GitHub
2. Create a new Issue with detailed description
3. Include browser version, extension version, and steps to reproduce

## 🔮 Roadmap

### Phase 2 (Upcoming)
- **Image Analysis**: Analyze visual content consumption
- **Video Tracking**: Monitor video content and engagement
- **Cross-Device Sync**: Synchronize data across devices
- **Advanced AI**: Enhanced content understanding and insights

### Phase 3 (Future)
- **Social Impact**: Analyze online interaction sentiment
- **Digital Wellness Coach**: AI-powered habit coaching
- **Team Analytics**: Workplace productivity insights
- **Integration Hub**: Connect with popular productivity tools

---

**Built with ❤️ for digital wellness and productivity**

### What was fixed:
- ✅ Added root `manifest.json` (copied from `public/manifest.json`)
- ✅ Fixed `vite-plugin-static-copy` version from `^0.24.0` to `^3.1.4` 
- ✅ Verified build works and generates correct `dist` structure
- ✅ Confirmed all entry points exist: `background/background.js`, `content/contentScript.js`, `popup/`, `options/`

The extension is now ready to load and should work properly in Chrome/Edge!
