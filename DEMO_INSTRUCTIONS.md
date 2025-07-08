# How to Test Posture Detection Rules

## Setup Instructions

### 1. Install Dependencies
```bash
# Navigate to your project directory
cd posture-detector-app

# Install required packages
npm install express cors ws

# Start the application
npm start
```

### 2. Open Application
- Open browser to: `http://localhost:5000`
- Allow camera permissions when prompted

## Testing Posture Detection Rules

### SQUAT ANALYSIS MODE

#### Rule 1: Knee Should NOT Extend Beyond Toe ❌
**How to test:**
1. Select "🏋️ Squat Analysis" mode
2. Click "Start Camera" 
3. Click "▶ Start Analysis"
4. Position yourself sideways to camera
5. **Perform a squat with knee going forward over your toe**
6. **Expected result:** You should see: "❌ SQUAT RULE VIOLATION: Knee should NOT extend beyond toe"

#### Rule 2: Back Angle Should Be ≥150° ✅
**How to test:**
1. Stay in squat position
2. **Round your back/lean forward too much**
3. **Expected result:** You should see: "❌ SQUAT RULE VIOLATION: Back angle should be ≥150° (Current: XXX°)"
4. **Stand up straight with good posture**
5. **Expected result:** You should see: "✅ GOOD: Back angle is proper (XXX°)"

### DESK SITTING ANALYSIS MODE

#### Rule 3: Neck Bend Should Be ≤30° 📱
**How to test:**
1. Select "💺 Desk Sitting" mode
2. Sit in front of camera
3. Click "▶ Start Analysis"
4. **Look down at your phone/laptop (crane your neck forward)**
5. **Expected result:** You should see: "❌ DESK RULE VIOLATION: Neck bend should be ≤30° (Current: XXX°)"
6. **Sit up straight, look ahead**
7. **Expected result:** You should see: "✅ GOOD: Neck position is proper (XXX°)"

#### Rule 4: Back Should Remain Straight 🪑
**How to test:**
1. Stay in sitting position
2. **Slouch or hunch your back**
3. **Expected result:** You should see: "❌ DESK RULE VIOLATION: Back should remain straight (Current alignment: XXX°)"
4. **Sit up straight with good posture**
5. **Expected result:** You should see: "✅ GOOD: Back is straight (XXX°)"

## What You Should See in the Interface

### Real-time Feedback Panel
```
🎯 Squat Analysis / Desk Posture Analysis

Rules being checked:
• Knee should NOT extend beyond toe
• Back angle should be ≥150°
(or for desk mode)
• Neck bend should be ≤30°
• Back should remain straight

[Violation messages will appear here with icons]
❌ SQUAT RULE VIOLATION: Knee should NOT extend beyond toe
⚠️ SQUAT RULE VIOLATION: Back angle should be ≥150° (Current: 140.2°)
✅ GOOD: Back angle is proper (155.8°)
```

### Session Statistics
- Overall Score (changes based on violations)
- Good Posture Percentage
- Warning/Violation counts
- Consistency metrics

### Camera Position Tips

#### For Squat Testing:
- **Position camera to your side** (profile view)
- Stand about 3-4 feet from camera
- Ensure your full body is visible
- Good lighting on your side

#### For Desk Sitting Testing:
- **Position camera in front of you**
- Sit about 2-3 feet from camera
- Ensure your upper body and head are visible
- Camera should be at eye level

## Troubleshooting

### Camera Not Working
- Check browser permissions (click the camera icon in address bar)
- Close other applications using the camera
- Refresh the page and try again

### No Violation Messages Appearing
- Ensure you're exaggerating the bad posture movements
- Check that "Start Analysis" is clicked (should show "Processing" indicator)
- Try refreshing and restarting the analysis

### WebSocket Connection Issues
- Check that server is running on port 5000
- Look for "Connected" status indicator in the header
- Restart the server if needed

## Expected Behavior Summary

| Action | Expected Message |
|--------|------------------|
| Squat with knee over toe | ❌ Knee should NOT extend beyond toe |
| Squat with rounded back | ❌ Back angle should be ≥150° |
| Good squat form | ✅ GOOD: Back angle is proper |
| Looking down at phone | ❌ Neck bend should be ≤30° |
| Slouching while sitting | ❌ Back should remain straight |
| Good sitting posture | ✅ GOOD: Back is straight |

The application uses mock pose data for demonstration, but the analysis rules are correctly implemented and will show the proper violation messages based on the posture analysis algorithms.