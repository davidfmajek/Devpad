# server/routes/notes.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.extensions import db
from server.models.note_model import Note, Tag

# Define and export the blueprint
notes_bp = Blueprint("notes", __name__, url_prefix="/api/notes")

@notes_bp.route("", methods=["GET"])
@jwt_required()
def list_notes():
    user_id = int(get_jwt_identity())
    notes = Note.query.filter_by(user_id=user_id).order_by(Note.updated_at.desc()).all()
    return jsonify([{
        "id": n.id,
        "title": n.title,
        "content_md": n.content_md,
        "language": n.language,
        "favorite": n.favorite,
        "tags": [t.name for t in n.tags],
        "created_at": n.created_at.isoformat(),
        "updated_at": n.updated_at.isoformat(),
        "last_viewed_at": n.last_viewed_at.isoformat() if n.last_viewed_at else None
    } for n in notes]), 200

@notes_bp.route("", methods=["POST"])
@jwt_required()
def create_note():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    note = Note(
        user_id=user_id,
        title=data.get("title", "Untitled"),
        content_md=data.get("content_md", ""),
        language=data.get("language", "plaintext"),
        favorite=data.get("favorite", False)
    )
    # handle tags
    for name in data.get("tags", []):
        tag = Tag.query.filter_by(name=name).first() or Tag(name=name)
        note.tags.append(tag)

    db.session.add(note)
    db.session.commit()
    return jsonify({"id": note.id}), 201

@notes_bp.route("/<int:note_id>", methods=["PUT"])
@jwt_required()
def update_note(note_id):
    user_id = int(get_jwt_identity())
    note = Note.query.get_or_404(note_id)
    if note.user_id != user_id:
        return jsonify({"msg": "Forbidden"}), 403
    data = request.get_json() or {}
    note.title      = data.get("title", note.title)
    note.content_md = data.get("content_md", note.content_md)
    note.language   = data.get("language", note.language)
    note.favorite   = data.get("favorite", note.favorite)
    note.tags.clear()
    for name in data.get("tags", []):
        tag = Tag.query.filter_by(name=name).first() or Tag(name=name)
        note.tags.append(tag)
    db.session.commit()
    return jsonify({"msg": "Updated"}), 200

@notes_bp.route("/<int:note_id>", methods=["DELETE"])
@jwt_required()
def delete_note(note_id):
    user_id = int(get_jwt_identity())
    note = Note.query.get_or_404(note_id)
    if note.user_id != user_id:
        return jsonify({"msg": "Forbidden"}), 403
    db.session.delete(note)
    db.session.commit()
    return jsonify({"msg": "Deleted"}), 200
