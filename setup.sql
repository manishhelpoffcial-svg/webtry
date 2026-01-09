-- 1. Create Categories Table First
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT REFERENCES categories(id)
);

-- 2. Create Works Table
CREATE TABLE IF NOT EXISTS works (
    id TEXT PRIMARY KEY,
    image TEXT NOT NULL,
    category_id TEXT REFERENCES categories(id),
    subcategory_id TEXT REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT,
    budget TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Insert Default Categories (Using individual statements for maximum compatibility)
INSERT INTO categories (id, name, parent_id) VALUES ('graphic_design', 'Graphics Design', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, parent_id) VALUES ('video_editing', 'Video Editing', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, parent_id) VALUES ('poster', 'Poster', 'graphic_design') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, parent_id) VALUES ('logo', 'Logo', 'graphic_design') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, parent_id) VALUES ('menu_card', 'Menu Card', 'graphic_design') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, parent_id) VALUES ('business_card', 'Business Card', 'graphic_design') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, parent_id) VALUES ('thumbnail', 'Thumbnail', 'graphic_design') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, parent_id) VALUES ('short_video', 'Short Video', 'video_editing') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, parent_id) VALUES ('long_video', 'Long Video', 'video_editing') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, parent_id) VALUES ('wedding_video', 'Wedding Video', 'video_editing') ON CONFLICT (id) DO NOTHING;
