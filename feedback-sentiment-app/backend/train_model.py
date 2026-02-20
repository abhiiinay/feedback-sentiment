"""
Train a multi-class emotion detection model.

Expected CSV format:
- text column (text / comment / review / message)
- emotion column (emotion / label / sentiment)
"""

import pandas as pd
import numpy as np
import joblib
import os
import re
import string
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score


# ==========================================================
# TEXT PREPROCESSING
# ==========================================================

def preprocess_text(text):
    if not isinstance(text, str):
        return ""

    text = text.lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text)
    text = re.sub(r'@\w+|#\w+', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = ' '.join(text.split())

    return text


# ==========================================================
# LOAD DATASET
# ==========================================================

def load_dataset(filepath):
    print(f"\n📂 Loading dataset from: {filepath}")

    df = pd.read_csv(filepath)

    # Remove unnamed index column if exists
    df = df.loc[:, ~df.columns.str.contains('^Unnamed')]

    # Convert column names to lowercase
    df.columns = df.columns.str.lower()

    print(f"📊 Columns found: {df.columns.tolist()}")
    print(f"✅ Total samples: {len(df)}")

    # Detect text column
    possible_text_cols = ['text', 'comment', 'review', 'message']
    text_col = next((col for col in possible_text_cols if col in df.columns), None)

    # Detect emotion column
    possible_label_cols = ['emotion', 'label', 'sentiment', 'class']
    label_col = next((col for col in possible_label_cols if col in df.columns), None)

    if not text_col or not label_col:
        raise ValueError("❌ Could not detect text and emotion columns")

    print(f"✅ Using text column: {text_col}")
    print(f"✅ Using emotion column: {label_col}")

    texts = df[text_col].astype(str).values
    labels = df[label_col].astype(str).str.lower().values

    print("\n📊 Emotion Distribution:")
    for emotion in sorted(set(labels)):
        count = list(labels).count(emotion)
        print(f"   {emotion}: {count}")

    return texts, labels


# ==========================================================
# TRAIN MODEL
# ==========================================================

def train_model(texts, labels):

    print("\n🧹 Preprocessing texts...")
    texts_clean = [preprocess_text(t) for t in texts]

    print("📊 Splitting dataset (80% train / 20% test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        texts_clean,
        labels,
        test_size=0.2,
        random_state=42,
        stratify=labels
    )

    print(f"Training samples: {len(X_train)}")
    print(f"Testing samples: {len(X_test)}")

    print("\n🔤 Vectorizing using TF-IDF...")
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.8
    )

    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    print(f"Feature size: {X_train_vec.shape[1]}")

    print("\n🤖 Training Logistic Regression (Multi-class)...")
    model = LogisticRegression(
        max_iter=1000,
        random_state=42,
        multi_class='multinomial'
    )

    model.fit(X_train_vec, y_train)

    print("\n📈 Evaluating model...")
    y_pred = model.predict(X_test_vec)

    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n✅ Accuracy: {accuracy:.2%}")

    print("\n📊 Classification Report:")
    print(classification_report(y_test, y_pred))

    print("\n🎭 Model Classes:")
    print(model.classes_)

    return model, vectorizer, accuracy


# ==========================================================
# SAVE MODEL
# ==========================================================

def save_model(model, vectorizer, accuracy, filename="sentiment_model.pkl"):

    model_data = {
        "model": model,
        "vectorizer": vectorizer,
        "accuracy": accuracy
    }

    joblib.dump(model_data, filename)

    size_kb = round(os.path.getsize(filename) / 1024, 2)

    print(f"\n💾 Model saved as: {filename}")
    print(f"📦 File size: {size_kb} KB")


# ==========================================================
# MAIN
# ==========================================================

if __name__ == "__main__":

    import sys

    if len(sys.argv) < 2:
        print("\nUsage:")
        print("python train_model.py EmotionDetection.csv")
        sys.exit(1)

    dataset_path = sys.argv[1]

    if not os.path.exists(dataset_path):
        print("❌ Dataset file not found")
        sys.exit(1)

    texts, labels = load_dataset(dataset_path)

    model, vectorizer, accuracy = train_model(texts, labels)

    save_model(model, vectorizer, accuracy)

    print("\n" + "=" * 60)
    print("🎉 TRAINING COMPLETE")
    print("=" * 60)
