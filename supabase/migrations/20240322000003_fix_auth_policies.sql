-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON workspaces;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON workspace_users;
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON record_types;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON views;

-- Reset RLS for core tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE views ENABLE ROW LEVEL SECURITY;

-- Workspace policies
CREATE POLICY "Allow all operations for authenticated users"
    ON workspaces
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Workspace users policies
CREATE POLICY "Allow all operations for authenticated users"
    ON workspace_users
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- User settings policies
CREATE POLICY "Users can manage their own settings"
    ON user_settings
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Record types policies
CREATE POLICY "Enable read access for all authenticated users"
    ON record_types
    FOR SELECT
    TO authenticated
    USING (true);

-- Views policies
CREATE POLICY "Allow all operations for authenticated users"
    ON views
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true); 