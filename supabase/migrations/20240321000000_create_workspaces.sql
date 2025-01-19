-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums first
CREATE TYPE workspace_type AS ENUM ('state_party', 'county_party', 'campaign');
CREATE TYPE workspace_role AS ENUM ('owner', 'admin', 'member');

-- Create workspaces table first
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type workspace_type NOT NULL,
    state TEXT NOT NULL,
    county TEXT,
    race TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for workspaces
CREATE TRIGGER update_workspaces_updated_at
    BEFORE UPDATE ON workspaces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS to workspaces
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY; 