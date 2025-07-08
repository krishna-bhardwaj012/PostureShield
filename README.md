# Posture Detector App

A real-time posture detection web application using React and Node.js with AI-powered pose analysis for squats and desk sitting postures.

## Features

- **Real-time Posture Analysis**: Live analysis of squat form and desk sitting posture
- **Video Input Options**: Support for both webcam and video file upload
- **AI-Powered Detection**: Uses MediaPipe-compatible pose detection algorithms
- **Live Feedback**: Real-time feedback with violation highlighting
- **Session Statistics**: Track posture metrics, violations, and overall scores
- **Frame-by-Frame Analysis**: Detailed analysis with exportable reports
- **WebSocket Communication**: Real-time communication between frontend and backend

## Project Structure

```
posture-detector-app/
├── backend/
│   ├── routes/
│   │   ├── postureRoutes.js         # API routes for sessions and analysis
│   │   └── websocketHandler.js      # WebSocket server for real-time communication
│   ├── poseUtils/
│   │   └── postureAnalyzer.js       # Core posture analysis algorithms
│   └── server.js                    # Main Express server
├── frontend/
│   ├── public/
│   │   └── index.html              # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoInput.jsx      # Video input component (webcam/upload)
│   │   │   ├── AnalysisPanel.jsx   # Analysis controls and real-time feedback
│   │   │   └── SessionStats.jsx    # Session statistics display
│   │   ├── pages/
│   │   │   └── PostureDetection.jsx # Main application page
│   │   ├── App.jsx                 # Root React component
│   │   ├── App.css                 # Application styles
│   │   ├── index.css               # Global styles
│   │   └── index.js                # React entry point
└── README.md
```

## Analysis Rules

### Squat Analysis
- **Knee Position**: Flag if knee goes beyond toe
- **Back Angle**: Flag if back angle < 150°
- **Form Assessment**: Real-time scoring based on posture violations

### Desk Sitting Analysis
- **Neck Position**: Flag if neck bends > 30°
- **Spine Alignment**: Flag if back isn't straight
- **Posture Monitoring**: Continuous assessment of sitting posture

## Technology Stack

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **WebSocket (ws)**: Real-time communication
- **CORS**: Cross-origin resource sharing

### Frontend
- **React**: UI framework
- **JavaScript (ES6+)**: Programming language
- **CSS3**: Styling and animations
- **WebSocket API**: Real-time communication

### AI/Computer Vision
- **MediaPipe-compatible algorithms**: Pose detection and analysis
- **Rule-based logic**: Posture violation detection
- **Real-time processing**: Frame-by-frame analysis

## API Endpoints

### REST API
- `POST /api/sessions` - Create new analysis session
- `GET /api/sessions/:id` - Get session details
- `PATCH /api/sessions/:id` - Update session
- `GET /api/sessions/:id/frames` - Get session frames
- `POST /api/analyze` - Analyze single frame

### WebSocket Events
- `start_session` - Begin analysis session
- `pose_data` - Send pose landmarks for analysis
- `end_session` - End analysis session
- `analysis_result` - Receive real-time analysis results

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd posture-detector-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open your browser to `http://localhost:5000`

## Usage

1. **Select Analysis Mode**
   - Choose between "Squat Analysis" or "Desk Sitting"
   - Select "Real-time" or "Frame-by-frame" feedback

2. **Choose Video Input**
   - **Webcam**: Click "Start Camera" to use your webcam
   - **Upload**: Upload a video file (MP4, MOV, AVI, WebM)

3. **Start Analysis**
   - Click "Start Analysis" to begin posture detection
   - View real-time feedback and violations
   - Monitor session statistics

4. **Review Results**
   - Check session stats for overall performance
   - Review frame-by-frame analysis
   - Export detailed reports

## Features in Detail

### Real-time Feedback
- Live posture violation detection
- Visual feedback overlays on video
- Immediate alerts for poor posture

### Session Statistics
- Duration tracking
- Good posture percentage
- Warning and violation counts
- Overall posture scores
- Consistency metrics

### Export Capabilities
- JSON report generation
- Session data export
- Frame-by-frame analysis logs

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Requirements

- **Webcam**: 720p minimum resolution
- **Processing**: Modern browser with WebRTC support
- **Network**: Stable connection for WebSocket communication

## Future Enhancements

- Integration with actual MediaPipe library
- Additional exercise analysis (deadlifts, lunges)
- Mobile app development
- Cloud-based analysis
- Advanced reporting dashboards

## License

MIT License - see LICENSE file for details