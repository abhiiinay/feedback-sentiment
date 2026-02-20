from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib
import os
import re
import string
import joblib

app = Flask(__name__)
CORS(app)

DB_PATH = 'feedback.db'
MODEL_PATH = 'sentiment_model.pkl'



# TEXT PREPROCESSING (MUST MATCH TRAINING)


def preprocess_text(text):
    if not isinstance(text, str):
        return ""

    text = text.lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text)
    text = re.sub(r'@\w+|#\w+', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = ' '.join(text.split())

    return text


# LOAD CUSTOM ML MODEL


def load_custom_model():
    global model, vectorizer

    if not os.path.exists(MODEL_PATH):
        print("❌ Model file not found!")
        return

    model_data = joblib.load(MODEL_PATH)
    model = model_data['model']
    vectorizer = model_data['vectorizer']

    print("✅ Custom sentiment model loaded successfully")


def analyze_sentiment(text):
    cleaned = preprocess_text(text)
    text_vec = vectorizer.transform([cleaned])

    prediction = model.predict(text_vec)[0]

   
    try:
        probabilities = model.predict_proba(text_vec)[0]
        confidence = max(probabilities)
    except:
        confidence = 1.0

    return prediction.capitalize(), float(round(confidence, 3))



# DATABASE SETUP


def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT NOT NULL,
        sentiment TEXT,
        sentiment_score REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )''')

    conn.commit()
    conn.close()



# HELPER FUNCTIONS


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


# USER ROUTES


@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'All fields required'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400

    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()

        hashed_pw = hash_password(password)
        c.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            (username, email, hashed_pw)
        )

        conn.commit()
        user_id = c.lastrowid
        conn.close()

        return jsonify({
            'message': 'User registered successfully',
            'user_id': user_id,
            'username': username
        }), 201

    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username or email already exists'}), 409


@app.route('/api/signin', methods=['POST'])
def signin():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    hashed_pw = hash_password(password)
    c.execute(
        'SELECT id, username, email FROM users WHERE username = ? AND password = ?',
        (username, hashed_pw)
    )

    user = c.fetchone()
    conn.close()

    if user:
        return jsonify({
            'message': 'Login successful',
            'user_id': user[0],
            'username': user[1],
            'email': user[2]
        }), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401



# ADMIN ROUTES


@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    print("Admin login attempt:", username)

    if username == "admin" and password == "admin123":
        return jsonify({
            "message": "Admin login successful",
            "role": "admin"
        }), 200
    else:
        return jsonify({"error": "Invalid admin credentials"}), 401


@app.route('/api/admin/dashboard', methods=['GET'])
def admin_dashboard():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    c.execute('''SELECT
                    f.id, f.rating, f.comment, f.sentiment,
                    f.sentiment_score, f.created_at,
                    u.username, u.email
                 FROM feedback f
                 JOIN users u ON f.user_id = u.id
                 ORDER BY f.created_at DESC''')

    feedback_list = [dict(row) for row in c.fetchall()]

    c.execute('SELECT COUNT(*) FROM feedback')
    total_feedback = c.fetchone()[0]

    c.execute('SELECT AVG(rating) FROM feedback')
    avg_rating = c.fetchone()[0] or 0

    conn.close()

    return jsonify({
        'feedback': feedback_list,
        'stats': {
            'total_feedback': total_feedback,
            'average_rating': round(avg_rating, 2)
        }
    }), 200


# FEEDBACK ROUTE (ML POWERED)


@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    data = request.json
    user_id = data.get('user_id')
    rating = data.get('rating')
    comment = data.get('comment')

    if not user_id or not rating or not comment:
        return jsonify({'error': 'All fields required'}), 400

    if not (1 <= int(rating) <= 5):
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400

    sentiment, score = analyze_sentiment(comment)

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute('''INSERT INTO feedback
                 (user_id, rating, comment, sentiment, sentiment_score)
                 VALUES (?, ?, ?, ?, ?)''',
              (user_id, rating, comment, sentiment, score))

    conn.commit()
    feedback_id = c.lastrowid
    conn.close()

    return jsonify({
        'message': 'Feedback submitted successfully',
        'feedback_id': feedback_id,
        'sentiment': sentiment,
        'sentiment_score': score
    }), 201



# MAIN


if __name__ == '__main__':
    init_db()
    load_custom_model()
    print("✅ Database initialized")
    print("🚀 Server running on http://localhost:5000")
    app.run(debug=True, port=5000)
