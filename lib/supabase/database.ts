/* -------------------------------------------------------------------------- */
/*                                database.ts                           */
/* -------------------------------------------------------------------------- */
/*
  This file describes your Supabase database schema in TypeScript.

  Main sections:
  - Json: helper type for JSON fields
  - Database: full schema definition for Supabase "public" schema
  - Tables / TablesInsert / TablesUpdate: generic helpers for type-safe access
  - Enums / CompositeTypes: generic helpers for typed enums and composite types
  - Constants: typed constants exported by Supabase generator
*/

/* -------------------------------------------------------------------------- */
/*                                   Json                                     */
/* -------------------------------------------------------------------------- */
/*
  Generic JSON type used by Supabase codegen.
  Represents any JSON-serializable structure.
*/
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/* -------------------------------------------------------------------------- */
/*                                 Database                                   */
/* -------------------------------------------------------------------------- */
/*
  Root database schema type.

  It includes:
  - __InternalSupabase: internal metadata (PostgREST version)
  - public: your actual schema (tables, views, functions, enums, types)
*/
export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };

  public: {
    /* ------------------------------- Tables ------------------------------- */
    Tables: {
      /* ---------------------------- daily_pokemon -------------------------- */
      /*
        daily_pokemon:
        - Defines which Pokémon is active for a given day.
        - available_on is the date key.
      */
      daily_pokemon: {
        Row: {
          available_on: string; // Date string (YYYY-MM-DD)
          id: string; // Primary key
          pokemon_name: string; // Correct Pokémon name for that day
        };

        Insert: {
          available_on: string; // Required on insert
          id?: string; // Optional if DB generates it
          pokemon_name: string; // Required on insert
        };

        Update: {
          available_on?: string; // Optional on update
          id?: string; // Optional on update
          pokemon_name?: string; // Optional on update
        };

        Relationships: []; // No foreign keys defined for this table
      };

      /* -------------------------------- games ----------------------------- */
      /*
        games:
        - Represents one user's play session for a specific daily_pokemon row.
        - Links to daily_pokemon via daily_pokemon_id.
        - Links to user via user_id.
      */
      games: {
        Row: {
          created_at: string | null; // Timestamp (nullable)
          daily_pokemon_id: string; // FK -> daily_pokemon.id
          id: string; // Primary key
          is_finished: boolean | null; // Whether game is finished
          user_id: string; // User id (auth.users)
          won: boolean | null; // Win/loss (true/false/null)
        };

        Insert: {
          created_at?: string | null; // Optional (DB can set)
          daily_pokemon_id: string; // Required
          id?: string; // Optional if DB generates it
          is_finished?: boolean | null; // Optional
          user_id: string; // Required
          won?: boolean | null; // Optional
        };

        Update: {
          created_at?: string | null; // Optional
          daily_pokemon_id?: string; // Optional
          id?: string; // Optional
          is_finished?: boolean | null; // Optional
          user_id?: string; // Optional
          won?: boolean | null; // Optional
        };

        Relationships: [
          {
            foreignKeyName: "games_daily_pokemon_id_fkey"; // FK constraint name
            columns: ["daily_pokemon_id"]; // Local column(s)
            isOneToOne: false; // One daily_pokemon row can have many games
            referencedRelation: "daily_pokemon"; // Referenced table
            referencedColumns: ["id"]; // Referenced column(s)
          },
        ];
      };

      /* ------------------------------- guesses ----------------------------- */
      /*
        guesses:
        - Represents a single guess/attempt in a game.
        - Links to games via game_id.
        - Stores attempt_number and the guess name.
      */
      guesses: {
        Row: {
          attempt_number: number; // Attempt index (1..MAX_ATTEMPTS)
          created_at: string | null; // Timestamp (nullable)
          game_id: string; // FK -> games.id
          guess_name: string; // Name guessed by user
          id: string; // Primary key
          user_id: string; // User id (duplicate for filtering convenience)
        };

        Insert: {
          attempt_number: number; // Required on insert
          created_at?: string | null; // Optional (DB can set)
          game_id: string; // Required
          guess_name: string; // Required
          id?: string; // Optional if DB generates it
          user_id: string; // Required
        };

        Update: {
          attempt_number?: number; // Optional on update
          created_at?: string | null; // Optional
          game_id?: string; // Optional
          guess_name?: string; // Optional
          id?: string; // Optional
          user_id?: string; // Optional
        };

        Relationships: [
          {
            foreignKeyName: "guesses_game_id_fkey"; // FK constraint name
            columns: ["game_id"]; // Local column(s)
            isOneToOne: false; // One game row can have many guesses
            referencedRelation: "games"; // Referenced table
            referencedColumns: ["id"]; // Referenced column(s)
          },
        ];
      };

      /* ------------------------------ profiles ----------------------------- */
      /*
        profiles:
        - Stores additional user info not in auth.users.
        - Used for:
          - username-based login lookup
          - admin flag
          - storing normalized email/username
      */
      profiles: {
        Row: {
          admin: boolean; // Admin flag
          email: string; // User email (normalized)
          id: string; // User id (matches auth.users.id)
          username: string; // Username (normalized)
        };

        Insert: {
          admin?: boolean; // Optional if default exists
          email: string; // Required
          id: string; // Required
          username: string; // Required
        };

        Update: {
          admin?: boolean; // Optional
          email?: string; // Optional
          id?: string; // Optional
          username?: string; // Optional
        };

        Relationships: []; // No explicit FK listed here
      };
    };

    /* -------------------------------- Views ------------------------------- */
    Views: {
      // No views defined
      [_ in never]: never;
    };

    /* ------------------------------ Functions ------------------------------ */
    Functions: {
      // No SQL functions defined
      [_ in never]: never;
    };

    /* -------------------------------- Enums ------------------------------- */
    Enums: {
      // No enums defined
      [_ in never]: never;
    };

    /* --------------------------- Composite Types --------------------------- */
    CompositeTypes: {
      // No composite types defined
      [_ in never]: never;
    };
  };
};

