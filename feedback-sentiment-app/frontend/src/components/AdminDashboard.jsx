import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const { stats } = data;

 
  const emotionCounts = {};
  data.feedback.forEach(fb => {
    const emotion = fb.sentiment;
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });

  
  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const filteredFeedback = data?.feedback.filter(f => {
    if (filter === 'all') return true;
    return f.sentiment.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="dashboard-container">
      
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Emotion Analysis & Feedback Overview</p>
        </div>
        <button onClick={() => navigate('/admin')} className="logout-button">
          Sign Out
        </button>
      </div>

      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M8 12 L16 20 L24 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_feedback}</div>
            <div className="stat-label">Total Feedback</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 8 L20 16 L16 24 L12 16 Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.average_rating}</div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>

        
        {topEmotions.map(([emotion, count]) => (
          <div key={emotion} className="stat-card">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="13" r="1.5" fill="currentColor"/>
                <circle cx="20" cy="13" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{count}</div>
              <div className="stat-label">{emotion}</div>
            </div>
          </div>
        ))}
      </div>

      
      <div className="filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({data.feedback.length})
        </button>
        
        {Object.keys(emotionCounts).sort().map(emotion => (
          <button
            key={emotion}
            className={`filter-btn ${filter === emotion ? 'active' : ''}`}
            onClick={() => setFilter(emotion)}
          >
            {emotion} ({emotionCounts[emotion]})
          </button>
        ))}
      </div>

     
      <div className="feedback-table-container">
        <h2>User Feedback with Emotion Analysis</h2>
        
        {filteredFeedback.length === 0 ? (
          <div className="empty-state">
            <p>No {filter !== 'all' ? filter : ''} feedback found</p>
          </div>
        ) : (
          <div className="feedback-table">
            {filteredFeedback.map((fb) => (
              <div key={fb.id} className="feedback-row">
                <div className="feedback-meta">
                  <div className="user-info">
                    <div className="user-avatar">
                      {fb.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="user-name">{fb.username}</div>
                      <div className="user-email">{fb.email}</div>
                    </div>
                  </div>
                  <div className="feedback-details">
                    <div className="rating-display">
                      {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                    </div>
                    <div className="feedback-date">
                      {new Date(fb.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="feedback-comment">
                  {fb.comment}
                </div>

                <div className="sentiment-info">
                  <div className={`sentiment-badge ${fb.sentiment.toLowerCase()}`}>
                    {fb.sentiment}
                  </div>
                  <div className="sentiment-score-display">
                   
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;