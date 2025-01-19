-- Create workspace_users table
CREATE TABLE workspace_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role workspace_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(workspace_id, user_id)
);

-- Add indexes
CREATE INDEX idx_workspace_users_workspace ON workspace_users(workspace_id);
CREATE INDEX idx_workspace_users_user ON workspace_users(user_id);

-- Add trigger for workspace_users
CREATE TRIGGER update_workspace_users_updated_at
    BEFORE UPDATE ON workspace_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS to workspace_users
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;

-- Create user_settings table
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    selected_workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add trigger for user_settings
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS to user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Add policies for user_settings
CREATE POLICY "Users can view their own settings"
    ON user_settings
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON user_settings
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON user_settings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id); 