/* -------------------------------------------------------------------------- */
/*                    Helper Types (Generated Convenience)                    */
/* -------------------------------------------------------------------------- */

// Remove __InternalSupabase from Database for helper type usage
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

// Default schema is the "public" schema
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

/* -------------------------------------------------------------------------- */
/*                                   Tables                                   */
/* -------------------------------------------------------------------------- */
/*
  Tables<"table_name"> returns the Row type of that table.

  Examples:
  - Tables<"games"> gives Database["public"]["Tables"]["games"]["Row"]
  - Tables<{schema: "public"}, "guesses"> gives Row type for guesses
*/
export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

/* -------------------------------------------------------------------------- */
/*                                TablesInsert                                */
/* -------------------------------------------------------------------------- */
/*
  TablesInsert<"table_name"> returns the Insert type for that table.
*/
export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

/* -------------------------------------------------------------------------- */
/*                                TablesUpdate                                */
/* -------------------------------------------------------------------------- */
/*
  TablesUpdate<"table_name"> returns the Update type for that table.
*/
export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

/* -------------------------------------------------------------------------- */
/*                                   Enums                                    */
/* -------------------------------------------------------------------------- */
/*
  Enums<"enum_name"> returns the enum type for that enum.
*/
export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

/* -------------------------------------------------------------------------- */
/*                               CompositeTypes                               */
/* -------------------------------------------------------------------------- */
/*
  CompositeTypes<"type_name"> returns the composite type for that type.
*/
export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

/* -------------------------------------------------------------------------- */
/*                                 Constants                                  */
/* -------------------------------------------------------------------------- */
/*
  Supabase-generated constants container.
  Enums are currently empty.
*/
export const Constants = {
  public: {
    Enums: {},
  },
} as const;
