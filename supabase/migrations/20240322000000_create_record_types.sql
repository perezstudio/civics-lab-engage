-- Drop the table if it exists
DROP TABLE IF EXISTS record_types CASCADE;

-- Create record_types table
CREATE TABLE record_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT workspace_id_null_if_system CHECK (
    (is_system = true AND workspace_id IS NULL) OR
    (is_system = false)
  )
);

-- Add indexes
CREATE INDEX idx_record_types_workspace ON record_types(workspace_id) WHERE workspace_id IS NOT NULL;
CREATE INDEX idx_record_types_slug ON record_types(slug);
CREATE INDEX idx_record_types_system ON record_types(is_system);

-- Add trigger for updated_at
CREATE TRIGGER update_record_types_updated_at
    BEFORE UPDATE ON record_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE record_types ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view system record types"
    ON record_types
    FOR SELECT
    USING (is_system = true);

CREATE POLICY "Users can view custom record types in their workspaces"
    ON record_types
    FOR SELECT
    USING (
        workspace_id IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM workspace_users
            WHERE workspace_users.workspace_id = record_types.workspace_id
            AND workspace_users.user_id = auth.uid()
        )
    );

-- Insert default system record types
INSERT INTO record_types (name, slug, is_system)
VALUES 
    ('Contacts', 'contacts', true),
    ('Businesses', 'businesses', true),
    ('Donations', 'donations', true);

-- Add selected_record_type to user_settings if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_settings' 
        AND column_name = 'selected_record_type_id'
    ) THEN
        ALTER TABLE user_settings
        ADD COLUMN selected_record_type_id UUID REFERENCES record_types(id) ON DELETE SET NULL;
    END IF;
END $$; 