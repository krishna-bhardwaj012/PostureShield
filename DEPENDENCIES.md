# Dependencies for Posture Detection Application

## Required Software

### 1. Node.js
```bash
# Install Node.js (version 18 or higher)
# Download from: https://nodejs.org/
# Or using package managers:

# Windows (using Chocolatey)
choco install nodejs

# macOS (using Homebrew)
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Git (Optional)
```bash
# Windows: Download from https://git-scm.com/
# macOS: 
brew install git
# Ubuntu/Debian:
sudo apt-get install git
```

## Project Dependencies

### Backend Dependencies
```bash
# Navigate to project directory and install
npm install express cors ws

# Or install individually:
npm install express@^4.18.2
npm install cors@^2.8.5
npm install ws@^8.14.2
```

### Frontend Dependencies (CDN-based)
The frontend uses CDN libraries that are automatically loaded:
- React 18 (from unpkg.com)
- ReactDOM 18 (from unpkg.com)
- React Router DOM 6 (from unpkg.com)

No additional installation needed for frontend dependencies.

## Package.json File
Create a `package.json` file in your project root:

```json
{
  "name": "posture-detector-app",
  "version": "1.0.0",
  "description": "Real-time posture detection web application",
  "main": "backend/server.js",
  "scripts": {
    "start": "node backend/server.js",
    "dev": "node backend/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "ws": "^8.14.2"
  },
  "keywords": ["posture", "detection", "ai", "react", "nodejs"],
  "author": "",
  "license": "MIT"
}
```

## Installation Steps

### 1. Create Project Structure
```bash
mkdir posture-detector-app
cd posture-detector-app

# Create directories
mkdir backend backend/routes backend/poseUtils
mkdir frontend frontend/public frontend/src frontend/src/components frontend/src/pages
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Verify installation
npm list
```

### 3. Start Application
```bash
# Start the server
npm start

# Or for development
npm run dev
```

### 4. Access Application
- Open browser to: `http://localhost:5000`
- Allow camera permissions when prompted

## Browser Requirements

### Supported Browsers
- Chrome 80+ (Recommended)
- Firefox 75+
- Safari 13+
- Edge 80+

### Required Browser Features
- WebRTC support (for camera access)
- WebSocket support (for real-time communication)
- ES6 modules support
- Canvas API support

## Camera Requirements

### Hardware
- Built-in webcam or external USB camera
- Minimum resolution: 640x480
- Recommended resolution: 1280x720 or higher

### Permissions
- Camera access permission in browser
- Microphone permission (optional, not used)

## Troubleshooting

### Common Issues

1. **Camera not working**
   - Check browser permissions
   - Ensure camera is not being used by another application
   - Try refreshing the page

2. **WebSocket connection failed**
   - Check if server is running on port 5000
   - Verify firewall settings
   - Try restarting the server

3. **Dependencies not found**
   - Run `npm install` in project directory
   - Check Node.js version (should be 18+)
   - Clear npm cache: `npm cache clean --force`

4. **Port already in use**
   - Kill process using port 5000: `lsof -ti:5000 | xargs kill -9`
   - Or change port in backend/server.js

### Development Mode

For development with auto-reload:
```bash
# Install nodemon globally (optional)
npm install -g nodemon

# Start with nodemon
nodemon backend/server.js
```

## File Structure Verification

Ensure your project has this structure:
```
posture-detector-app/
├── backend/
│   ├── routes/
│   │   ├── postureRoutes.js
│   │   └── websocketHandler.js
│   ├── poseUtils/
│   │   └── postureAnalyzer.js
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoInput.jsx
│   │   │   ├── AnalysisPanel.jsx
│   │   │   └── SessionStats.jsx
│   │   ├── pages/
│   │   │   └── PostureDetection.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── index.js
├── package.json
├── README.md
└── DEPENDENCIES.md
```

## Performance Optimization

### For Better Performance
- Use latest Chrome browser
- Ensure good lighting for camera
- Close other applications using camera
- Use wired internet connection for WebSocket
- Minimum 4GB RAM recommended