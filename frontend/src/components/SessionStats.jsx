import React from 'react';

const SessionStats = ({ stats }) => {
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="control-panel" style={{ marginBottom: '20px' }}>
      <h3>Session Stats</h3>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{formatDuration(stats.duration)}</div>
          <div className="stat-label">Duration</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#28a745' }}>
            {Math.round(stats.goodPosturePercentage)}%
          </div>
          <div className="stat-label">Good Posture</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#ffc107' }}>
            {stats.warningCount}
          </div>
          <div className="stat-label">Warnings</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#dc3545' }}>
            {stats.violationCount}
          </div>
          <div className="stat-label">Violations</div>
        </div>
      </div>

      <div style={{ marginTop: '20px', borderTop: '1px solid #dee2e6', paddingTop: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
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
                width: `${stats.overallScore}%`,
                height: '100%',
                background: stats.overallScore >= 80 ? '#28a745' : 
                           stats.overallScore >= 60 ? '#ffc107' : '#dc3545',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              {Math.round(stats.overallScore)}%
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>Consistency</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '60px', 
              height: '8px', 
              background: '#e9ecef', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${stats.consistency}%`,
                height: '100%',
                background: stats.consistency >= 80 ? '#28a745' : 
                           stats.consistency >= 60 ? '#ffc107' : '#dc3545',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              {Math.round(stats.consistency)}%
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>Form Quality</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '60px', 
              height: '8px', 
              background: '#e9ecef', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${stats.formQuality}%`,
                height: '100%',
                background: stats.formQuality >= 80 ? '#28a745' : 
                           stats.formQuality >= 60 ? '#ffc107' : '#dc3545',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              {Math.round(stats.formQuality)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionStats;