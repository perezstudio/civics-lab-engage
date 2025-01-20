-- Create views table
CREATE TABLE views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{
    "columns": [],
    "filters": [],
    "sorts": []
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_views_workspace ON views(workspace_id);
CREATE INDEX idx_views_type ON views(type);

-- Add trigger for updated_at
CREATE TRIGGER update_views_updated_at
    BEFORE UPDATE ON views
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE views ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view views in their workspaces"
    ON views
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workspace_users
            WHERE workspace_users.workspace_id = views.workspace_id
            AND workspace_users.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create views in their workspaces"
    ON views
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspace_users
            WHERE workspace_users.workspace_id = views.workspace_id
            AND workspace_users.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update views in their workspaces"
    ON views
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM workspace_users
            WHERE workspace_users.workspace_id = views.workspace_id
            AND workspace_users.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete views in their workspaces"
    ON views
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM workspace_users
            WHERE workspace_users.workspace_id = views.workspace_id
            AND workspace_users.user_id = auth.uid()
        )
    ); 