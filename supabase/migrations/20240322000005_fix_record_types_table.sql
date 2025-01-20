-- First, drop the existing record_types table and its dependencies
DROP TABLE IF EXISTS record_types CASCADE;

-- Recreate the record_types table with the correct structure
CREATE TABLE record_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_record_types_workspace ON record_types(workspace_id);
CREATE INDEX idx_record_types_slug ON record_types(slug);
CREATE INDEX idx_record_types_system ON record_types(is_system);

-- Enable RLS
ALTER TABLE record_types ENABLE ROW LEVEL SECURITY;

-- Add RLS policy
CREATE POLICY "Enable read access for all authenticated users"
    ON record_types
    FOR SELECT
    TO authenticated
    USING (true);

-- Insert default system record types
INSERT INTO record_types (id, name, slug, is_system)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Contacts', 'contacts', true),
    ('00000000-0000-0000-0000-000000000002', 'Businesses', 'businesses', true),
    ('00000000-0000-0000-0000-000000000003', 'Donations', 'donations', true);

-- Make sure user_settings references the new record_types table
ALTER TABLE user_settings
    DROP CONSTRAINT IF EXISTS user_settings_selected_record_type_id_fkey,
    ADD CONSTRAINT user_settings_selected_record_type_id_fkey 
        FOREIGN KEY (selected_record_type_id) 
        REFERENCES record_types(id) 
        ON DELETE SET NULL; 