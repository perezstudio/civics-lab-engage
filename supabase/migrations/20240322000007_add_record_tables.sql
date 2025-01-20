-- Base table for all records
CREATE TABLE records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    record_type_id UUID NOT NULL REFERENCES record_types(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for contact records
CREATE TABLE contact_records (
    record_id UUID PRIMARY KEY REFERENCES records(id) ON DELETE CASCADE,
    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    race TEXT,
    gender TEXT,
    pronouns TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for business records
CREATE TABLE business_records (
    record_id UUID PRIMARY KEY REFERENCES records(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for donation records
CREATE TABLE donation_records (
    record_id UUID PRIMARY KEY REFERENCES records(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status donation_status NOT NULL DEFAULT 'promise',
    donor_type TEXT NOT NULL, -- 'contact' or 'business'
    donor_id UUID NOT NULL, -- references either contact_records or business_records
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for email addresses
CREATE TABLE record_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID NOT NULL REFERENCES records(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    type TEXT NOT NULL, -- 'personal', 'work', etc.
    status contact_field_status NOT NULL DEFAULT 'active',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for phone numbers
CREATE TABLE record_phones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID NOT NULL REFERENCES records(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    type TEXT NOT NULL, -- 'mobile', 'work', 'home', etc.
    status contact_field_status NOT NULL DEFAULT 'active',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for addresses
CREATE TABLE record_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID NOT NULL REFERENCES records(id) ON DELETE CASCADE,
    street_1 TEXT NOT NULL,
    street_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'USA',
    type TEXT NOT NULL, -- 'home', 'work', 'mailing', etc.
    status contact_field_status NOT NULL DEFAULT 'active',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for social media accounts
CREATE TABLE record_social_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID NOT NULL REFERENCES records(id) ON DELETE CASCADE,
    platform social_media_type NOT NULL,
    username TEXT NOT NULL,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for business employees (linking businesses to contacts)
CREATE TABLE business_employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_record_id UUID NOT NULL REFERENCES business_records(record_id) ON DELETE CASCADE,
    contact_record_id UUID NOT NULL REFERENCES contact_records(record_id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(business_record_id, contact_record_id)
);

-- Add indexes
CREATE INDEX idx_records_workspace ON records(workspace_id);
CREATE INDEX idx_records_type ON records(record_type_id);
CREATE INDEX idx_record_emails_record ON record_emails(record_id);
CREATE INDEX idx_record_phones_record ON record_phones(record_id);
CREATE INDEX idx_record_addresses_record ON record_addresses(record_id);
CREATE INDEX idx_record_social_media_record ON record_social_media(record_id);
CREATE INDEX idx_business_employees_business ON business_employees(business_record_id);
CREATE INDEX idx_business_employees_contact ON business_employees(contact_record_id);

-- Add RLS policies
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_phones ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_social_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_employees ENABLE ROW LEVEL SECURITY;

-- Records policy
CREATE POLICY "Users can manage records in their workspaces"
    ON records
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM workspace_users
            WHERE workspace_users.workspace_id = records.workspace_id
            AND workspace_users.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspace_users
            WHERE workspace_users.workspace_id = records.workspace_id
            AND workspace_users.user_id = auth.uid()
        )
    );

-- Add similar policies for other tables based on record_id's workspace
-- ... (policies for other tables follow the same pattern)

-- Add triggers for updated_at
CREATE TRIGGER update_records_updated_at
    BEFORE UPDATE ON records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add similar triggers for other tables
-- ... (triggers for other tables follow the same pattern) 