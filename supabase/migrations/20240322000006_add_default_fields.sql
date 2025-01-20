-- Create enum types for various statuses and types
CREATE TYPE contact_field_type AS ENUM (
    'email', 'phone', 'address', 'social'
);

CREATE TYPE contact_field_status AS ENUM (
    'active', 'inactive'
);

CREATE TYPE social_media_type AS ENUM (
    'facebook', 'twitter', 'instagram', 'linkedin', 'other'
);

CREATE TYPE donation_status AS ENUM (
    'promise', 'donated', 'cleared'
);

-- Create a table for field definitions
CREATE TABLE field_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_type_id UUID REFERENCES record_types(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key TEXT NOT NULL,
    type TEXT NOT NULL,
    is_multiple BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(record_type_id, key)
);

-- Insert default fields for Contacts
WITH contact_type AS (
    SELECT id FROM record_types WHERE slug = 'contacts' AND is_system = true
)
INSERT INTO field_definitions (record_type_id, name, key, type, is_multiple)
SELECT 
    contact_type.id,
    field_name,
    field_key,
    field_type,
    is_multiple
FROM contact_type CROSS JOIN (
    VALUES 
        ('First Name', 'first_name', 'text', false),
        ('Middle Name', 'middle_name', 'text', false),
        ('Last Name', 'last_name', 'text', false),
        ('Emails', 'emails', 'email', true),
        ('Phone Numbers', 'phone_numbers', 'phone', true),
        ('Addresses', 'addresses', 'address', true),
        ('Social Media', 'social_media', 'social', true),
        ('Race', 'race', 'text', false),
        ('Gender', 'gender', 'text', false),
        ('Pronouns', 'pronouns', 'text', false)
) AS fields(field_name, field_key, field_type, is_multiple);

-- Insert default fields for Businesses
WITH business_type AS (
    SELECT id FROM record_types WHERE slug = 'businesses' AND is_system = true
)
INSERT INTO field_definitions (record_type_id, name, key, type, is_multiple)
SELECT 
    business_type.id,
    field_name,
    field_key,
    field_type,
    is_multiple
FROM business_type CROSS JOIN (
    VALUES 
        ('Business Name', 'business_name', 'text', false),
        ('Employees', 'employees', 'contact_reference', true),
        ('Addresses', 'addresses', 'address', true),
        ('Phone Numbers', 'phone_numbers', 'phone', true),
        ('Social Media', 'social_media', 'social', true)
) AS fields(field_name, field_key, field_type, is_multiple);

-- Insert default fields for Donations
WITH donation_type AS (
    SELECT id FROM record_types WHERE slug = 'donations' AND is_system = true
)
INSERT INTO field_definitions (record_type_id, name, key, type, is_multiple)
SELECT 
    donation_type.id,
    field_name,
    field_key,
    field_type,
    is_multiple
FROM donation_type CROSS JOIN (
    VALUES 
        ('Amount', 'amount', 'number', false),
        ('Status', 'status', 'donation_status', false),
        ('Donor', 'donor', 'donor_reference', false)
) AS fields(field_name, field_key, field_type, is_multiple);

-- Update the views table to use the new field definitions
ALTER TABLE views 
DROP COLUMN IF EXISTS settings,
ADD COLUMN settings JSONB NOT NULL DEFAULT '{
    "visible_fields": [],
    "filters": [],
    "sorts": []
}'::jsonb;

-- Add RLS policies
ALTER TABLE field_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users"
    ON field_definitions
    FOR SELECT
    TO authenticated
    USING (true); 