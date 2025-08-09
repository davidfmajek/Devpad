# server/models/note_model.py

from server.extensions import db
from datetime import datetime

# 1) pivot table for many-to-many
note_tags = db.Table(
    'note_tags',
    db.Column('note_id', db.Integer, db.ForeignKey('notes.id'), primary_key=True),
    db.Column('tag_id',  db.Integer, db.ForeignKey('tags.id'),  primary_key=True)
)

# 2) NOTE comes first
class Note(db.Model):
    __tablename__ = 'notes'
    id             = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title          = db.Column(db.Text,    nullable=False)
    content_md     = db.Column(db.Text,    nullable=False)
    language       = db.Column(db.String(30), nullable=False)
    favorite       = db.Column(db.Boolean, default=False, nullable=False)
    created_at     = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at     = db.Column(db.DateTime(timezone=True),
                                default=datetime.utcnow,
                                onupdate=datetime.utcnow)
    last_viewed_at = db.Column(db.DateTime(timezone=True))
    tags           = db.relationship(
                        'Tag',
                        secondary=note_tags,
                        backref=db.backref('notes', lazy='dynamic')
                     )

# 3) TAG next
class Tag(db.Model):
    __tablename__ = 'tags'
    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.Text,    unique=True, nullable=False)

# 4) Finally, USER can map without Note to allow startup success
class User(db.Model):
    __tablename__ = 'users'
    id            = db.Column(db.Integer, primary_key=True)
    email         = db.Column(db.Text,    unique=True, nullable=False)
    password_hash = db.Column(db.Text,    nullable=False)
    created_at    = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at    = db.Column(db.DateTime(timezone=True),
                              default=datetime.utcnow,
                              onupdate=datetime.utcnow)
    # Define the relationship with notes
    notes = db.relationship('Note', backref='user', lazy=True, cascade="all, delete-orphan")
