-- ============================================
-- SeasonAI — Schema Fix Migration
-- Run this in Supabase SQL Editor BEFORE seeding
-- ============================================

-- 1. Drop existing tables (to reset schema with correct dimensions)
DROP FUNCTION IF EXISTS match_catalog CASCADE;
DROP FUNCTION IF EXISTS get_social_proof CASCADE;
DROP TABLE IF EXISTS bundles CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS catalog CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'business_owner', 'admin')),
    preferences JSONB DEFAULT '{}',
    location VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CATALOG TABLE
-- ============================================
CREATE TABLE catalog (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    price DECIMAL(10,2),
    price_range VARCHAR(20) CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    location VARCHAR(255),
    address TEXT,
    phone VARCHAR(50),
    website VARCHAR(255),
    image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    mood_tags TEXT[] DEFAULT '{}',
    season_tags TEXT[] DEFAULT '{}',
    business_hours JSONB DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',
    cuisine_type VARCHAR(100),
    ambiance VARCHAR(100),
    owner_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- pgvector embedding column (768 dims for Gemini embedding)
    embedding vector(768)
);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    catalog_id UUID REFERENCES catalog(id),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('view', 'click', 'purchase', 'bundle_click', 'search', 'voice_search', 'mood_select', 'share')),
    metadata JSONB DEFAULT '{}',
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BUNDLES TABLE
-- ============================================
CREATE TABLE bundles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tagline TEXT,
    items UUID[] DEFAULT '{}',
    mood VARCHAR(50),
    season VARCHAR(20),
    total_price DECIMAL(10,2),
    discount_percent DECIMAL(5,2) DEFAULT 0,
    created_by VARCHAR(50) DEFAULT 'ai',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_catalog_embedding ON catalog
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);

CREATE INDEX idx_events_catalog_time ON events (catalog_id, created_at DESC);
CREATE INDEX idx_events_type_time ON events (event_type, created_at DESC);
CREATE INDEX idx_events_user ON events (user_id, created_at DESC);
CREATE INDEX idx_catalog_category ON catalog (category);
CREATE INDEX idx_catalog_mood ON catalog USING GIN (mood_tags);
CREATE INDEX idx_catalog_season ON catalog USING GIN (season_tags);
CREATE INDEX idx_catalog_tags ON catalog USING GIN (tags);
CREATE INDEX idx_catalog_active ON catalog (is_active) WHERE is_active = TRUE;

-- ============================================
-- FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION match_catalog(
    query_embedding vector(768),
    match_threshold FLOAT DEFAULT 0.3,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2),
    price_range VARCHAR(20),
    rating DECIMAL(3,2),
    review_count INTEGER,
    location VARCHAR(255),
    tags TEXT[],
    mood_tags TEXT[],
    season_tags TEXT[],
    cuisine_type VARCHAR(100),
    ambiance VARCHAR(100),
    image_url TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.description,
        c.category,
        c.price,
        c.price_range,
        c.rating,
        c.review_count,
        c.location,
        c.tags,
        c.mood_tags,
        c.season_tags,
        c.cuisine_type,
        c.ambiance,
        c.image_url,
        1 - (c.embedding <=> query_embedding) AS similarity
    FROM catalog c
    WHERE c.is_active = TRUE
      AND 1 - (c.embedding <=> query_embedding) > match_threshold
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION get_social_proof(catalog_ids UUID[])
RETURNS TABLE (
    catalog_id UUID,
    view_count BIGINT,
    click_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.catalog_id,
        COUNT(*) FILTER (WHERE e.event_type = 'view') AS view_count,
        COUNT(*) FILTER (WHERE e.event_type = 'click') AS click_count
    FROM events e
    WHERE e.catalog_id = ANY(catalog_ids)
      AND e.created_at > NOW() - INTERVAL '1 hour'
    GROUP BY e.catalog_id;
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY (with INSERT policies)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;

-- Users: allow read & insert for everyone (anon key)
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can be inserted" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can be updated" ON users FOR UPDATE USING (true);

-- Catalog: allow read & insert for everyone
CREATE POLICY "Catalog is viewable by everyone" ON catalog FOR SELECT USING (true);
CREATE POLICY "Catalog items can be inserted" ON catalog FOR INSERT WITH CHECK (true);
CREATE POLICY "Catalog items can be updated" ON catalog FOR UPDATE USING (true);

-- Events: allow read & insert for everyone
CREATE POLICY "Events are readable" ON events FOR SELECT USING (true);
CREATE POLICY "Events can be inserted" ON events FOR INSERT WITH CHECK (true);

-- Bundles: allow read & insert
CREATE POLICY "Bundles are viewable" ON bundles FOR SELECT USING (true);
CREATE POLICY "Bundles can be inserted" ON bundles FOR INSERT WITH CHECK (true);
