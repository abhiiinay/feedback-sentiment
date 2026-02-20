# 🎭 Feedback Sentiment Analysis Application

A full-stack application built with Flask (backend) and React (frontend) that collects user feedback and performs AI-powered sentiment analysis.

## ✨ Features

- **User Authentication**: Sign up and sign in functionality
- **Feedback Collection**: Rating system (1-5 stars) + text comments
- **AI Sentiment Analysis**: Automatic emotion detection (Positive/Neutral/Negative)
- **Admin Dashboard**: Complete analytics with sentiment breakdown
- **Modern UI**: Beautiful gradient design with animations

---

## 🏗️ Tech Stack

**Backend:**
- Flask (Python web framework)
- SQLite (Database)
- Logistic Regression

**Frontend:**
- React 18
- React Router DOM
- Axios
- CSS3 with gradients & animations

---

## 📦 Installation

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

Backend will run on: `http://localhost:5000`

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Install required packages
npm install react-router-dom axios

# Start development server
npm start
```

Frontend will run on: `http://localhost:3000`

---

## 🚀 Usage

### 1. **User Flow**
1. Sign up with username, email, and password
2. Sign in with credentials
3. Submit feedback with rating and comment
4. View sentiment analysis result

### 2. **Admin Flow**
1. Navigate to `/admin`
2. Login with credentials:
   - Username: `admin`
   - Password: `admin123`
3. View dashboard with:
   - Total feedback count
   - Average rating
   - Sentiment breakdown (Positive/Neutral/Negative)
   - Individual feedback with sentiment scores

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/signup` | POST | Register new user |
| `/api/signin` | POST | User authentication |
| `/api/feedback` | POST | Submit feedback |
| `/api/admin/login` | POST | Admin authentication |
| `/api/admin/dashboard` | GET | Get all feedback & stats |

---

## 🎨 Design Features

- Animated gradient backgrounds
- Floating blob animations
- Glass-morphism cards
- Responsive design
- Dark mode admin panel
- Color-coded sentiment badges

---

## 📝 Database Schema

**Users Table:**
```sql
- id (PRIMARY KEY)
- username (UNIQUE)
- email (UNIQUE)
- password (hashed)
- created_at (TIMESTAMP)
```

**Feedback Table:**
```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- rating (1-5)
- comment (TEXT)
- sentiment (Positive/Neutral/Negative)
- sentiment_score (REAL)
- created_at (TIMESTAMP)
```

---

## 🧠 Sentiment Analysis

Uses **TextBlob** for sentiment analysis:
- **Polarity > 0.1** → Positive
- **Polarity < -0.1** → Negative
- **-0.1 ≤ Polarity ≤ 0.1** → Neutral

---

## 🔒 Security Features

- Password hashing (SHA-256)
- Email validation
- Input sanitization
- CORS enabled for local development

---

## 📸 Screenshots

### User Flow
- Sign Up / Sign In pages
- Feedback form with star ratings
- Sentiment result display

### Admin Login
-Username: admin
-Password: admin123

### Admin Dashboard
- Stats overview cards
- Sentiment filters
- Complete feedback table

---

## 🛠️ Development Notes

- Backend runs on port 5000
- Frontend runs on port 3000
- Database file: `feedback.db` (auto-created)
- Static admin credentials for demo purposes

---

## 📄 License

This project is created for a screening test demonstration.

---

## 👨‍💻 Author

Built with  Flask & React
