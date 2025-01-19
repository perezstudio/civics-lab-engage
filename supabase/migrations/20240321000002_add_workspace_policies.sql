-- Policies for workspaces table
CREATE POLICY "Users can view workspaces they belong to"
    ON workspaces
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workspace_users
            WHERE workspace_users.workspace_id = workspaces.id
            AND workspace_users.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create workspaces"
    ON workspaces
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Workspace owners can update their workspaces"
    ON workspaces
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM workspace_users
            WHERE workspace_users.workspace_id = workspaces.id
            AND workspace_users.user_id = auth.uid()
            AND workspace_users.role = 'owner'
        )
    );

CREATE POLICY "Workspace owners can delete their workspaces"
    ON workspaces
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM workspace_users
            WHERE workspace_users.workspace_id = workspaces.id
            AND workspace_users.user_id = auth.uid()
            AND workspace_users.role = 'owner'
        )
    );

-- Policies for workspace_users table
CREATE POLICY "Users can view members of their workspaces"
    ON workspace_users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workspace_users AS wu
            WHERE wu.workspace_id = workspace_users.workspace_id
            AND wu.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join workspaces"
    ON workspace_users
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Workspace owners can manage members"
    ON workspace_users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM workspace_users AS wu
            WHERE wu.workspace_id = workspace_users.workspace_id
            AND wu.user_id = auth.uid()
            AND wu.role = 'owner'
        )
    ); 