import os
import psycopg2
from flask import Flask, render_template_string, request, session, redirect, url_for, send_from_directory, jsonify
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.secret_key = "grafxcore_secret_key"

# Path resolution
DIRECTORY = "client"

# Database connection
DATABASE_URL = "postgresql://postgres:wU85Vs9%26FtNJqRh@db.hpozbywseixlfjkmouzu.supabase.co:5432/postgres"

def get_db_connection():
    if DATABASE_URL:
        try:
            return psycopg2.connect(DATABASE_URL)
        except Exception as e:
            print(f"DB Connection Error: {e}")
            return None
    return None

def init_db():
    conn = get_db_connection()
    if conn:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                parent_id TEXT REFERENCES categories(id)
            );
            CREATE TABLE IF NOT EXISTS works (
                id TEXT PRIMARY KEY,
                image TEXT NOT NULL,
                category_id TEXT,
                subcategory_id TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS inquiries (
                id SERIAL PRIMARY KEY,
                name TEXT,
                email TEXT,
                budget TEXT,
                message TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Insert default categories if empty
        cur.execute("SELECT COUNT(*) FROM categories")
        row = cur.fetchone()
        if row and row[0] == 0:
            default_cats = [
                ('graphic_design', 'Graphics Design', None),
                ('video_editing', 'Video Editing', None),
                ('poster', 'Poster', 'graphic_design'),
                ('logo', 'Logo', 'graphic_design'),
                ('menu_card', 'Menu Card', 'graphic_design'),
                ('business_card', 'Business Card', 'graphic_design'),
                ('thumbnail', 'Thumbnail', 'graphic_design'),
                ('short_video', 'Short Video', 'video_editing'),
                ('long_video', 'Long Video', 'video_editing'),
                ('wedding_video', 'Wedding Video', 'video_editing')
            ]
            for cat in default_cats:
                cur.execute("INSERT INTO categories (id, name, parent_id) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING", cat)
        
        conn.commit()
        cur.close()
        conn.close()

# Initialize DB
init_db()

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
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
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
    conn = get_db_connection()
    if conn:
        cur = conn.cursor()
        cur.execute("SELECT id, name, parent_id FROM categories ORDER BY name")
        rows = cur.fetchall()
        data = [{"id": r[0], "name": r[1], "parent_id": r[2]} for r in rows]
        cur.close()
        conn.close()
        return jsonify(data)
    return jsonify([])

@app.route('/api/categories', methods=['POST'])
def add_category():
    if not session.get('logged_in'):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    data = request.json
    conn = get_db_connection()
    if conn:
        cur = conn.cursor()
        try:
            cat_id = data.get('name').lower().replace(' ', '_')
            cur.execute("INSERT INTO categories (id, name, parent_id) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING", 
                       (cat_id, data.get('name'), data.get('parent_id')))
            conn.commit()
            return jsonify({"status": "success"}), 201
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cur.close()
            conn.close()
    return jsonify({"status": "error", "message": "DB not connected"}), 500

@app.route('/api/categories/<id>', methods=['DELETE'])
def delete_category(id):
    if not session.get('logged_in'):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    conn = get_db_connection()
    if conn:
        cur = conn.cursor()
        try:
            cur.execute("DELETE FROM categories WHERE id = %s", (id,))
            conn.commit()
            return jsonify({"status": "success"})
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cur.close()
            conn.close()
    return jsonify({"status": "error"}), 500

@app.route('/api/works', methods=['GET'])
def get_works():
    conn = get_db_connection()
    if conn:
        cur = conn.cursor()
        cur.execute("SELECT id, image, category_id, subcategory_id, created_at FROM works ORDER BY created_at DESC")
        rows = cur.fetchall()
        data = [{"id": r[0], "image": r[1], "category_id": r[2], "subcategory_id": r[3], "created_at": r[4]} for r in rows]
        cur.close()
        conn.close()
        return jsonify(data)
    return jsonify([])

@app.route('/api/works', methods=['POST'])
def add_work():
    if not session.get('logged_in'):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    data = request.json
    conn = get_db_connection()
    if conn:
        cur = conn.cursor()
        try:
            cur.execute("INSERT INTO works (id, image, category_id, subcategory_id) VALUES (%s, %s, %s, %s)",
                       (data.get('id'), data.get('image'), data.get('category_id'), data.get('subcategory_id')))
            conn.commit()
            return jsonify({"status": "success"}), 201
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cur.close()
            conn.close()
    return jsonify({"status": "error"}), 500

@app.route('/api/works/<id>', methods=['DELETE'])
def delete_work(id):
    if not session.get('logged_in'):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    conn = get_db_connection()
    if conn:
        cur = conn.cursor()
        try:
            cur.execute("DELETE FROM works WHERE id = %s", (id,))
            conn.commit()
            return jsonify({"status": "success"})
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cur.close()
            conn.close()
    return jsonify({"status": "error"}), 500

@app.route('/api/inquiries', methods=['POST', 'OPTIONS'])
def add_inquiry():
    if request.method == 'OPTIONS':
        return '', 204
    data = request.json
    conn = get_db_connection()
    if conn:
        cur = conn.cursor()
        try:
            cur.execute("INSERT INTO inquiries (name, email, budget, message) VALUES (%s, %s, %s, %s)",
                       (data.get('name'), data.get('email'), data.get('budget'), data.get('message')))
            conn.commit()
            return jsonify({"status": "success"}), 201
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cur.close()
            conn.close()
    return jsonify({"status": "error"}), 500

@app.route('/api/inquiries', methods=['GET'])
def get_inquiries():
    if not session.get('logged_in'):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    conn = get_db_connection()
    if conn:
        cur = conn.cursor()
        cur.execute("SELECT id, name, email, budget, message, created_at FROM inquiries ORDER BY created_at DESC")
        rows = cur.fetchall()
        data = [{"id": r[0], "name": r[1], "email": r[2], "budget": r[3], "message": r[4], "created_at": r[5]} for r in rows]
        cur.close()
        conn.close()
        return jsonify(data)
    return jsonify([])

@app.route('/api/inquiries/<id>', methods=['DELETE'])
def delete_inquiry(id):
    if not session.get('logged_in'):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
    conn = get_db_connection()
    if conn:
        cur = conn.cursor()
        try:
            cur.execute("DELETE FROM inquiries WHERE id = %s", (id,))
            conn.commit()
            return jsonify({"status": "success"})
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cur.close()
            conn.close()
    return jsonify({"status": "error"}), 500

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(DIRECTORY, 'assets'), 'favicon.ico')

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
    port = 5000
    app.run(host="0.0.0.0", port=port)
