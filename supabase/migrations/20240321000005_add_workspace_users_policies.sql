-- Drop existing policies if any
ALTER TABLE workspace_users DISABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- Drop existing policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'workspace_users') THEN
        DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON workspace_users;
    END IF;
END
$$;

ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;

-- Add simple policy for workspace_users
CREATE POLICY "Allow all operations for authenticated users"
    ON workspace_users
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true); 