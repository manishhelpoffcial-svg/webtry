CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS works (
    id TEXT PRIMARY KEY,
    image TEXT NOT NULL,
    category_id TEXT REFERENCES categories(id),
    subcategory_id TEXT REFERENCES categories(id),
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

-- Default categories
INSERT INTO categories (id, name, parent_id) VALUES 
('graphic_design', 'Graphics Design', NULL),
('video_editing', 'Video Editing', NULL),
('poster', 'Poster', 'graphic_design'),
('logo', 'Logo', 'graphic_design'),
('menu_card', 'Menu Card', 'graphic_design'),
('business_card', 'Business Card', 'graphic_design'),
('thumbnail', 'Thumbnail', 'graphic_design'),
('short_video', 'Short Video', 'video_editing'),
('long_video', 'Long Video', 'video_editing'),
('wedding_video', 'Wedding Video', 'video_editing')
ON CONFLICT (id) DO NOTHING;
