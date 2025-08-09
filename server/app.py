# server/app.py

import os
import sys
from datetime import timedelta
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.extensions import db, bcrypt, jwt

load_dotenv()

app = Flask(__name__)
CORS(app)

# ─── JWT Configuration ───────────────────────────────────────────────────────
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "devpad-secret-key")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

# ─── Database Configuration ─────────────────────────────────────────────────
# Uses DATABASE_URL from .env, otherwise falls back to a local SQLite file
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL", "sqlite:///devpad.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# ─── Initialize Extensions ──────────────────────────────────────────────────
db.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)

# ─── Create Database Tables ──────────────────────────────────────────────────
with app.app_context():
    # Import models to ensure they are registered
    from server.models.note_model import User, Note, Tag
    db.create_all()

@app.route("/api/ping")
def ping():
    return {"message": "pong from DevPad!"}

# Import and register blueprints after extensions are initialized
from server.auth.auth_routes import auth_bp
from server.routes.notes import notes_bp
app.register_blueprint(auth_bp)
app.register_blueprint(notes_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)
