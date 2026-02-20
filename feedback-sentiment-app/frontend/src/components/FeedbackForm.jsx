import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Feedback.css';

function FeedbackForm({ user }) {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/feedback', {
        user_id: user.user_id,
        rating,
        comment
      });
      
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRating(0);
    setComment('');
    setResult(null);
    setError('');
  };

  if (result) {
    return (
      <div className="feedback-container">
        <div className="feedback-card result-card">
          <div className="result-icon">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="2"/>
              <path d="M20 30 L26 36 L40 22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h1>Thank You!</h1>
          <p>Your feedback has been submitted successfully</p>

          <div className="sentiment-result">
            <div className="sentiment-badge" data-sentiment={result.sentiment.toLowerCase()}>
              {result.sentiment}
            </div>
            <div className="sentiment-score">
              Sentiment Score: <strong>{result.sentiment_score}</strong>
            </div>
          </div>

          <div className="result-actions">
            <button onClick={handleReset} className="secondary-button">
              Submit Another
            </button>
            <button onClick={() => navigate('/signin')} className="primary-button">
              Sign Out
            </button>
          </div>
        </div>

        <div className="auth-bg">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <div className="feedback-header">
          <h1>Share Your Feedback</h1>
          <p>Help us improve your experience, {user.username}</p>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          
         
          <div className="form-section">
            <label className="section-label">How would you rate your experience?</label>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${(hoverRating || rating) >= star ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path
                      d="M20 5 L24 16 L36 16 L26 23 L30 35 L20 28 L10 35 L14 23 L4 16 L16 16 Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              ))}
            </div>
            <div className="rating-text">
              {rating > 0 && (
                <span className="rating-label">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </span>
              )}
            </div>
          </div>

          
          <div className="form-section">
            <label htmlFor="comment" className="section-label">
              Tell us more about your experience
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts, suggestions, or concerns..."
              rows="6"
              required
            />
            <div className="char-count">{comment.length} characters</div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/signin')} className="secondary-button">
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>

      <div className="auth-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
    </div>
  );
}

export default FeedbackForm;
