# Simple backend for a gamified environmental quiz using Flask and SQLite
# This is a basic prototype: users can register, login, get quiz questions, submit answers, and track points.
# No advanced security; for demo purposes only.

from flask import Flask, request, jsonify
import sqlite3
from sqlite3 import Error

app = Flask(__name__)

# Database setup
def create_connection():
    conn = None
    try:
        conn = sqlite3.connect('quiz.db')
    except Error as e:
        print(e)
    return conn

def create_tables():
    conn = create_connection()
    if conn:
        cursor = conn.cursor()
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                points INTEGER DEFAULT 0
            )
        ''')
        # Questions table (pre-populated with sample questions)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT NOT NULL,
                options TEXT NOT NULL,  -- JSON string of options, e.g., '["A", "B", "C", "D"]'
                correct_answer TEXT NOT NULL
            )
        ''')
        # Insert sample questions if not exist
        sample_questions = [
            ("What is the main cause of climate change?", '["Deforestation", "Burning fossil fuels", "Overfishing", "Urbanization"]', "Burning fossil fuels"),
            ("Which gas is primarily responsible for the greenhouse effect?", '["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"]', "Carbon Dioxide"),
            ("What can you do to reduce plastic waste?", '["Use reusable bags", "Buy more plastic", "Throw away recyclables", "Ignore recycling"]', "Use reusable bags"),
            ("Why is biodiversity important?", '["It supports ecosystems", "It reduces food options", "It increases pollution", "It harms wildlife"]', "It supports ecosystems"),
            ("What is sustainable development?", '["Meeting needs without compromising future generations", "Rapid industrialization", "Ignoring environmental laws", "Overexploitation of resources"]', "Meeting needs without compromising future generations")
        ]
        for q in sample_questions:
            cursor.execute("INSERT OR IGNORE INTO questions (question, options, correct_answer) VALUES (?, ?, ?)", q)
        conn.commit()
        conn.close()

create_tables()

# Helper to get user by username
def get_user(username):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    return user

# Route for user registration
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')  # In real app, hash this!
    if not username or not password:
        return jsonify({'error': 'Missing username or password'}), 400
    conn = create_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
        conn.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username already exists'}), 409
    finally:
        conn.close()

# Route for user login (simple, no JWT for prototype)
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user = get_user(username)
    if user and user[2] == password:  # user[2] is password
        return jsonify({'message': 'Login successful', 'user_id': user[0], 'points': user[3]})
    return jsonify({'error': 'Invalid credentials'}), 401

# Route to get all quiz questions
@app.route('/questions', methods=['GET'])
def get_questions():
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, question, options FROM questions")
    questions = cursor.fetchall()
    conn.close()
    result = [{'id': q[0], 'question': q[1], 'options': q[2]} for q in questions]  # options as string, frontend can parse
    return jsonify(result)

# Route to submit answer and award points
@app.route('/submit', methods=['POST'])
def submit_answer():
    data = request.json
    user_id = data.get('user_id')
    question_id = data.get('question_id')
    answer = data.get('answer')
    if not user_id or not question_id or not answer:
        return jsonify({'error': 'Missing data'}), 400
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT correct_answer FROM questions WHERE id = ?", (question_id,))
    correct = cursor.fetchone()
    if not correct:
        conn.close()
        return jsonify({'error': 'Invalid question ID'}), 404
    correct_answer = correct[0]
    points_awarded = 10 if answer == correct_answer else 0  # 10 points for correct
    # Update user points
    cursor.execute("UPDATE users SET points = points + ? WHERE id = ?", (points_awarded, user_id))
    conn.commit()
    conn.close()
    return jsonify({'correct': answer == correct_answer, 'points_awarded': points_awarded})

# Route to get user points
@app.route('/points/<int:user_id>', methods=['GET'])
def get_points(user_id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT points FROM users WHERE id = ?", (user_id,))
    points = cursor.fetchone()
    conn.close()
    if points:
        return jsonify({'points': points[0]})
    return jsonify({'error': 'User not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)