-- Drop existing policies
DROP POLICY IF EXISTS "Users can view system record types" ON record_types;
DROP POLICY IF EXISTS "Users can view custom record types in their workspaces" ON record_types;

-- Create simpler policy
CREATE POLICY "Enable read access for all authenticated users"
    ON record_types
    FOR SELECT
    TO authenticated
    USING (true); 