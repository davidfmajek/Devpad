-- database/schema.sql

-- 1. Users
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  email           TEXT    NOT NULL UNIQUE,
  password_hash   TEXT    NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Notes
CREATE TABLE notes (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT    NOT NULL,
  content_md      TEXT    NOT NULL,               --markdown source
  language        VARCHAR(30) NOT NULL,           -- e.g. 'python', 'javascript'
  favorite        BOOLEAN DEFAULT FALSE NOT NULL, -- starred
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  last_viewed_at  TIMESTAMP WITH TIME ZONE         -- can be NULL until first view
);

-- 3. Tags
CREATE TABLE tags (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- 4. Note ↔ Tag many-to-many
CREATE TABLE note_tags (
  note_id  INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id   INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- 5. (Optional) Version history
CREATE TABLE note_versions (
  id           SERIAL PRIMARY KEY,
  note_id      INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  version_no   INTEGER NOT NULL,                
  title        TEXT    NOT NULL,
  content_md   TEXT    NOT NULL,
  language     VARCHAR(30) NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Indexes to speed up common queries
CREATE INDEX idx_notes_user       ON notes(user_id);
CREATE INDEX idx_notes_language   ON notes(language);
CREATE INDEX idx_note_versions_n  ON note_versions(note_id);
CREATE INDEX idx_tags_name        ON tags(name);
