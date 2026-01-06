from flask import Flask, render_template_string, request, session, redirect, url_for, send_from_directory, jsonify
from flask_cors import CORS
import os
from supabase import create_client, Client

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.secret_key = "grafxcore_secret_key"

# Path resolution for Render (root directory)
DIRECTORY = "client"

# Supabase Configuration
SUPABASE_URL = "https://hpozbywseixlfjkmouzu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwb3pieXdzZWl4bGZqa21vdXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzA2NzQsImV4cCI6MjA4MzI0NjY3NH0.Groc8oCK5XJKAX8bRHwbPU0DmGOhDJDzUbRTo7l9XFU"

# Initialize Supabase Client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Admin Credentials
ADMIN_EMAIL = "manish@grafxcore.in"
ADMIN_PASSWORD = "Manish@891819"

@app.route('/')
def root():
    return send_from_directory(DIRECTORY, 'index.html')

@app.route('/home')
def home():
    return send_from_directory(DIRECTORY, 'index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if session.get('logged_in'):
        return redirect(url_for('admin'))
    
    error = None
    if request.method == 'POST':
        if request.form.get('email') == ADMIN_EMAIL and request.form.get('password') == ADMIN_PASSWORD:
            session['logged_in'] = True
            return redirect(url_for('admin'))
        else:
            error = "Invalid credentials"
            
    return render_template_string("""
<!DOCTYPE html>
<html>
<head>
    <title>Login - GrafxCore</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/jpeg" href="/favicon.jpg">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background: #f6f7f8; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .login-card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); width: 100%; max-width: 400px; text-align: center; }
        h2 { margin-bottom: 30px; color: #10b981; }
        input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 10px; box-sizing: border-box; }
        button { width: 100%; padding: 14px; background: #10b981; color: white; border: none; border-radius: 999px; font-weight: 600; cursor: pointer; margin-top: 20px; transition: 0.3s; }
        button:hover { background: #059669; }
        .error { color: #ef4444; font-size: 14px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="login-card">
        <h2>Admin Login</h2>
        <form method="POST">
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
        {% if error %}
        <p class="error">{{ error }}</p>
        {% endif %}
    </div>
</body>
</html>
""", error=error)

@app.route('/admin')
def admin():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return send_from_directory(DIRECTORY, 'admin.html')

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('home'))

@app.route('/contactus')
def contact():
    return send_from_directory(DIRECTORY, 'ct.html')

@app.route('/aboutus')
def about():
    if os.path.exists(os.path.join(DIRECTORY, 'about.html')):
        return send_from_directory(DIRECTORY, 'about.html')
    return redirect('/home')

@app.route('/portfolio')
def portfolio_clean():
    return send_from_directory(DIRECTORY, 'wpage.html')

@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        response = supabase.table('categories').select("*").order("name").execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify([])

@app.route('/api/categories', methods=['POST'])
def add_category():
    if not session.get('logged_in'):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    data = request.json
    try:
        supabase.table('categories').insert({
            "name": data.get('name'),
            "parent_id": data.get('parent_id') # None for main category
        }).execute()
        return jsonify({"status": "success"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/categories/<id>', methods=['DELETE'])
def delete_category(id):
    if not session.get('logged_in'):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    try:
        supabase.table('categories').delete().eq("id", id).execute()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/works', methods=['GET'])
def get_works():
    try:
        response = supabase.table('works').select("*").order("created_at", desc=True).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify([])

@app.route('/api/works', methods=['POST'])
def add_work():
    if not session.get('logged_in'):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    data = request.json
    try:
        supabase.table('works').insert(data).execute()
        return jsonify({"status": "success"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/works/<id>', methods=['DELETE'])
def delete_work(id):
    if not session.get('logged_in'):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    try:
        supabase.table('works').delete().eq("id", id).execute()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/inquiries', methods=['POST', 'OPTIONS'])
def add_inquiry():
    if request.method == 'OPTIONS':
        return '', 204
    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "No data received"}), 400
    
    try:
        supabase.table('inquiries').insert({
            "name": str(data.get('name', '')),
            "email": str(data.get('email', '')),
            "budget": str(data.get('budget', '0')),
            "message": str(data.get('message', ''))
        }).execute()
        return jsonify({"status": "success"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/inquiries', methods=['GET'])
def get_inquiries():
    if not session.get('logged_in'):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    try:
        response = supabase.table('inquiries').select("*").order("created_at", desc=True).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/inquiries/<id>', methods=['DELETE'])
def delete_inquiry(id):
    if not session.get('logged_in'):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    try:
        supabase.table('inquiries').delete().eq("id", id).execute()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/favicon.jpg')
def favicon():
    return send_from_directory(DIRECTORY, 'favicon.jpg')

@app.route('/<path:path>')
def static_files(path):
    if path.endswith('.html'):
        if path == 'index.html': return redirect('/home')
        if path == 'admin.html': return redirect('/admin')
        if path == 'ct.html': return redirect('/contactus')
        if path == 'about.html': return redirect('/aboutus')
        if path == 'wpage.html': return redirect('/portfolio')
        return redirect('/' + path[:-5])
    
    return send_from_directory(DIRECTORY, path)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
