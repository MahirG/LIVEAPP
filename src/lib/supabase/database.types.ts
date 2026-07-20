export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          bio: string;
          avatar_path: string | null;
          locale: string;
          is_creator: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          bio?: string;
          avatar_path?: string | null;
          locale?: string;
          is_creator?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      streams: {
        Row: {
          id: string;
          creator_id: string;
          slug: string;
          title: string;
          topic: string;
          language: string;
          status: Database["public"]["Enums"]["stream_status"];
          visibility: Database["public"]["Enums"]["stream_visibility"];
          provider: string;
          provider_room_id: string | null;
          scheduled_for: string | null;
          started_at: string | null;
          ended_at: string | null;
          last_heartbeat_at: string | null;
          viewer_count: number;
          peak_viewer_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          slug: string;
          title: string;
          topic: string;
          language?: string;
          status?: Database["public"]["Enums"]["stream_status"];
          visibility?: Database["public"]["Enums"]["stream_visibility"];
          provider?: string;
          provider_room_id?: string | null;
          scheduled_for?: string | null;
          started_at?: string | null;
          ended_at?: string | null;
          last_heartbeat_at?: string | null;
          viewer_count?: number;
          peak_viewer_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["streams"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "streams_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      follows: {
        Row: { follower_id: string; creator_id: string; created_at: string };
        Insert: { follower_id: string; creator_id: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: number;
          stream_id: string;
          author_id: string;
          body: string;
          moderation_state: Database["public"]["Enums"]["message_moderation_state"];
          reply_to_id: number | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          stream_id: string;
          author_id: string;
          body: string;
          moderation_state?: Database["public"]["Enums"]["message_moderation_state"];
          reply_to_id?: number | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "chat_messages_stream_id_fkey";
            columns: ["stream_id"];
            isOneToOne: false;
            referencedRelation: "streams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_messages_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      stream_reports: {
        Row: {
          id: number;
          reporter_id: string;
          stream_id: string;
          message_id: number | null;
          reason: string;
          details: string;
          created_at: string;
        };
        Insert: {
          id?: never;
          reporter_id: string;
          stream_id: string;
          message_id?: number | null;
          reason: string;
          details?: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      stream_status: "scheduled" | "preflight" | "live" | "ended" | "cancelled";
      stream_visibility: "public" | "followers" | "unlisted";
      message_moderation_state: "visible" | "held" | "removed";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type StreamRow = Database["public"]["Tables"]["streams"]["Row"];
export type ChatMessageRow = Database["public"]["Tables"]["chat_messages"]["Row"];
