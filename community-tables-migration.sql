-- Community Forum Database Migration
-- Run this script to create the community discussion tables

-- Create discussions table
CREATE TABLE IF NOT EXISTS discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    author_id UUID NOT NULL REFERENCES users(id),
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES discussions(id),
    parent_comment_id UUID REFERENCES comments(id),
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id),
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    discussion_id UUID REFERENCES discussions(id),
    comment_id UUID REFERENCES comments(id),
    type TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, discussion_id, comment_id, type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discussions_category ON discussions(category);
CREATE INDEX IF NOT EXISTS idx_discussions_author ON discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_discussions_status ON discussions(status);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_discussion ON comments(discussion_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);

CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_discussion ON likes(discussion_id);
CREATE INDEX IF NOT EXISTS idx_likes_comment ON likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_likes_type ON likes(type);

-- Insert sample community discussions
INSERT INTO discussions (title, content, category, tags, author_id) VALUES
('Welcome to KTU BizConnect Community!', 'This is the official launch of our community forum. Share your business ideas, get feedback from peers, and connect with fellow student entrepreneurs.', 'general', '{"welcome", "announcement", "community"}', (SELECT id FROM users WHERE role = 'vendor' LIMIT 1)),
('Looking for Co-founder for Tech Startup', 'I have a great idea for a mobile app that connects students with part-time jobs. Looking for someone with technical skills to join as co-founder.', 'business-ideas', '{"co-founder", "tech", "mobile-app", "startup"}', (SELECT id FROM users WHERE role = 'vendor' LIMIT 1)),  
('How to pitch to investors?', 'Any tips on preparing for investor meetings? I have a solid business plan but nervous about the presentation.', 'funding', '{"investors", "pitch", "presentation", "funding"}', (SELECT id FROM users WHERE role = 'vendor' ORDER BY created_at LIMIT 1 OFFSET 1)),
('Social Media Marketing on Budget', 'What are the best free/cheap ways to market your business on social media? Especially for targeting other students.', 'marketing', '{"social-media", "marketing", "budget", "students"}', (SELECT id FROM users WHERE role = 'vendor' ORDER BY created_at LIMIT 1 OFFSET 2)),
('My First Sale Success Story!', 'Just wanted to share that I made my first ₵500 in sales through KTU BizConnect! Thanks to everyone who supported my custom t-shirt business.', 'success-stories', '{"success", "first-sale", "t-shirts", "celebration"}', (SELECT id FROM users WHERE role = 'vendor' ORDER BY created_at LIMIT 1 OFFSET 3));

-- Insert sample comments
INSERT INTO comments (discussion_id, content, author_id) VALUES
((SELECT id FROM discussions WHERE title = 'Welcome to KTU BizConnect Community!' LIMIT 1), 'Excited to be part of this community! Looking forward to connecting with fellow entrepreneurs.', (SELECT id FROM users WHERE role = 'vendor' ORDER BY created_at LIMIT 1 OFFSET 1)),
((SELECT id FROM discussions WHERE title = 'Welcome to KTU BizConnect Community!' LIMIT 1), 'This is exactly what we needed at KTU. Great initiative!', (SELECT id FROM users WHERE role = 'vendor' ORDER BY created_at LIMIT 1 OFFSET 2)),
((SELECT id FROM discussions WHERE title = 'Looking for Co-founder for Tech Startup' LIMIT 1), 'I have experience with mobile app development. Would love to hear more about your idea!', (SELECT id FROM users WHERE role = 'vendor' ORDER BY created_at LIMIT 1 OFFSET 3)),
((SELECT id FROM discussions WHERE title = 'How to pitch to investors?' LIMIT 1), 'Practice your pitch with friends first. Keep it under 5 minutes and focus on the problem you solve.', (SELECT id FROM users WHERE role = 'vendor' ORDER BY created_at LIMIT 1 OFFSET 4)),
((SELECT id FROM discussions WHERE title = 'My First Sale Success Story!' LIMIT 1), 'Congratulations! Your t-shirt designs are amazing. Well deserved success!', (SELECT id FROM users WHERE role = 'vendor' ORDER BY created_at LIMIT 1 OFFSET 1));

-- Insert sample likes
INSERT INTO likes (user_id, discussion_id, type) VALUES
((SELECT id FROM users WHERE role = 'vendor' ORDER BY created_at LIMIT 1 OFFSET 1), (SELECT id FROM discussions WHERE title = 'Welcome to KTU BizConnect Community!' LIMIT 1), 'discussion'),
((SELECT id FROM users WHERE role = 'vendor' ORDER BY created_at LIMIT 1 OFFSET 2), (SELECT id FROM discussions WHERE title = 'Welcome to KTU BizConnect Community!' LIMIT 1), 'discussion'),
((SELECT id FROM users WHERE role = 'vendor' ORDER BY created_at LIMIT 1 OFFSET 3), (SELECT id FROM discussions WHERE title = 'My First Sale Success Story!' LIMIT 1), 'discussion'),
((SELECT id FROM users WHERE role = 'vendor' ORDER BY created_at LIMIT 1 OFFSET 4), (SELECT id FROM discussions WHERE title = 'My First Sale Success Story!' LIMIT 1), 'discussion');

-- Update discussion counts
UPDATE discussions SET 
    like_count = (SELECT COUNT(*) FROM likes WHERE discussion_id = discussions.id AND type = 'discussion'),
    comment_count = (SELECT COUNT(*) FROM comments WHERE discussion_id = discussions.id AND status = 'published');

-- Update comment counts
UPDATE comments SET 
    like_count = (SELECT COUNT(*) FROM likes WHERE comment_id = comments.id AND type = 'comment'),
    reply_count = (SELECT COUNT(*) FROM comments c2 WHERE c2.parent_comment_id = comments.id AND c2.status = 'published');

COMMIT;