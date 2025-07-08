import React from 'react';

const AnalysisPanel = ({
  analysisMode,
  feedbackType,
  onAnalysisModeChange,
  onFeedbackTypeChange,
  currentResult,
  analysisFrames,
  onExportReport,
}) => {
  const formatTimestamp = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getViolationIcon = (severity) => {
    if (severity === 'error') return '❌';
    if (severity === 'warning') return '⚠️';
    if (severity === 'good') return '✅';
    return '❓';
  };

  return (
    <div>
      {/* Analysis Settings */}
      <div className="analysis-panel" style={{ marginBottom: '20px' }}>
        <h3>Analysis Mode</h3>
        
        <div className="form-group">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                value="squat"
                checked={analysisMode === 'squat'}
                onChange={(e) => onAnalysisModeChange(e.target.value)}
              />
              <span>🏋️ Squat Analysis</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                value="desk"
                checked={analysisMode === 'desk'}
                onChange={(e) => onAnalysisModeChange(e.target.value)}
              />
              <span>💺 Desk Sitting</span>
            </label>
          </div>
        </div>

        <hr style={{ margin: '20px 0' }} />

        <h4>Feedback Type</h4>
        <div className="form-group">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                value="realtime"
                checked={feedbackType === 'realtime'}
                onChange={(e) => onFeedbackTypeChange(e.target.value)}
              />
              <span>Real-time</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                value="frame"
                checked={feedbackType === 'frame'}
                onChange={(e) => onFeedbackTypeChange(e.target.value)}
              />
              <span>Frame-by-frame</span>
            </label>
          </div>
        </div>
      </div>

      {/* Real-time Feedback */}
      <div className="analysis-panel" style={{ marginBottom: '20px' }}>
        <h3>Real-time Feedback</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
          {/* Analysis Results */}
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px 0' }}>
              🎯 {analysisMode === 'squat' ? 'Squat Analysis' : 'Desk Posture Analysis'}
            </h4>

            {currentResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentResult.violations.length > 0 ? (
                  currentResult.violations.map((violation, index) => (
                    <div
                      key={index}
                      className={`violation-item ${violation.severity}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{getViolationIcon(violation.severity)}</span>
                          <span style={{ fontSize: '14px' }}>
                            {violation.message}
                          </span>
                        </div>
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {violation.severity}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    padding: '10px', 
                    background: '#d4edda', 
                    borderRadius: '6px',
                    borderLeft: '4px solid #28a745',
                    color: '#155724'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>✅</span>
                        <span style={{ fontSize: '14px' }}>Good Posture</span>
                      </div>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        GOOD
                      </span>
                    </div>
                  </div>
                )}

                {/* Metrics */}
                {currentResult.metrics && (
                  <div style={{ 
                    paddingTop: '10px', 
                    borderTop: '1px solid #dee2e6',
                    fontSize: '14px'
                  }}>
                    {currentResult.metrics.backAngle && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                        <span style={{ color: '#666' }}>Back Angle</span>
                        <span>{currentResult.metrics.backAngle.toFixed(1)}°</span>
                      </div>
                    )}
                    {currentResult.metrics.kneeAngle && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                        <span style={{ color: '#666' }}>Knee Angle</span>
                        <span>{currentResult.metrics.kneeAngle.toFixed(1)}°</span>
                      </div>
                    )}
                    {currentResult.metrics.neckAngle && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                        <span style={{ color: '#666' }}>Neck Angle</span>
                        <span>{currentResult.metrics.neckAngle.toFixed(1)}°</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px', 
                color: '#999',
                fontSize: '14px'
              }}>
                Start analysis to see real-time feedback
              </div>
            )}
          </div>

          {/* Posture Metrics */}
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px 0' }}>
              📊 Posture Metrics
            </h4>

            {currentResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Overall Score</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '8px', 
                      background: '#e9ecef', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${currentResult.overallScore}%`,
                        height: '100%',
                        background: currentResult.overallScore >= 80 ? '#28a745' : 
                                   currentResult.overallScore >= 60 ? '#ffc107' : '#dc3545',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                      {Math.round(currentResult.overallScore)}%
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Violations</span>
                  <span style={{ 
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: currentResult.violations.length > 0 ? '#f8d7da' : '#d4edda',
                    color: currentResult.violations.length > 0 ? '#721c24' : '#155724'
                  }}>
                    {currentResult.violations.length}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Overall Score</span>
                  <span style={{ fontSize: '14px', color: '#666' }}>--</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Violations</span>
                  <span style={{ fontSize: '14px', color: '#666' }}>--</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Frame-by-Frame Analysis */}
      <div className="analysis-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>Frame Analysis</h3>
          <button className="btn btn-secondary" onClick={onExportReport} style={{ fontSize: '12px' }}>
            📥 Export Report
          </button>
        </div>
        
        <div style={{ 
          maxHeight: '250px', 
          overflowY: 'auto',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '10px'
        }}>
          {analysisFrames.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {analysisFrames.map((frame, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px',
                    background: frame.severity === 'error' ? '#f8d7da' : '#fff3cd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
                      {formatTimestamp(frame.timestamp)}
                    </span>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: frame.severity === 'error' ? '#dc3545' : '#ffc107'
                    }} />
                    <span>{frame.message}</span>
                  </div>
                  <span>→</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px', 
              color: '#999',
              fontSize: '14px'
            }}>
              No analysis frames recorded yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;