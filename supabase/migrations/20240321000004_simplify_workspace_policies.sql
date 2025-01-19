-- First, disable RLS temporarily to clean up policies
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;

-- Drop policies only if they exist (using DO block for conditional drops)
DO $$ 
BEGIN
    -- Drop policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'workspaces' AND policyname = 'Enable insert for authenticated users only') THEN
        DROP POLICY "Enable insert for authenticated users only" ON workspaces;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'workspaces' AND policyname = 'Enable read access for users who belong to the workspace') THEN
        DROP POLICY "Enable read access for users who belong to the workspace" ON workspaces;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'workspaces' AND policyname = 'Enable update for workspace owners') THEN
        DROP POLICY "Enable update for workspace owners" ON workspaces;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'workspaces' AND policyname = 'Enable delete for workspace owners') THEN
        DROP POLICY "Enable delete for workspace owners" ON workspaces;
    END IF;
END
$$;

-- Re-enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
    ON workspaces
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);