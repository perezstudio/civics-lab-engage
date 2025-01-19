export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      business_addresses: {
        Row: {
          business_id: string | null
          city: string
          created_at: string | null
          id: string
          postal_code: string
          state: string
          status: Database["public"]["Enums"]["address_status"] | null
          street_address: string
          type: Database["public"]["Enums"]["address_type"] | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          city: string
          created_at?: string | null
          id?: string
          postal_code: string
          state: string
          status?: Database["public"]["Enums"]["address_status"] | null
          street_address: string
          type?: Database["public"]["Enums"]["address_type"] | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          city?: string
          created_at?: string | null
          id?: string
          postal_code?: string
          state?: string
          status?: Database["public"]["Enums"]["address_status"] | null
          street_address?: string
          type?: Database["public"]["Enums"]["address_type"] | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_addresses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_employees: {
        Row: {
          business_id: string | null
          contact_id: string | null
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_employees_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_employees_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      business_phones: {
        Row: {
          business_id: string | null
          created_at: string | null
          id: string
          phone: string
          status: Database["public"]["Enums"]["phone_status"] | null
          type: Database["public"]["Enums"]["phone_type"] | null
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          phone: string
          status?: Database["public"]["Enums"]["phone_status"] | null
          type?: Database["public"]["Enums"]["phone_type"] | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          phone?: string
          status?: Database["public"]["Enums"]["phone_status"] | null
          type?: Database["public"]["Enums"]["phone_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_phones_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_social_media: {
        Row: {
          business_id: string | null
          created_at: string | null
          id: string
          platform: Database["public"]["Enums"]["social_media_type"]
          updated_at: string | null
          url: string | null
          username: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          platform: Database["public"]["Enums"]["social_media_type"]
          updated_at?: string | null
          url?: string | null
          username: string
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          platform?: Database["public"]["Enums"]["social_media_type"]
          updated_at?: string | null
          url?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_social_media_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_addresses: {
        Row: {
          city: string
          contact_id: string | null
          created_at: string | null
          id: string
          postal_code: string
          state: string
          status: Database["public"]["Enums"]["address_status"] | null
          street_address: string
          type: Database["public"]["Enums"]["address_type"] | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          city: string
          contact_id?: string | null
          created_at?: string | null
          id?: string
          postal_code: string
          state: string
          status?: Database["public"]["Enums"]["address_status"] | null
          street_address: string
          type?: Database["public"]["Enums"]["address_type"] | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string
          contact_id?: string | null
          created_at?: string | null
          id?: string
          postal_code?: string
          state?: string
          status?: Database["public"]["Enums"]["address_status"] | null
          street_address?: string
          type?: Database["public"]["Enums"]["address_type"] | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_addresses_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_emails: {
        Row: {
          contact_id: string | null
          created_at: string | null
          email: string
          id: string
          status: Database["public"]["Enums"]["email_status"] | null
          type: Database["public"]["Enums"]["email_type"] | null
          updated_at: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          status?: Database["public"]["Enums"]["email_status"] | null
          type?: Database["public"]["Enums"]["email_type"] | null
          updated_at?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          status?: Database["public"]["Enums"]["email_status"] | null
          type?: Database["public"]["Enums"]["email_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_emails_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_phones: {
        Row: {
          contact_id: string | null
          created_at: string | null
          id: string
          phone: string
          status: Database["public"]["Enums"]["phone_status"] | null
          type: Database["public"]["Enums"]["phone_type"] | null
          updated_at: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          phone: string
          status?: Database["public"]["Enums"]["phone_status"] | null
          type?: Database["public"]["Enums"]["phone_type"] | null
          updated_at?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          phone?: string
          status?: Database["public"]["Enums"]["phone_status"] | null
          type?: Database["public"]["Enums"]["phone_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_phones_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_social_media: {
        Row: {
          contact_id: string | null
          created_at: string | null
          id: string
          platform: Database["public"]["Enums"]["social_media_type"]
          updated_at: string | null
          url: string | null
          username: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          platform: Database["public"]["Enums"]["social_media_type"]
          updated_at?: string | null
          url?: string | null
          username: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          platform?: Database["public"]["Enums"]["social_media_type"]
          updated_at?: string | null
          url?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_social_media_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string | null
          first_name: string
          gender: string | null
          id: string
          last_name: string
          middle_name: string | null
          pronouns: string | null
          race: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          middle_name?: string | null
          pronouns?: string | null
          race?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          middle_name?: string | null
          pronouns?: string | null
          race?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          business_id: string | null
          contact_id: string | null
          created_at: string | null
          id: string
          status: Database["public"]["Enums"]["donation_status"]
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          amount: number
          business_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["donation_status"]
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          amount?: number
          business_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["donation_status"]
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          selected_workspace_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          selected_workspace_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          selected_workspace_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_selected_workspace_id_fkey"
            columns: ["selected_workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      views: {
        Row: {
          columns: Json
          created_at: string | null
          filters: Json
          id: string
          name: string
          sorts: Json
          table_name: string
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          columns?: Json
          created_at?: string | null
          filters?: Json
          id?: string
          name: string
          sorts?: Json
          table_name: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          columns?: Json
          created_at?: string | null
          filters?: Json
          id?: string
          name?: string
          sorts?: Json
          table_name?: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "views_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_users: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["workspace_role"]
          updated_at: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          updated_at?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          updated_at?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_users_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          county: string | null
          created_at: string | null
          id: string
          name: string
          race: string | null
          state: string
          type: Database["public"]["Enums"]["workspace_type"]
          updated_at: string | null
        }
        Insert: {
          county?: string | null
          created_at?: string | null
          id?: string
          name: string
          race?: string | null
          state: string
          type: Database["public"]["Enums"]["workspace_type"]
          updated_at?: string | null
        }
        Update: {
          county?: string | null
          created_at?: string | null
          id?: string
          name?: string
          race?: string | null
          state?: string
          type?: Database["public"]["Enums"]["workspace_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      address_status: "current" | "previous" | "temporary"
      address_type: "home" | "work" | "mailing" | "other"
      donation_status: "promise" | "donated" | "cleared"
      email_status: "active" | "inactive" | "bounced" | "unsubscribed"
      email_type: "personal" | "work" | "other"
      phone_status: "active" | "inactive" | "disconnected"
      phone_type: "mobile" | "home" | "work" | "other"
      social_media_type:
        | "facebook"
        | "twitter"
        | "instagram"
        | "linkedin"
        | "other"
      workspace_role: "owner" | "admin" | "member"
      workspace_type: "state_party" | "county_party" | "campaign"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

