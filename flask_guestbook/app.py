import os
import sqlite3
from base64 import b64decode
from flask import Flask, request, jsonify, Response
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"]) 

DB_PATH = os.path.join(os.path.dirname(__file__), 'guestbook.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, message TEXT NOT NULL, ip TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    conn.commit()
    conn.close()

def require_basic_auth():
    auth = request.headers.get('Authorization')
    if not auth or not auth.startswith('Basic '):
        return None
    creds = b64decode(auth.split(' ', 1)[1]).decode('utf-8')
    if ':' not in creds:
        return None
    user, pwd = creds.split(':', 1)
    if user == os.environ.get('ADMIN_USER') and pwd == os.environ.get('ADMIN_PASS'):
        return True
    return None

@app.route('/api/health')
def health():
    return jsonify({"status": "ok"})

@app.route('/api/messages', methods=['POST'])
def create_message():
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    message = (data.get('message') or '').strip()
    if not name or not message:
        return jsonify({"error": "invalid"}), 400
    ip = request.headers.get('X-Forwarded-For') or request.remote_addr
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("INSERT INTO messages (name, message, ip) VALUES (?, ?, ?)", (name, message, ip))
    conn.commit()
    conn.close()
    return jsonify({"ok": True})

@app.route('/admin/messages')
def admin_messages():
    if not require_basic_auth():
        return Response(status=401, headers={'WWW-Authenticate': 'Basic realm="Guestbook"'})
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT id, name, message, ip, created_at FROM messages ORDER BY created_at DESC")
    rows = cur.fetchall()
    conn.close()
    items = ''.join([f"<tr><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td></tr>" for r in rows])
    html = f"""
    <!DOCTYPE html>
    <html><head><meta charset='utf-8'><title>Guestbook Admin</title>
    <style>body{{font-family:Inter,system-ui;-webkit-font-smoothing:antialiased;margin:24px;color:#222}}table{{border-collapse:collapse;width:100%}}td,th{{border:1px solid #ddd;padding:8px}}th{{background:#f5f5f7}}</style>
    </head><body>
    <h2>Messages</h2>
    <table><thead><tr><th>ID</th><th>Name</th><th>Message</th><th>IP</th><th>Time</th></tr></thead><tbody>{items}</tbody></table>
    </body></html>
    """
    return Response(html, mimetype='text/html')

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', '5000'))
    app.run(host='0.0.0.0', port=port)
