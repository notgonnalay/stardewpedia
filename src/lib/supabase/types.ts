export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Season = 'spring' | 'summer' | 'fall' | 'winter'
export type Quality = 'normal' | 'silver' | 'gold' | 'iridium'
export type Weather = 'sunny' | 'rain' | 'storm' | 'wind' | 'snow' | 'green_rain'
export type GiftTaste = 'love' | 'like' | 'neutral' | 'dislike' | 'hate'
export type ContentStatus = 'draft' | 'published' | 'archived'
export type FishBehavior = 'mixed' | 'dart' | 'smooth' | 'sinker' | 'floater'
export type RecipeKind = 'cooking' | 'crafting'
export type QuestType = 'story' | 'special_order' | 'help_wanted' | 'mail' | 'daily' | 'other'
export type ItemSourceType = 'shop' | 'drop' | 'forage' | 'fishing' | 'farming' | 'crafting' | 'processing' | 'gift' | 'quest' | 'event' | 'mining' | 'artifact_spot' | 'other'
export type EntityType =
  | 'item' | 'crop' | 'fruit_tree' | 'fish' | 'villager' | 'heart_event'
  | 'recipe' | 'bundle' | 'location' | 'vendor' | 'festival' | 'achievement'
  | 'monster' | 'eradication_goal' | 'quest' | 'random_event' | 'skill'
  | 'profession' | 'animal' | 'machine' | 'guide' | 'farm_plan'

export type UserRole = 'user' | 'editor' | 'admin'
export type ThemePref = 'system' | 'light' | 'dark'
export type Platform = 'web' | 'ios' | 'android'
export type CollectionType = 'shipped' | 'caught' | 'cooked' | 'crafted' | 'donated' | 'found'
export type RelationshipStatus = 'none' | 'friend' | 'dating' | 'engaged' | 'married' | 'roommate'
export type QuestState = 'available' | 'active' | 'completed' | 'skipped'
export type FeedbackKind = 'mistake' | 'suggestion' | 'other'
export type FeedbackStatus = 'open' | 'triaged' | 'fixed' | 'rejected'

export interface Database {
  game: {
    Tables: {
      game_versions: {
        Row: {
          id: string
          released_on: string | null
          is_current: boolean
          notes: string | null
        }
        Insert: {
          id: string
          released_on?: string | null
          is_current?: boolean
          notes?: string | null
        }
        Update: {
          id?: string
          released_on?: string | null
          is_current?: boolean
          notes?: string | null
        }
      }
      items: {
        Row: {
          id: string
          game_id: string | null
          name: string
          description: string | null
          category_id: string | null
          sell_price: number | null
          edibility: number | null
          energy_restored: number | null
          health_restored: number | null
          quality_applies: boolean
          museum_section: 'artifact' | 'mineral' | null
          sprite_asset_id: string | null
          status: ContentStatus
          introduced_in: string | null
          verified_in: string | null
          verified_on: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['game']['Tables']['items']['Row']> & { id: string; name: string }
        Update: Partial<Database['game']['Tables']['items']['Row']>
      }
      crops: {
        Row: {
          id: string
          produce_item_id: string
          seed_item_id: string
          growth_days: number
          stage_days: number[] | null
          regrow_days: number | null
          is_trellis: boolean
          can_be_giant: boolean
          indoors_only: boolean
          harvest_xp: number | null
          notes: string | null
          status: ContentStatus
          introduced_in: string | null
          verified_in: string | null
          verified_on: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['game']['Tables']['crops']['Row']> & {
          id: string
          produce_item_id: string
          seed_item_id: string
          growth_days: number
        }
        Update: Partial<Database['game']['Tables']['crops']['Row']>
      }
      crop_seasons: {
        Row: {
          crop_id: string
          season: Season
        }
        Insert: { crop_id: string; season: Season }
        Update: { crop_id?: string; season?: Season }
      }
      villagers: {
        Row: {
          id: string
          name: string
          birthday_season: Season | null
          birthday_day: number | null
          home_location_id: string | null
          address: string | null
          family: string | null
          bio: string | null
          is_marriageable: boolean
          is_secret: boolean
          unlock_condition: string | null
          portrait_asset_id: string | null
          status: ContentStatus
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['game']['Tables']['villagers']['Row']> & { id: string; name: string }
        Update: Partial<Database['game']['Tables']['villagers']['Row']>
      }
      fish: {
        Row: {
          item_id: string
          difficulty: number | null
          behavior: FishBehavior | null
          min_size_in: number | null
          max_size_in: number | null
          is_legendary: boolean
          is_crab_pot: boolean
          crab_pot_area: string | null
          status: ContentStatus
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['game']['Tables']['fish']['Row']> & { item_id: string }
        Update: Partial<Database['game']['Tables']['fish']['Row']>
      }
    }
  }
  app: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          role: UserRole
          theme: ThemePref
          locale: string
          marketing_opt_in: boolean
          preferences: Json
          last_seen_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id: string
          display_name?: string | null
          role?: UserRole
          theme?: ThemePref
          locale?: string
          marketing_opt_in?: boolean
          preferences?: Json
        }
        Update: Partial<Database['app']['Tables']['profiles']['Row']>
      }
      farms: {
        Row: {
          id: string
          user_id: string
          name: string
          farm_type_id: string | null
          game_version_id: string | null
          platform: string | null
          current_season: Season | null
          current_day: number | null
          current_year: number | null
          is_primary: boolean
          revision: number
          created_at: string
          updated_at: string
          archived_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          farm_type_id?: string | null
          is_primary?: boolean
        }
        Update: Partial<Database['app']['Tables']['farms']['Row']>
      }
      favorites: {
        Row: {
          user_id: string
          entity_type: EntityType
          entity_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          entity_type: EntityType
          entity_id: string
          created_at?: string
        }
        Update: Partial<Database['app']['Tables']['favorites']['Row']>
      }
      farm_plans: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          farm_type_id: string | null
          game_version_id: string | null
          layout: Json
          is_public: boolean
          share_slug: string | null
          thumbnail_asset_id: string | null
          view_count: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          layout: Json
          description?: string | null
          is_public?: boolean
        }
        Update: Partial<Database['app']['Tables']['farm_plans']['Row']>
      }
    }
  }
}
