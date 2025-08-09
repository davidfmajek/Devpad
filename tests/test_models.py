# tests/test_models.py

from server.models.note_model import User, Note, Tag
from server.extensions import db

def test_user_model_creation(client):
    """Test User model creation."""
    with client.application.app_context():
        user = User(email='model_test@example.com', password_hash='hashed_password')
        db.session.add(user)
        db.session.commit()
        
        assert user.id is not None
        assert user.email == 'model_test@example.com'
        assert user.password_hash == 'hashed_password'
        assert user.created_at is not None
        assert user.updated_at is not None

def test_note_model_creation(client):
    """Test Note model creation."""
    with client.application.app_context():
        # Create a user first
        user = User(email='note_test@example.com', password_hash='hashed_password')
        db.session.add(user)
        db.session.commit()
        
        # Create a note
        note = Note(
            user_id=user.id,
            title='Test Note',
            content_md='# Test Content',
            language='markdown',
            favorite=False
        )
        db.session.add(note)
        db.session.commit()
        
        assert note.id is not None
        assert note.user_id == user.id
        assert note.title == 'Test Note'
        assert note.content_md == '# Test Content'
        assert note.language == 'markdown'
        assert note.favorite is False
        assert note.created_at is not None
        assert note.updated_at is not None

def test_tag_model_creation(client):
    """Test Tag model creation."""
    with client.application.app_context():
        tag = Tag(name='test-tag')
        db.session.add(tag)
        db.session.commit()
        
        assert tag.id is not None
        assert tag.name == 'test-tag'

def test_note_tag_relationship(client):
    """Test many-to-many relationship between notes and tags."""
    with client.application.app_context():
        # Create user
        user = User(email='relationship_test@example.com', password_hash='hashed_password')
        db.session.add(user)
        db.session.commit()
        
        # Create note
        note = Note(
            user_id=user.id,
            title='Tagged Note',
            content_md='Content with tags',
            language='markdown',
            favorite=False
        )
        
        # Create tags
        tag1 = Tag(name='python')
        tag2 = Tag(name='flask')
        
        # Add tags to note
        note.tags.append(tag1)
        note.tags.append(tag2)
        
        db.session.add(note)
        db.session.commit()
        
        # Verify relationships
        assert len(note.tags) == 2
        assert tag1 in note.tags
        assert tag2 in note.tags
        
        # Verify backref
        assert note in tag1.notes
        assert note in tag2.notes

def test_user_email_uniqueness(client):
    """Test that user emails must be unique."""
    with client.application.app_context():
        user1 = User(email='unique@example.com', password_hash='password1')
        user2 = User(email='unique@example.com', password_hash='password2')
        
        db.session.add(user1)
        db.session.commit()
        
        db.session.add(user2)
        
        # This should raise an integrity error due to unique constraint
        try:
            db.session.commit()
            assert False, "Should have raised an integrity error"
        except Exception:
            db.session.rollback()
            assert True

def test_tag_name_uniqueness(client):
    """Test that tag names must be unique."""
    with client.application.app_context():
        tag1 = Tag(name='unique-tag')
        tag2 = Tag(name='unique-tag')
        
        db.session.add(tag1)
        db.session.commit()
        
        db.session.add(tag2)
        
        # This should raise an integrity error due to unique constraint
        try:
            db.session.commit()
            assert False, "Should have raised an integrity error"
        except Exception:
            db.session.rollback()
            assert True

def test_note_requires_user(client):
    """Test that a note requires a valid user_id."""
    with client.application.app_context():
        note = Note(
            user_id=99999,  # Non-existent user
            title='Orphan Note',
            content_md='Content',
            language='markdown',
            favorite=False
        )
        
        db.session.add(note)
        
        # This should raise an integrity error due to foreign key constraint
        try:
            db.session.commit()
            assert False, "Should have raised an integrity error"
        except Exception:
            db.session.rollback()
            assert True
