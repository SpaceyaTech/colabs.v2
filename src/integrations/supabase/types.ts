export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.2.12 (cd3cf9e)';
  };
  public: {
    Tables: {
      claimed_issues: {
        Row: {
          assignee_avatar: string;
          assignee_name: string;
          category: string | null;
          claimed_at: string;
          comments: number;
          created_at: string;
          description: string;
          html_url: string | null;
          id: string;
          is_good_first_issue: boolean;
          issue_id: string;
          labels: string[];
          priority: string;
          repo_full_name: string;
          repo_name: string;
          repo_owner: string;
          status: string;
          title: string;
          user_id: string;
        };
        Insert: {
          assignee_avatar?: string;
          assignee_name?: string;
          category?: string | null;
          claimed_at?: string;
          comments?: number;
          created_at?: string;
          description?: string;
          html_url?: string | null;
          id?: string;
          is_good_first_issue?: boolean;
          issue_id: string;
          labels?: string[];
          priority?: string;
          repo_full_name?: string;
          repo_name: string;
          repo_owner: string;
          status?: string;
          title: string;
          user_id: string;
        };
        Update: {
          assignee_avatar?: string;
          assignee_name?: string;
          category?: string | null;
          claimed_at?: string;
          comments?: number;
          created_at?: string;
          description?: string;
          html_url?: string | null;
          id?: string;
          is_good_first_issue?: boolean;
          issue_id?: string;
          labels?: string[];
          priority?: string;
          repo_full_name?: string;
          repo_name?: string;
          repo_owner?: string;
          status?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      collaboration_requests: {
        Row: {
          created_at: string;
          experience_level: string | null;
          id: string;
          message: string | null;
          owner_id: string;
          repository_id: string;
          request_type: string;
          requester_id: string;
          responded_at: string | null;
          skills: string[] | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          experience_level?: string | null;
          id?: string;
          message?: string | null;
          owner_id: string;
          repository_id: string;
          request_type?: string;
          requester_id: string;
          responded_at?: string | null;
          skills?: string[] | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          experience_level?: string | null;
          id?: string;
          message?: string | null;
          owner_id?: string;
          repository_id?: string;
          request_type?: string;
          requester_id?: string;
          responded_at?: string | null;
          skills?: string[] | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_collaboration_requests_repository';
            columns: ['repository_id'];
            isOneToOne: false;
            referencedRelation: 'github_repositories';
            referencedColumns: ['id'];
          },
        ];
      };
      gigs: {
        Row: {
          budget: string;
          budget_value: number;
          category: string | null;
          client_hire_rate: number | null;
          client_member_since: string | null;
          client_open_jobs: number | null;
          client_total_spent: string | null;
          company: string;
          company_logo: string | null;
          company_rating: number | null;
          company_review_count: number | null;
          company_verified: boolean;
          created_at: string;
          creator_id: string;
          deliverables: string[];
          description: string;
          difficulty: string;
          duration: string;
          featured: boolean;
          full_description: string;
          id: string;
          is_urgent: boolean;
          location: string;
          proposals_count: number;
          requirements: string[];
          status: string;
          technologies: string[];
          title: string;
          updated_at: string;
        };
        Insert: {
          budget?: string;
          budget_value?: number;
          category?: string | null;
          client_hire_rate?: number | null;
          client_member_since?: string | null;
          client_open_jobs?: number | null;
          client_total_spent?: string | null;
          company?: string;
          company_logo?: string | null;
          company_rating?: number | null;
          company_review_count?: number | null;
          company_verified?: boolean;
          created_at?: string;
          creator_id: string;
          deliverables?: string[];
          description?: string;
          difficulty?: string;
          duration?: string;
          featured?: boolean;
          full_description?: string;
          id?: string;
          is_urgent?: boolean;
          location?: string;
          proposals_count?: number;
          requirements?: string[];
          status?: string;
          technologies?: string[];
          title: string;
          updated_at?: string;
        };
        Update: {
          budget?: string;
          budget_value?: number;
          category?: string | null;
          client_hire_rate?: number | null;
          client_member_since?: string | null;
          client_open_jobs?: number | null;
          client_total_spent?: string | null;
          company?: string;
          company_logo?: string | null;
          company_rating?: number | null;
          company_review_count?: number | null;
          company_verified?: boolean;
          created_at?: string;
          creator_id?: string;
          deliverables?: string[];
          description?: string;
          difficulty?: string;
          duration?: string;
          featured?: boolean;
          full_description?: string;
          id?: string;
          is_urgent?: boolean;
          location?: string;
          proposals_count?: number;
          requirements?: string[];
          status?: string;
          technologies?: string[];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      github_integrations: {
        Row: {
          access_token: string;
          avatar_url: string | null;
          connected_at: string;
          github_user_id: number;
          github_username: string;
          id: string;
          is_active: boolean;
          refresh_token: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          access_token: string;
          avatar_url?: string | null;
          connected_at?: string;
          github_user_id: number;
          github_username: string;
          id?: string;
          is_active?: boolean;
          refresh_token?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          access_token?: string;
          avatar_url?: string | null;
          connected_at?: string;
          github_user_id?: number;
          github_username?: string;
          id?: string;
          is_active?: boolean;
          refresh_token?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      github_repositories: {
        Row: {
          allow_collaboration: boolean;
          clone_url: string;
          collaboration_type: string | null;
          created_at: string;
          default_branch: string;
          description: string | null;
          experience_level: string | null;
          forks_count: number;
          full_name: string;
          github_repo_id: number;
          html_url: string;
          id: string;
          integration_id: string;
          is_fork: boolean;
          is_private: boolean;
          is_template: boolean;
          language: string | null;
          name: string;
          stars_count: number;
          synced_at: string;
          topics: string[] | null;
          updated_at: string;
          visibility: string;
        };
        Insert: {
          allow_collaboration?: boolean;
          clone_url: string;
          collaboration_type?: string | null;
          created_at?: string;
          default_branch?: string;
          description?: string | null;
          experience_level?: string | null;
          forks_count?: number;
          full_name: string;
          github_repo_id: number;
          html_url: string;
          id?: string;
          integration_id: string;
          is_fork?: boolean;
          is_private?: boolean;
          is_template?: boolean;
          language?: string | null;
          name: string;
          stars_count?: number;
          synced_at?: string;
          topics?: string[] | null;
          updated_at?: string;
          visibility?: string;
        };
        Update: {
          allow_collaboration?: boolean;
          clone_url?: string;
          collaboration_type?: string | null;
          created_at?: string;
          default_branch?: string;
          description?: string | null;
          experience_level?: string | null;
          forks_count?: number;
          full_name?: string;
          github_repo_id?: number;
          html_url?: string;
          id?: string;
          integration_id?: string;
          is_fork?: boolean;
          is_private?: boolean;
          is_template?: boolean;
          language?: string | null;
          name?: string;
          stars_count?: number;
          synced_at?: string;
          topics?: string[] | null;
          updated_at?: string;
          visibility?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_github_repositories_integration';
            columns: ['integration_id'];
            isOneToOne: false;
            referencedRelation: 'github_integrations';
            referencedColumns: ['id'];
          },
        ];
      };
      organization_integrations: {
        Row: {
          config: Json;
          connected_at: string;
          connected_by: string;
          id: string;
          integration_name: string;
          integration_type: string;
          is_active: boolean;
          organization_id: string;
          updated_at: string;
        };
        Insert: {
          config?: Json;
          connected_at?: string;
          connected_by: string;
          id?: string;
          integration_name: string;
          integration_type: string;
          is_active?: boolean;
          organization_id: string;
          updated_at?: string;
        };
        Update: {
          config?: Json;
          connected_at?: string;
          connected_by?: string;
          id?: string;
          integration_name?: string;
          integration_type?: string;
          is_active?: boolean;
          organization_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organization_integrations_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      organization_members: {
        Row: {
          id: string;
          joined_at: string;
          organization_id: string;
          role: Database['public']['Enums']['org_role'];
          user_id: string;
        };
        Insert: {
          id?: string;
          joined_at?: string;
          organization_id: string;
          role?: Database['public']['Enums']['org_role'];
          user_id: string;
        };
        Update: {
          id?: string;
          joined_at?: string;
          organization_id?: string;
          role?: Database['public']['Enums']['org_role'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organization_members_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      organization_workflows: {
        Row: {
          actions: Json;
          created_at: string;
          created_by: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          organization_id: string;
          trigger_config: Json;
          trigger_type: string;
          updated_at: string;
        };
        Insert: {
          actions?: Json;
          created_at?: string;
          created_by: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          organization_id: string;
          trigger_config?: Json;
          trigger_type: string;
          updated_at?: string;
        };
        Update: {
          actions?: Json;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          organization_id?: string;
          trigger_config?: Json;
          trigger_type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organization_workflows_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      organizations: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          slug: string;
          updated_at: string;
          website_url: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          slug: string;
          updated_at?: string;
          website_url?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          updated_at?: string;
          website_url?: string | null;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          allow_applications: boolean;
          budget: string | null;
          category: string | null;
          compensation_type: string | null;
          created_at: string;
          creator_id: string;
          currency: string | null;
          description: string;
          duration: string;
          experience_level: string;
          external_links: Json | null;
          github_repo_url: string | null;
          id: string;
          industry: string | null;
          invite_emails: string[] | null;
          is_paid: boolean;
          launch_readiness: string | null;
          logo_url: string | null;
          name: string;
          project_type: string;
          requires_approval: boolean;
          status: string;
          team_size: string;
          technologies: string[];
          updated_at: string;
          visibility: string;
        };
        Insert: {
          allow_applications?: boolean;
          budget?: string | null;
          category?: string | null;
          compensation_type?: string | null;
          created_at?: string;
          creator_id: string;
          currency?: string | null;
          description: string;
          duration?: string;
          experience_level?: string;
          external_links?: Json | null;
          github_repo_url?: string | null;
          id?: string;
          industry?: string | null;
          invite_emails?: string[] | null;
          is_paid?: boolean;
          launch_readiness?: string | null;
          logo_url?: string | null;
          name: string;
          project_type: string;
          requires_approval?: boolean;
          status?: string;
          team_size?: string;
          technologies?: string[];
          updated_at?: string;
          visibility: string;
        };
        Update: {
          allow_applications?: boolean;
          budget?: string | null;
          category?: string | null;
          compensation_type?: string | null;
          created_at?: string;
          creator_id?: string;
          currency?: string | null;
          description?: string;
          duration?: string;
          experience_level?: string;
          external_links?: Json | null;
          github_repo_url?: string | null;
          id?: string;
          industry?: string | null;
          invite_emails?: string[] | null;
          is_paid?: boolean;
          launch_readiness?: string | null;
          logo_url?: string | null;
          name?: string;
          project_type?: string;
          requires_approval?: boolean;
          status?: string;
          team_size?: string;
          technologies?: string[];
          updated_at?: string;
          visibility?: string;
        };
        Relationships: [];
      };
      proposal_milestones: {
        Row: {
          amount: number;
          created_at: string;
          duration: string;
          id: string;
          order_index: number;
          proposal_id: string;
          title: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          duration: string;
          id?: string;
          order_index?: number;
          proposal_id: string;
          title: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          duration?: string;
          id?: string;
          order_index?: number;
          proposal_id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'proposal_milestones_proposal_id_fkey';
            columns: ['proposal_id'];
            isOneToOne: false;
            referencedRelation: 'proposals';
            referencedColumns: ['id'];
          },
        ];
      };
      proposals: {
        Row: {
          cover_letter: string | null;
          created_at: string;
          github_url: string;
          id: string;
          payment_type: string;
          portfolio_url: string;
          project_id: string;
          resume_path: string;
          status: string;
          total_amount: number | null;
          total_duration: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cover_letter?: string | null;
          created_at?: string;
          github_url: string;
          id?: string;
          payment_type: string;
          portfolio_url: string;
          project_id: string;
          resume_path: string;
          status?: string;
          total_amount?: number | null;
          total_duration?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cover_letter?: string | null;
          created_at?: string;
          github_url?: string;
          id?: string;
          payment_type?: string;
          portfolio_url?: string;
          project_id?: string;
          resume_path?: string;
          status?: string;
          total_amount?: number | null;
          total_duration?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      saved_jobs: {
        Row: {
          created_at: string;
          id: string;
          project_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          project_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          project_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          email: string;
          id: string;
          joined_at: string;
          role: string;
          status: string;
          team_id: string;
          user_id: string | null;
        };
        Insert: {
          email: string;
          id?: string;
          joined_at?: string;
          role?: string;
          status?: string;
          team_id: string;
          user_id?: string | null;
        };
        Update: {
          email?: string;
          id?: string;
          joined_at?: string;
          role?: string;
          status?: string;
          team_id?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'team_members_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      team_projects: {
        Row: {
          added_at: string;
          id: string;
          project_id: string;
          team_id: string;
        };
        Insert: {
          added_at?: string;
          id?: string;
          project_id: string;
          team_id: string;
        };
        Update: {
          added_at?: string;
          id?: string;
          project_id?: string;
          team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'team_projects_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'team_projects_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      teams: {
        Row: {
          created_at: string;
          created_by: string;
          description: string | null;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          description?: string | null;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          description?: string | null;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_subscriptions: {
        Row: {
          cancelled_at: string | null;
          created_at: string;
          expires_at: string | null;
          id: string;
          plan: string;
          started_at: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cancelled_at?: string | null;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          plan?: string;
          started_at?: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cancelled_at?: string | null;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          plan?: string;
          started_at?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_and_demote_subscription: {
        Args: { _user_id: string };
        Returns: {
          cancelled_at: string | null;
          created_at: string;
          expires_at: string | null;
          id: string;
          plan: string;
          started_at: string;
          status: string;
          updated_at: string;
          user_id: string;
        }[];
        SetofOptions: {
          from: '*';
          to: 'user_subscriptions';
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      get_user_org_role: {
        Args: { _org_id: string; _user_id: string };
        Returns: Database['public']['Enums']['org_role'];
      };
      is_organization_member: {
        Args: { _org_id: string; _user_id: string };
        Returns: boolean;
      };
      is_team_member: {
        Args: { _team_id: string; _user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      org_role: 'owner' | 'admin' | 'member';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      org_role: ['owner', 'admin', 'member'],
    },
  },
} as const;
