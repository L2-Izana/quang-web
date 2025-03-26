-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the reports table with all necessary columns
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tinh_hinh TEXT NOT NULL,
    dia_ban TEXT NOT NULL,
    cap_bao_tin TEXT NOT NULL,
    don_vi_bao TEXT NOT NULL,
    form_type TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS) to control access
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow insert for authenticated users
CREATE POLICY "Allow insert for authenticated users" 
    ON reports FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- Create a policy to allow select for authenticated users
CREATE POLICY "Allow read access for all users" 
    ON reports FOR SELECT 
    TO authenticated 
    USING (true);

-- Create an index on created_at for more efficient queries
CREATE INDEX reports_created_at_idx ON reports (created_at DESC);

-- Create an index on form_type for filtering
CREATE INDEX reports_form_type_idx ON reports (form_type);

-- Create an index on user_id for user-specific queries
CREATE INDEX reports_user_id_idx ON reports (user_id); 