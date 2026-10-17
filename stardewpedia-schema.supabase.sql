-- =====================================================================
-- Stardewpedia database schema (Supabase edition)
-- Target: Supabase (PostgreSQL 15+) with Supabase Auth, Row Level Security and Storage
-- Schemas: game = reference/content data, app = profiles, farms, progress, private = helpers
-- Status: written to be run top to bottom in one transaction.
--         NOT yet executed against a live database. Run it on an empty
--         dev branch first and fix anything the server rejects.
-- =====================================================================
BEGIN;

CREATE EXTENSION IF NOT EXISTS citext  WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

CREATE SCHEMA IF NOT EXISTS game;
CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS private;   -- helper functions, never exposed through the Data API
COMMENT ON SCHEMA game IS 'Game reference data and editorial content. Source of truth is packages/data in Git; this schema is loaded from it.';
COMMENT ON SCHEMA app  IS 'Profiles (linked to auth.users), farms (save profiles), player progress, plans and operations.';
COMMENT ON SCHEMA private IS 'Security-definer helpers and trigger functions. Do not add this schema to the exposed schemas.';

-- ---------------------------------------------------------------------
-- 0. Shared types
-- ---------------------------------------------------------------------
CREATE DOMAIN game.slug         AS text     CHECK (VALUE ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
CREATE DOMAIN game.day_of_month AS smallint CHECK (VALUE BETWEEN 1 AND 28);
CREATE DOMAIN game.game_time    AS smallint CHECK (VALUE BETWEEN 600 AND 2600);  -- 600 = 6:00 AM, 2600 = 2:00 AM next day

CREATE TYPE game.season         AS ENUM ('spring','summer','fall','winter');
CREATE TYPE game.quality        AS ENUM ('normal','silver','gold','iridium');
CREATE TYPE game.weather        AS ENUM ('sunny','rain','storm','wind','snow','green_rain');
CREATE TYPE game.gift_taste     AS ENUM ('love','like','neutral','dislike','hate');
CREATE TYPE game.content_status AS ENUM ('draft','published','archived');
CREATE TYPE game.fish_behavior  AS ENUM ('mixed','dart','smooth','sinker','floater');
CREATE TYPE game.recipe_kind    AS ENUM ('cooking','crafting');
CREATE TYPE game.quest_type     AS ENUM ('story','special_order','help_wanted','mail','daily','other');
CREATE TYPE game.item_source_type AS ENUM ('shop','drop','forage','fishing','farming','crafting','processing','gift','quest','event','mining','artifact_spot','other');
CREATE TYPE game.entity_type    AS ENUM (
  'item','crop','fruit_tree','fish','villager','heart_event','recipe','bundle','location','vendor',
  'festival','achievement','monster','eradication_goal','quest','random_event','skill','profession',
  'animal','machine','guide','farm_plan');

CREATE TYPE app.user_role           AS ENUM ('user','editor','admin');
CREATE TYPE app.theme_pref          AS ENUM ('system','light','dark');
CREATE TYPE app.platform            AS ENUM ('web','ios','android');
CREATE TYPE app.collection_type     AS ENUM ('shipped','caught','cooked','crafted','donated','found');
CREATE TYPE app.relationship_status AS ENUM ('none','friend','dating','engaged','married','roommate');
CREATE TYPE app.quest_state         AS ENUM ('available','active','completed','skipped');
CREATE TYPE app.feedback_kind       AS ENUM ('mistake','suggestion','other');
CREATE TYPE app.feedback_status     AS ENUM ('open','triaged','fixed','rejected');
CREATE TYPE app.subscription_status AS ENUM ('pending','confirmed','unsubscribed');

CREATE FUNCTION private.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- ---------------------------------------------------------------------
-- 1. Identity: Supabase Auth owns credentials, sessions, OAuth and refresh tokens (auth schema).
--    app.profiles is the app-side row for every auth user.
-- ---------------------------------------------------------------------
CREATE TABLE app.profiles (
  id               uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name     text,
  role             app.user_role NOT NULL DEFAULT 'user',
  theme            app.theme_pref NOT NULL DEFAULT 'system',
  locale           text NOT NULL DEFAULT 'en',
  marketing_opt_in boolean NOT NULL DEFAULT false,
  preferences      jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_seen_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz
);

-- Create a profile automatically whenever someone signs up
CREATE FUNCTION private.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO app.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'));
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

-- Editors and admins are identified from app.profiles.role
CREATE FUNCTION private.is_editor() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM app.profiles p
                 WHERE p.id = (SELECT auth.uid()) AND p.role IN ('editor','admin'));
$$;
REVOKE ALL ON FUNCTION private.is_editor() FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_editor() TO authenticated;

-- Native/mobile clients: push tokens (login tokens are handled by Supabase Auth)
CREATE TABLE app.devices (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES app.profiles(id) ON DELETE CASCADE,
  platform     app.platform NOT NULL,
  push_token   text,
  app_version  text,
  last_seen_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX devices_user_idx ON app.devices (user_id);
CREATE UNIQUE INDEX devices_push_token_uidx ON app.devices (push_token) WHERE push_token IS NOT NULL;

-- ---------------------------------------------------------------------
-- 2. Reference and cross-cutting game tables
-- ---------------------------------------------------------------------
CREATE TABLE game.game_versions (
  id          text PRIMARY KEY,                       -- e.g. '1.6.15'
  released_on date,
  is_current  boolean NOT NULL DEFAULT false,
  notes       text
);
CREATE UNIQUE INDEX game_versions_one_current_uidx ON game.game_versions (is_current) WHERE is_current;

CREATE TABLE game.locales (
  code       text PRIMARY KEY,                        -- BCP-47, e.g. 'en', 'es-MX'
  name       text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT false
);

CREATE TABLE game.sources (
  id      game.slug PRIMARY KEY,
  title   text NOT NULL,
  url     text,
  license text,
  notes   text
);

CREATE TABLE game.media_assets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_key text NOT NULL UNIQUE,                   -- Vercel Blob key or repo path
  url         text NOT NULL,
  mime_type   text NOT NULL,
  width       integer,
  height      integer,
  alt_text    text,
  credit      text,
  license     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE game.entity_media (
  entity_type game.entity_type NOT NULL,
  entity_id   text NOT NULL,
  asset_id    uuid NOT NULL REFERENCES game.media_assets(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'image',          -- sprite, portrait, screenshot, map
  sort_order  smallint NOT NULL DEFAULT 0,
  PRIMARY KEY (entity_type, entity_id, asset_id, role)
);

CREATE TABLE game.translations (
  entity_type game.entity_type NOT NULL,
  entity_id   text NOT NULL,
  locale      text NOT NULL REFERENCES game.locales(code),
  field       text NOT NULL,                          -- 'name', 'description', ...
  value       text NOT NULL,
  PRIMARY KEY (entity_type, entity_id, locale, field)
);

CREATE TABLE game.entity_aliases (
  entity_type game.entity_type NOT NULL,
  entity_id   text NOT NULL,
  alias       text NOT NULL,
  locale      text NOT NULL DEFAULT 'en' REFERENCES game.locales(code),
  PRIMARY KEY (entity_type, entity_id, alias, locale)
);
CREATE INDEX entity_aliases_trgm_idx ON game.entity_aliases USING gin (alias extensions.gin_trgm_ops);

CREATE TABLE game.entity_sources (
  entity_type game.entity_type NOT NULL,
  entity_id   text NOT NULL,
  source_id   game.slug NOT NULL REFERENCES game.sources(id),
  PRIMARY KEY (entity_type, entity_id, source_id)
);

CREATE TABLE game.content_changes (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  entity_type     game.entity_type NOT NULL,
  entity_id       text NOT NULL,
  game_version_id text REFERENCES game.game_versions(id),
  change_type     text NOT NULL CHECK (change_type IN ('added','changed','removed')),
  summary         text,
  diff            jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX content_changes_entity_idx ON game.content_changes (entity_type, entity_id, created_at DESC);

-- ---------------------------------------------------------------------
-- 3. Items (master registry) and where things are
-- ---------------------------------------------------------------------
CREATE TABLE game.item_categories (
  id         game.slug PRIMARY KEY,
  name       text NOT NULL,
  parent_id  game.slug REFERENCES game.item_categories(id),
  sort_order smallint NOT NULL DEFAULT 0
);

CREATE TABLE game.items (
  id              game.slug PRIMARY KEY,
  game_id         text UNIQUE,                        -- qualified in-game id e.g. '(O)24'; used by the save-file importer
  name            text NOT NULL,
  description     text,
  category_id     game.slug REFERENCES game.item_categories(id),
  sell_price      integer CHECK (sell_price >= 0),    -- NULL = cannot be sold. Quality prices are computed, not stored.
  edibility       smallint,
  energy_restored integer,
  health_restored integer,
  quality_applies boolean NOT NULL DEFAULT false,
  museum_section  text CHECK (museum_section IN ('artifact','mineral')),
  sprite_asset_id uuid REFERENCES game.media_assets(id),
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX items_category_idx ON game.items (category_id);
CREATE INDEX items_name_trgm_idx ON game.items USING gin (name extensions.gin_trgm_ops);

CREATE TABLE game.item_buffs (
  item_id          game.slug NOT NULL REFERENCES game.items(id) ON DELETE CASCADE,
  stat             text NOT NULL CHECK (stat IN ('farming','fishing','mining','foraging','luck','attack','defense','speed','magnetism','max_energy')),
  amount           smallint NOT NULL,
  duration_minutes smallint,
  PRIMARY KEY (item_id, stat)
);

-- ---------------------------------------------------------------------
-- 4. World: locations, villagers, vendors, skills
-- ---------------------------------------------------------------------
CREATE TABLE game.locations (
  id               game.slug PRIMARY KEY,
  name             text NOT NULL,
  parent_id        game.slug REFERENCES game.locations(id),
  kind             text NOT NULL CHECK (kind IN ('region','town','farm','building','mine','cave','water','island','special')),
  description      text,
  unlock_condition text,
  map_asset_id     uuid REFERENCES game.media_assets(id),
  sort_order       smallint NOT NULL DEFAULT 0,
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX locations_parent_idx ON game.locations (parent_id);

CREATE TABLE game.skills (
  id          game.slug PRIMARY KEY,
  name        text NOT NULL,
  description text,
  sort_order  smallint NOT NULL DEFAULT 0
);
CREATE TABLE game.skill_levels (
  skill_id    game.slug NOT NULL REFERENCES game.skills(id) ON DELETE CASCADE,
  level       smallint NOT NULL CHECK (level BETWEEN 1 AND 10),
  xp_required integer,
  description text,
  PRIMARY KEY (skill_id, level)
);
CREATE TABLE game.professions (
  id             game.slug PRIMARY KEY,
  skill_id       game.slug NOT NULL REFERENCES game.skills(id),
  name           text NOT NULL,
  level_required smallint NOT NULL CHECK (level_required IN (5,10)),
  parent_id      game.slug REFERENCES game.professions(id),
  description    text
);
CREATE INDEX professions_skill_idx ON game.professions (skill_id);

CREATE TABLE game.villagers (
  id               game.slug PRIMARY KEY,
  name             text NOT NULL,
  birthday_season  game.season,
  birthday_day     game.day_of_month,
  home_location_id game.slug REFERENCES game.locations(id),
  address          text,
  family           text,
  bio              text,
  is_marriageable  boolean NOT NULL DEFAULT false,
  is_secret        boolean NOT NULL DEFAULT false,
  unlock_condition text,
  portrait_asset_id uuid REFERENCES game.media_assets(id),
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((birthday_season IS NULL) = (birthday_day IS NULL))
);
CREATE INDEX villagers_birthday_idx ON game.villagers (birthday_season, birthday_day);

CREATE TABLE game.vendors (
  id               game.slug PRIMARY KEY,
  name             text NOT NULL,
  location_id      game.slug REFERENCES game.locations(id),
  villager_id      game.slug REFERENCES game.villagers(id),
  open_time        game.game_time,
  close_time       game.game_time,
  schedule_notes   text
);

CREATE TABLE game.heart_events (
  id          game.slug PRIMARY KEY,
  villager_id game.slug NOT NULL REFERENCES game.villagers(id) ON DELETE CASCADE,
  hearts      smallint NOT NULL CHECK (hearts BETWEEN 0 AND 14),
  name        text NOT NULL,
  location_id game.slug REFERENCES game.locations(id),
  conditions  text,
  description text,
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX heart_events_villager_idx ON game.heart_events (villager_id, hearts);

-- ---------------------------------------------------------------------
-- 5. Gifts
-- ---------------------------------------------------------------------
CREATE TABLE game.gift_taste_rules (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  villager_id game.slug REFERENCES game.villagers(id) ON DELETE CASCADE,   -- NULL = universal taste
  item_id     game.slug REFERENCES game.items(id) ON DELETE CASCADE,
  category_id game.slug REFERENCES game.item_categories(id) ON DELETE CASCADE,
  taste       game.gift_taste NOT NULL,
  notes       text,
  CHECK (num_nonnulls(item_id, category_id) = 1)
);
CREATE UNIQUE INDEX gift_taste_rules_uidx ON game.gift_taste_rules
  (COALESCE(villager_id::text,''), COALESCE(item_id::text,''), COALESCE(category_id::text,''));
CREATE INDEX gift_taste_rules_villager_idx ON game.gift_taste_rules (villager_id, taste);
CREATE INDEX gift_taste_rules_item_idx     ON game.gift_taste_rules (item_id) WHERE item_id IS NOT NULL;

-- ---------------------------------------------------------------------
-- 6. Recipes, farming, animals, machines
-- ---------------------------------------------------------------------
CREATE TABLE game.recipes (
  id                 game.slug PRIMARY KEY,
  kind               game.recipe_kind NOT NULL,
  output_item_id     game.slug NOT NULL REFERENCES game.items(id),
  output_quantity    smallint NOT NULL DEFAULT 1 CHECK (output_quantity > 0),
  unlock_text        text,
  unlock_villager_id game.slug REFERENCES game.villagers(id),
  unlock_hearts      smallint CHECK (unlock_hearts BETWEEN 0 AND 14),
  unlock_skill_id    game.slug REFERENCES game.skills(id),
  unlock_skill_level smallint CHECK (unlock_skill_level BETWEEN 1 AND 10),
  purchase_price     integer CHECK (purchase_price >= 0),
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX recipes_output_idx ON game.recipes (output_item_id);

CREATE TABLE game.recipe_ingredients (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipe_id   game.slug NOT NULL REFERENCES game.recipes(id) ON DELETE CASCADE,
  item_id     game.slug REFERENCES game.items(id),
  category_id game.slug REFERENCES game.item_categories(id),   -- 'any fish', 'any egg', ...
  quantity    smallint NOT NULL DEFAULT 1 CHECK (quantity > 0),
  CHECK (num_nonnulls(item_id, category_id) = 1)
);
CREATE INDEX recipe_ingredients_recipe_idx ON game.recipe_ingredients (recipe_id);
CREATE INDEX recipe_ingredients_item_idx   ON game.recipe_ingredients (item_id) WHERE item_id IS NOT NULL;

CREATE TABLE game.skill_level_recipes (
  skill_id  game.slug NOT NULL,
  level     smallint NOT NULL,
  recipe_id game.slug NOT NULL REFERENCES game.recipes(id) ON DELETE CASCADE,
  PRIMARY KEY (skill_id, level, recipe_id),
  FOREIGN KEY (skill_id, level) REFERENCES game.skill_levels(skill_id, level) ON DELETE CASCADE
);

CREATE TABLE game.crops (
  id                game.slug PRIMARY KEY,
  produce_item_id   game.slug NOT NULL UNIQUE REFERENCES game.items(id),
  seed_item_id      game.slug NOT NULL UNIQUE REFERENCES game.items(id),
  growth_days       smallint NOT NULL CHECK (growth_days > 0),
  stage_days        smallint[],
  regrow_days       smallint CHECK (regrow_days > 0),
  is_trellis        boolean NOT NULL DEFAULT false,
  can_be_giant      boolean NOT NULL DEFAULT false,
  indoors_only      boolean NOT NULL DEFAULT false,
  harvest_xp        integer,
  notes             text,
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE game.crop_seasons (
  crop_id game.slug NOT NULL REFERENCES game.crops(id) ON DELETE CASCADE,
  season  game.season NOT NULL,
  PRIMARY KEY (crop_id, season)
);
CREATE INDEX crop_seasons_season_idx ON game.crop_seasons (season);

CREATE TABLE game.fruit_trees (
  id              game.slug PRIMARY KEY,
  sapling_item_id game.slug NOT NULL UNIQUE REFERENCES game.items(id),
  fruit_item_id   game.slug NOT NULL REFERENCES game.items(id),
  season          game.season,                         -- NULL = fruits in more than one season
  mature_days     smallint NOT NULL DEFAULT 28,
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE game.farm_types (
  id          game.slug PRIMARY KEY,
  name        text NOT NULL,
  description text,
  bonuses     text,
  map_asset_id uuid REFERENCES game.media_assets(id),
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE game.animals (
  id             game.slug PRIMARY KEY,
  name           text NOT NULL,
  building       text,
  purchase_price integer CHECK (purchase_price >= 0),
  days_to_mature smallint,
  description    text,
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE game.animal_products (
  animal_id game.slug NOT NULL REFERENCES game.animals(id) ON DELETE CASCADE,
  item_id   game.slug NOT NULL REFERENCES game.items(id),
  condition_text text,
  PRIMARY KEY (animal_id, item_id)
);

CREATE TABLE game.machines (
  id               game.slug PRIMARY KEY,
  item_id          game.slug REFERENCES game.items(id),
  craft_recipe_id  game.slug REFERENCES game.recipes(id),
  name             text NOT NULL,
  description      text,
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE game.processing_rules (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  machine_id      game.slug NOT NULL REFERENCES game.machines(id) ON DELETE CASCADE,
  input_item_id   game.slug REFERENCES game.items(id),
  input_category_id game.slug REFERENCES game.item_categories(id),
  input_quantity  smallint NOT NULL DEFAULT 1,
  output_item_id  game.slug REFERENCES game.items(id),
  output_quantity smallint NOT NULL DEFAULT 1,
  minutes         integer,
  price_formula   text,                                -- e.g. 'base * 3', evaluated in packages/game-logic
  notes           text,
  CHECK (num_nonnulls(input_item_id, input_category_id) = 1)
);
CREATE INDEX processing_rules_machine_idx ON game.processing_rules (machine_id);
CREATE INDEX processing_rules_input_idx   ON game.processing_rules (input_item_id) WHERE input_item_id IS NOT NULL;

-- ---------------------------------------------------------------------
-- 7. Fish
-- ---------------------------------------------------------------------
CREATE TABLE game.fish (
  item_id        game.slug PRIMARY KEY REFERENCES game.items(id) ON DELETE CASCADE,
  difficulty     smallint,
  behavior       game.fish_behavior,
  min_size_in    numeric(5,1),
  max_size_in    numeric(5,1),
  is_legendary   boolean NOT NULL DEFAULT false,
  is_crab_pot    boolean NOT NULL DEFAULT false,
  crab_pot_area  text,
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE game.fish_catch_rules (
  id                 bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fish_id            game.slug NOT NULL REFERENCES game.fish(item_id) ON DELETE CASCADE,
  location_id        game.slug NOT NULL REFERENCES game.locations(id),
  seasons            game.season[] NOT NULL CHECK (cardinality(seasons) > 0),
  weathers           game.weather[],                   -- NULL = any weather
  time_start         game.game_time NOT NULL DEFAULT 600,
  time_end           game.game_time NOT NULL DEFAULT 2600,
  min_fishing_level  smallint NOT NULL DEFAULT 0,
  notes              text
);
CREATE INDEX fish_catch_rules_fish_idx     ON game.fish_catch_rules (fish_id);
CREATE INDEX fish_catch_rules_location_idx ON game.fish_catch_rules (location_id);
CREATE INDEX fish_catch_rules_seasons_idx  ON game.fish_catch_rules USING gin (seasons);

-- ---------------------------------------------------------------------
-- 8. Monsters and Monster Eradication Goals
-- ---------------------------------------------------------------------
CREATE TABLE game.monsters (
  id          game.slug PRIMARY KEY,
  name        text NOT NULL,
  family      text,                                    -- Slimes, Bats, Skeletons, ...
  hp          integer,
  damage      integer,
  defense     integer,
  speed       integer,
  xp          integer,
  description text,
  sprite_asset_id uuid REFERENCES game.media_assets(id),
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX monsters_family_idx ON game.monsters (family);

CREATE TABLE game.monster_locations (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  monster_id  game.slug NOT NULL REFERENCES game.monsters(id) ON DELETE CASCADE,
  location_id game.slug NOT NULL REFERENCES game.locations(id),
  floor_min   smallint,
  floor_max   smallint,
  notes       text,
  CHECK (floor_min IS NULL OR floor_max IS NULL OR floor_min <= floor_max)
);
CREATE INDEX monster_locations_monster_idx  ON game.monster_locations (monster_id);
CREATE INDEX monster_locations_location_idx ON game.monster_locations (location_id);

CREATE TABLE game.monster_drops (
  monster_id  game.slug NOT NULL REFERENCES game.monsters(id) ON DELETE CASCADE,
  item_id     game.slug NOT NULL REFERENCES game.items(id),
  chance      numeric(6,5) CHECK (chance BETWEEN 0 AND 1),
  quantity_min smallint NOT NULL DEFAULT 1,
  quantity_max smallint NOT NULL DEFAULT 1,
  condition_text text,
  PRIMARY KEY (monster_id, item_id)
);
CREATE INDEX monster_drops_item_idx ON game.monster_drops (item_id);

CREATE TABLE game.eradication_goals (
  id             game.slug PRIMARY KEY,
  name           text NOT NULL,
  description    text,
  kills_required integer NOT NULL CHECK (kills_required > 0),
  reward_item_id game.slug REFERENCES game.items(id),
  reward_text    text,
  location_id    game.slug REFERENCES game.locations(id),
  sort_order     smallint NOT NULL DEFAULT 0,
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE game.eradication_goal_monsters (
  goal_id    game.slug NOT NULL REFERENCES game.eradication_goals(id) ON DELETE CASCADE,
  monster_id game.slug NOT NULL REFERENCES game.monsters(id),
  PRIMARY KEY (goal_id, monster_id)
);
CREATE INDEX eradication_goal_monsters_monster_idx ON game.eradication_goal_monsters (monster_id);

-- ---------------------------------------------------------------------
-- 9. Quests
-- ---------------------------------------------------------------------
CREATE TABLE game.quests (
  id                 game.slug PRIMARY KEY,
  quest_type         game.quest_type NOT NULL,
  name               text NOT NULL,
  description        text,
  giver_villager_id  game.slug REFERENCES game.villagers(id),
  location_id        game.slug REFERENCES game.locations(id),
  available_season   game.season,
  available_day      game.day_of_month,
  min_year           smallint,
  is_repeatable      boolean NOT NULL DEFAULT false,
  time_limit_days    smallint,
  unlock_text        text,
  reward_gold        integer CHECK (reward_gold >= 0),
  reward_text        text,
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX quests_type_idx  ON game.quests (quest_type);
CREATE INDEX quests_giver_idx ON game.quests (giver_villager_id);

CREATE TABLE game.quest_objectives (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  quest_id       game.slug NOT NULL REFERENCES game.quests(id) ON DELETE CASCADE,
  step           smallint NOT NULL DEFAULT 1,
  objective_type text NOT NULL CHECK (objective_type IN ('deliver_item','collect','kill','fish','talk','go_to','craft','cook','other')),
  item_id        game.slug REFERENCES game.items(id),
  monster_id     game.slug REFERENCES game.monsters(id),
  villager_id    game.slug REFERENCES game.villagers(id),
  location_id    game.slug REFERENCES game.locations(id),
  quantity       smallint,
  description    text
);
CREATE INDEX quest_objectives_quest_idx ON game.quest_objectives (quest_id, step);
CREATE INDEX quest_objectives_item_idx  ON game.quest_objectives (item_id) WHERE item_id IS NOT NULL;

CREATE TABLE game.quest_rewards (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  quest_id         game.slug NOT NULL REFERENCES game.quests(id) ON DELETE CASCADE,
  item_id          game.slug REFERENCES game.items(id),
  recipe_id        game.slug REFERENCES game.recipes(id),
  villager_id      game.slug REFERENCES game.villagers(id),
  quantity         smallint,
  gold             integer,
  friendship_points integer,
  description      text
);
CREATE INDEX quest_rewards_quest_idx ON game.quest_rewards (quest_id);

CREATE TABLE game.quest_prerequisites (
  quest_id              game.slug NOT NULL REFERENCES game.quests(id) ON DELETE CASCADE,
  prerequisite_quest_id game.slug NOT NULL REFERENCES game.quests(id) ON DELETE CASCADE,
  PRIMARY KEY (quest_id, prerequisite_quest_id),
  CHECK (quest_id <> prerequisite_quest_id)
);

-- ---------------------------------------------------------------------
-- 10. Where items come from (after monsters, recipes, quests exist)
-- ---------------------------------------------------------------------
CREATE TABLE game.item_sources (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_id     game.slug NOT NULL REFERENCES game.items(id) ON DELETE CASCADE,
  source_type game.item_source_type NOT NULL,
  vendor_id   game.slug REFERENCES game.vendors(id),
  monster_id  game.slug REFERENCES game.monsters(id),
  location_id game.slug REFERENCES game.locations(id),
  recipe_id   game.slug REFERENCES game.recipes(id),
  quest_id    game.slug REFERENCES game.quests(id),
  price       integer CHECK (price >= 0),
  currency    text NOT NULL DEFAULT 'g',               -- g, qi_coins, star_tokens, ...
  quantity_min smallint,
  quantity_max smallint,
  chance      numeric(6,5) CHECK (chance BETWEEN 0 AND 1),
  seasons     game.season[],
  conditions  text,
  notes       text,
  CHECK (source_type <> 'shop' OR vendor_id IS NOT NULL),
  CHECK (source_type <> 'drop' OR monster_id IS NOT NULL)
);
CREATE INDEX item_sources_item_idx    ON game.item_sources (item_id, source_type);
CREATE INDEX item_sources_vendor_idx  ON game.item_sources (vendor_id) WHERE vendor_id IS NOT NULL;
CREATE INDEX item_sources_monster_idx ON game.item_sources (monster_id) WHERE monster_id IS NOT NULL;

-- ---------------------------------------------------------------------
-- 11. Bundles, festivals, achievements, random events, perfection
-- ---------------------------------------------------------------------
CREATE TABLE game.bundle_rooms (
  id             game.slug PRIMARY KEY,
  name           text NOT NULL,
  reward_text    text,
  reward_item_id game.slug REFERENCES game.items(id),
  sort_order     smallint NOT NULL DEFAULT 0,
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE game.bundles (
  id              game.slug PRIMARY KEY,
  room_id         game.slug NOT NULL REFERENCES game.bundle_rooms(id),
  name            text NOT NULL,
  variant         text NOT NULL DEFAULT 'standard' CHECK (variant IN ('standard','remixed')),
  slots_required  smallint NOT NULL CHECK (slots_required > 0),
  reward_item_id  game.slug REFERENCES game.items(id),
  reward_quantity smallint,
  sort_order      smallint NOT NULL DEFAULT 0,
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bundles_room_idx ON game.bundles (room_id);
CREATE TABLE game.bundle_items (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bundle_id   game.slug NOT NULL REFERENCES game.bundles(id) ON DELETE CASCADE,
  item_id     game.slug NOT NULL REFERENCES game.items(id),
  quantity    smallint NOT NULL DEFAULT 1 CHECK (quantity > 0),
  min_quality game.quality NOT NULL DEFAULT 'normal',
  UNIQUE (bundle_id, item_id, min_quality)
);
CREATE INDEX bundle_items_item_idx ON game.bundle_items (item_id);

CREATE TABLE game.festivals (
  id          game.slug PRIMARY KEY,
  name        text NOT NULL,
  season      game.season NOT NULL,
  start_day   game.day_of_month NOT NULL,
  end_day     game.day_of_month NOT NULL,
  start_time  game.game_time,
  end_time    game.game_time,
  location_id game.slug REFERENCES game.locations(id),
  description text,
  guide_text  text,
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_day >= start_day)
);
CREATE INDEX festivals_calendar_idx ON game.festivals (season, start_day);
CREATE TABLE game.festival_activities (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  festival_id   game.slug NOT NULL REFERENCES game.festivals(id) ON DELETE CASCADE,
  name          text NOT NULL,
  activity_type text NOT NULL CHECK (activity_type IN ('shop','minigame','competition','event','other')),
  description   text,
  sort_order    smallint NOT NULL DEFAULT 0
);
CREATE INDEX festival_activities_festival_idx ON game.festival_activities (festival_id);
CREATE TABLE game.festival_rewards (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  festival_id    game.slug NOT NULL REFERENCES game.festivals(id) ON DELETE CASCADE,
  activity_id    bigint REFERENCES game.festival_activities(id) ON DELETE SET NULL,
  item_id        game.slug REFERENCES game.items(id),
  quantity       smallint NOT NULL DEFAULT 1,
  cost           integer,
  currency       text NOT NULL DEFAULT 'g',            -- g, star_tokens, ...
  requirement_text text
);
CREATE INDEX festival_rewards_festival_idx ON game.festival_rewards (festival_id);

CREATE TABLE game.achievements (
  id             game.slug PRIMARY KEY,
  name           text NOT NULL,
  description    text NOT NULL,
  how_to         text,
  category       text,
  reward_item_id game.slug REFERENCES game.items(id),
  reward_text    text,
  criteria       jsonb,                                -- machine-readable requirement, e.g. {"type":"ship_all","scope":"crops"}
  sprite_asset_id uuid REFERENCES game.media_assets(id),
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX achievements_category_idx ON game.achievements (category);

CREATE TABLE game.random_events (
  id              game.slug PRIMARY KEY,
  name            text NOT NULL,
  event_type      text NOT NULL CHECK (event_type IN ('night','farm','weather','mine','fishing','town','other')),
  description     text,
  trigger_text    text,
  probability_pct numeric(5,2) CHECK (probability_pct BETWEEN 0 AND 100),
  seasons         game.season[],
  weathers        game.weather[],
  min_year        smallint,
  location_id     game.slug REFERENCES game.locations(id),
  effects_text    text,
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX random_events_type_idx ON game.random_events (event_type);
CREATE TABLE game.random_event_outcomes (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id        game.slug NOT NULL REFERENCES game.random_events(id) ON DELETE CASCADE,
  description     text NOT NULL,
  item_id         game.slug REFERENCES game.items(id),
  quantity        smallint,
  probability_pct numeric(5,2) CHECK (probability_pct BETWEEN 0 AND 100)
);
CREATE INDEX random_event_outcomes_event_idx ON game.random_event_outcomes (event_id);

CREATE TABLE game.perfection_requirements (
  id           game.slug PRIMARY KEY,
  name         text NOT NULL,
  weight_pct   numeric(5,2) NOT NULL CHECK (weight_pct >= 0),
  target_count integer,
  description  text,
  sort_order   smallint NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------
-- 12. Editorial guides and search
-- ---------------------------------------------------------------------
CREATE TABLE game.guides (
  id               game.slug PRIMARY KEY,
  title            text NOT NULL,
  summary          text,
  body_md          text NOT NULL,
  cover_asset_id   uuid REFERENCES game.media_assets(id),
  author_id        uuid REFERENCES app.profiles(id) ON DELETE SET NULL,
  reading_minutes  smallint,
  seo              jsonb NOT NULL DEFAULT '{}'::jsonb,
  published_at     timestamptz,
  status game.content_status NOT NULL DEFAULT 'published',
  introduced_in text REFERENCES game.game_versions(id),
  verified_in text REFERENCES game.game_versions(id),
  verified_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX guides_published_idx ON game.guides (status, published_at DESC);
CREATE TABLE game.guide_revisions (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  guide_id   game.slug NOT NULL REFERENCES game.guides(id) ON DELETE CASCADE,
  body_md    text NOT NULL,
  editor_id  uuid REFERENCES app.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX guide_revisions_guide_idx ON game.guide_revisions (guide_id, created_at DESC);
CREATE TABLE game.tags (
  id   game.slug PRIMARY KEY,
  name text NOT NULL
);
CREATE TABLE game.guide_tags (
  guide_id game.slug NOT NULL REFERENCES game.guides(id) ON DELETE CASCADE,
  tag_id   game.slug NOT NULL REFERENCES game.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (guide_id, tag_id)
);
CREATE TABLE game.guide_entity_links (
  guide_id    game.slug NOT NULL REFERENCES game.guides(id) ON DELETE CASCADE,
  entity_type game.entity_type NOT NULL,
  entity_id   text NOT NULL,
  PRIMARY KEY (guide_id, entity_type, entity_id)
);
CREATE INDEX guide_entity_links_entity_idx ON game.guide_entity_links (entity_type, entity_id);

CREATE TABLE game.search_documents (
  entity_type game.entity_type NOT NULL,
  entity_id   text NOT NULL,
  title       text NOT NULL,
  subtitle    text,
  url         text NOT NULL,
  body        text,
  aliases_text text,
  popularity  integer NOT NULL DEFAULT 0,
  tsv         tsvector GENERATED ALWAYS AS (
                setweight(to_tsvector('simple', coalesce(title,'')), 'A') ||
                setweight(to_tsvector('simple', coalesce(aliases_text,'')), 'B') ||
                setweight(to_tsvector('simple', coalesce(body,'')), 'C')
              ) STORED,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entity_type, entity_id)
);
CREATE INDEX search_documents_tsv_idx   ON game.search_documents USING gin (tsv);
CREATE INDEX search_documents_title_idx ON game.search_documents USING gin (title extensions.gin_trgm_ops);

-- ---------------------------------------------------------------------
-- 13. Farms (save profiles) and player progress
-- ---------------------------------------------------------------------
CREATE TABLE app.farms (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES app.profiles(id) ON DELETE CASCADE,
  name            text NOT NULL,
  farm_type_id    game.slug REFERENCES game.farm_types(id),
  game_version_id text REFERENCES game.game_versions(id),
  platform        text,
  current_season  game.season,
  current_day     game.day_of_month,
  current_year    smallint CHECK (current_year >= 1),
  is_primary      boolean NOT NULL DEFAULT false,
  revision        bigint NOT NULL DEFAULT 0,           -- bumped on every progress change, used by sync
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  archived_at     timestamptz
);
CREATE INDEX farms_user_idx ON app.farms (user_id) WHERE archived_at IS NULL;
CREATE UNIQUE INDEX farms_one_primary_uidx ON app.farms (user_id) WHERE is_primary AND archived_at IS NULL;

CREATE TABLE app.farm_bundles (
  farm_id   uuid NOT NULL REFERENCES app.farms(id) ON DELETE CASCADE,
  bundle_id game.slug NOT NULL REFERENCES game.bundles(id),
  is_active boolean NOT NULL DEFAULT true,             -- remixed bundles vary per save
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (farm_id, bundle_id)
);
CREATE TABLE app.farm_bundle_items (
  farm_id        uuid NOT NULL REFERENCES app.farms(id) ON DELETE CASCADE,
  bundle_item_id bigint NOT NULL REFERENCES game.bundle_items(id),
  is_done        boolean NOT NULL DEFAULT false,       -- un-ticking sets false, rows are not deleted (sync-friendly)
  done_at        timestamptz,
  updated_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (farm_id, bundle_item_id)
);

-- Largest progress table: hash-partitioned by farm_id from day one.
CREATE TABLE app.farm_collections (
  farm_id         uuid NOT NULL REFERENCES app.farms(id) ON DELETE CASCADE,
  collection_type app.collection_type NOT NULL,
  item_id         game.slug NOT NULL REFERENCES game.items(id),
  quantity        integer NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  best_quality    game.quality,
  first_at        timestamptz,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (farm_id, collection_type, item_id)
) PARTITION BY HASH (farm_id);
DO $$
BEGIN
  FOR i IN 0..15 LOOP
    EXECUTE format('CREATE TABLE app.farm_collections_p%s PARTITION OF app.farm_collections FOR VALUES WITH (MODULUS 16, REMAINDER %s)', i, i);
  END LOOP;
END $$;
CREATE INDEX farm_collections_item_idx ON app.farm_collections (item_id);

CREATE TABLE app.farm_achievements (
  farm_id        uuid NOT NULL REFERENCES app.farms(id) ON DELETE CASCADE,
  achievement_id game.slug NOT NULL REFERENCES game.achievements(id),
  unlocked_at    timestamptz,
  updated_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (farm_id, achievement_id)
);
CREATE TABLE app.farm_friendships (
  farm_id     uuid NOT NULL REFERENCES app.farms(id) ON DELETE CASCADE,
  villager_id game.slug NOT NULL REFERENCES game.villagers(id),
  points      integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  status      app.relationship_status NOT NULL DEFAULT 'none',
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (farm_id, villager_id)
);
CREATE TABLE app.farm_heart_events (
  farm_id        uuid NOT NULL REFERENCES app.farms(id) ON DELETE CASCADE,
  heart_event_id game.slug NOT NULL REFERENCES game.heart_events(id),
  seen_at        timestamptz,
  updated_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (farm_id, heart_event_id)
);
CREATE TABLE app.farm_skill_levels (
  farm_id    uuid NOT NULL REFERENCES app.farms(id) ON DELETE CASCADE,
  skill_id   game.slug NOT NULL REFERENCES game.skills(id),
  level      smallint NOT NULL DEFAULT 0 CHECK (level BETWEEN 0 AND 10),
  xp         integer NOT NULL DEFAULT 0 CHECK (xp >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (farm_id, skill_id)
);
CREATE TABLE app.farm_professions (
  farm_id       uuid NOT NULL REFERENCES app.farms(id) ON DELETE CASCADE,
  profession_id game.slug NOT NULL REFERENCES game.professions(id),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (farm_id, profession_id)
);
CREATE TABLE app.farm_quests (
  farm_id      uuid NOT NULL REFERENCES app.farms(id) ON DELETE CASCADE,
  quest_id     game.slug NOT NULL REFERENCES game.quests(id),
  state        app.quest_state NOT NULL DEFAULT 'available',
  completed_at timestamptz,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (farm_id, quest_id)
);
CREATE TABLE app.farm_monster_kills (
  farm_id    uuid NOT NULL REFERENCES app.farms(id) ON DELETE CASCADE,
  monster_id game.slug NOT NULL REFERENCES game.monsters(id),
  kills      integer NOT NULL DEFAULT 0 CHECK (kills >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (farm_id, monster_id)
);
CREATE TABLE app.farm_festival_notes (
  farm_id     uuid NOT NULL REFERENCES app.farms(id) ON DELETE CASCADE,
  festival_id game.slug NOT NULL REFERENCES game.festivals(id),
  attended    boolean NOT NULL DEFAULT false,
  notes       text,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (farm_id, festival_id)
);

-- Sync cursor index: every progress table is queried by (farm_id, updated_at)
CREATE INDEX farm_bundle_items_sync_idx ON app.farm_bundle_items (farm_id, updated_at);
CREATE INDEX farm_achievements_sync_idx ON app.farm_achievements (farm_id, updated_at);
CREATE INDEX farm_friendships_sync_idx  ON app.farm_friendships  (farm_id, updated_at);
CREATE INDEX farm_quests_sync_idx       ON app.farm_quests       (farm_id, updated_at);

-- ---------------------------------------------------------------------
-- 14. Plans, calculators, favourites, reminders, imports
-- ---------------------------------------------------------------------
CREATE TABLE app.farm_plans (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES app.profiles(id) ON DELETE CASCADE,
  title              text NOT NULL,
  description        text,
  farm_type_id       game.slug REFERENCES game.farm_types(id),
  game_version_id    text REFERENCES game.game_versions(id),
  layout             jsonb NOT NULL,                   -- grid layout, validated by Zod in the API
  is_public          boolean NOT NULL DEFAULT false,
  share_slug         text UNIQUE,
  thumbnail_asset_id uuid REFERENCES game.media_assets(id),
  view_count         integer NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  deleted_at         timestamptz
);
CREATE INDEX farm_plans_user_idx   ON app.farm_plans (user_id) WHERE deleted_at IS NULL;
CREATE INDEX farm_plans_public_idx ON app.farm_plans (created_at DESC) WHERE is_public AND deleted_at IS NULL;
CREATE TABLE app.farm_plan_likes (
  plan_id    uuid NOT NULL REFERENCES app.farm_plans(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES app.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (plan_id, user_id)
);

CREATE TABLE app.saved_calculations (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES app.profiles(id) ON DELETE CASCADE,
  farm_id        uuid REFERENCES app.farms(id) ON DELETE SET NULL,
  tool           text NOT NULL CHECK (tool IN ('crop_profit','gift_finder','fishing_planner','farm_planner','other')),
  name           text,
  params         jsonb NOT NULL,
  result_summary jsonb,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX saved_calculations_user_idx ON app.saved_calculations (user_id, created_at DESC);

CREATE TABLE app.favorites (
  user_id     uuid NOT NULL REFERENCES app.profiles(id) ON DELETE CASCADE,
  entity_type game.entity_type NOT NULL,
  entity_id   text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, entity_type, entity_id)
);

CREATE TABLE app.reminders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES app.profiles(id) ON DELETE CASCADE,
  farm_id       uuid REFERENCES app.farms(id) ON DELETE CASCADE,
  reminder_type text NOT NULL CHECK (reminder_type IN ('crop_ready','birthday','festival','custom')),
  entity_type   game.entity_type,
  entity_id     text,
  message       text,
  channel       text NOT NULL DEFAULT 'push' CHECK (channel IN ('push','email')),
  remind_at     timestamptz NOT NULL,
  sent_at       timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reminders_due_idx ON app.reminders (remind_at) WHERE sent_at IS NULL;

CREATE TABLE app.save_imports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES app.profiles(id) ON DELETE CASCADE,
  farm_id      uuid REFERENCES app.farms(id) ON DELETE SET NULL,
  file_name    text,
  file_size    integer,
  game_version text,
  status       text NOT NULL CHECK (status IN ('parsed','failed')),
  summary      jsonb,                                  -- the save file itself is parsed in the browser and never stored
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX save_imports_user_idx ON app.save_imports (user_id, created_at DESC);

-- ---------------------------------------------------------------------
-- 15. Feedback, newsletter, analytics, audit
-- ---------------------------------------------------------------------
CREATE TABLE app.content_feedback (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES app.profiles(id) ON DELETE SET NULL,
  entity_type game.entity_type,
  entity_id   text,
  page_url    text,
  kind        app.feedback_kind NOT NULL DEFAULT 'mistake',
  message     text NOT NULL,
  status      app.feedback_status NOT NULL DEFAULT 'open',
  resolved_by uuid REFERENCES app.profiles(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX content_feedback_status_idx ON app.content_feedback (status, created_at DESC);
CREATE INDEX content_feedback_entity_idx ON app.content_feedback (entity_type, entity_id);

CREATE TABLE app.newsletter_subscribers (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email        extensions.citext NOT NULL UNIQUE,
  status       app.subscription_status NOT NULL DEFAULT 'pending',
  token_hash   text,
  source       text,
  confirmed_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Anonymous search analytics (zero-result queries reveal missing content). Monthly range partitions.
CREATE TABLE app.search_logs (
  id           bigint GENERATED ALWAYS AS IDENTITY,
  query        text NOT NULL,
  result_count integer NOT NULL,
  locale       text,
  session_hash text,                                   -- salted, rotating hash, not a user id
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
CREATE TABLE app.search_logs_default PARTITION OF app.search_logs DEFAULT;
DO $$
DECLARE m date;
BEGIN
  FOR m IN SELECT generate_series(date '2026-10-01', date '2027-12-01', interval '1 month')::date LOOP
    EXECUTE format('CREATE TABLE app.search_logs_%s PARTITION OF app.search_logs FOR VALUES FROM (%L) TO (%L)',
                   to_char(m, 'YYYY_MM'), m, (m + interval '1 month')::date);
  END LOOP;
END $$;
CREATE INDEX search_logs_zero_idx ON app.search_logs (created_at) WHERE result_count = 0;

CREATE TABLE app.audit_log (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id    uuid REFERENCES app.profiles(id) ON DELETE SET NULL,
  action      text NOT NULL,
  entity_type text,
  entity_id   text,
  diff        jsonb,
  ip_hash     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_entity_idx ON app.audit_log (entity_type, entity_id, created_at DESC);
CREATE INDEX audit_log_actor_idx  ON app.audit_log (actor_id, created_at DESC);

-- ---------------------------------------------------------------------
-- 16. Views
-- ---------------------------------------------------------------------
CREATE VIEW game.v_calendar WITH (security_invoker = true) AS
  SELECT 'birthday'::text AS kind, v.id AS entity_id, v.name, v.birthday_season AS season,
         v.birthday_day AS start_day, v.birthday_day AS end_day
  FROM game.villagers v
  WHERE v.status = 'published' AND v.birthday_season IS NOT NULL
  UNION ALL
  SELECT 'festival', f.id, f.name, f.season, f.start_day, f.end_day
  FROM game.festivals f
  WHERE f.status = 'published';

CREATE VIEW app.v_farm_bundle_progress WITH (security_invoker = true) AS
  SELECT fbi.farm_id, bi.bundle_id,
         count(*) FILTER (WHERE fbi.is_done) AS done,
         count(*) AS total
  FROM app.farm_bundle_items fbi
  JOIN game.bundle_items bi ON bi.id = fbi.bundle_item_id
  GROUP BY fbi.farm_id, bi.bundle_id;

-- ---------------------------------------------------------------------
-- 17. updated_at triggers on every table that has the column
-- ---------------------------------------------------------------------
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT n.nspname AS s, c.relname AS t
    FROM pg_attribute a
    JOIN pg_class c     ON c.oid = a.attrelid AND c.relkind IN ('r','p') AND NOT c.relispartition
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE a.attname = 'updated_at' AND NOT a.attisdropped AND n.nspname IN ('game','app')
  LOOP
    EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I.%I FOR EACH ROW EXECUTE FUNCTION private.set_updated_at()', r.s, r.t);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- 18. Minimal seed data (structure only; full content is loaded from packages/data)
-- ---------------------------------------------------------------------
INSERT INTO game.locales (code, name, is_enabled) VALUES ('en', 'English', true);
INSERT INTO game.game_versions (id, is_current, notes) VALUES ('1.6.0', true, 'Placeholder. Set the exact patch version you verify data against.');
INSERT INTO game.skills (id, name, sort_order) VALUES
  ('farming','Farming',1), ('mining','Mining',2), ('foraging','Foraging',3), ('fishing','Fishing',4), ('combat','Combat',5);
-- Perfection weights: verify against the current game version before publishing.
INSERT INTO game.perfection_requirements (id, name, weight_pct, sort_order) VALUES
  ('shipping',          'Produce and fish shipped',        15, 1),
  ('obelisks',          'Obelisks on the farm',             4, 2),
  ('gold-clock',        'Golden Clock on the farm',        10, 3),
  ('monster-slayer',    'Monster Slayer hero',             10, 4),
  ('great-friends',     'Great friends',                   11, 5),
  ('farmer-level',      'Farmer level',                     5, 6),
  ('stardrops',         'Stardrops found',                 10, 7),
  ('cooking',           'Cooking recipes made',            10, 8),
  ('crafting',          'Crafting recipes made',           10, 9),
  ('fish-caught',       'Fish caught',                     10, 10),
  ('golden-walnuts',    'Golden walnuts found',             5, 11);

-- ---------------------------------------------------------------------
-- 19. Supabase security: RLS, grants, Storage
--     Data API roles: anon = signed-out visitor, authenticated = signed-in user,
--     service_role (secret key) = server only, bypasses RLS.
--     Add game and app to Settings > API > Exposed schemas, or turn the Data API off
--     and reach the database only from your server (Drizzle or postgres.js).
-- ---------------------------------------------------------------------
-- Full (non-partial) indexes on the columns RLS policies filter by
CREATE INDEX farms_user_all_idx          ON app.farms (user_id);
CREATE INDEX farm_plans_user_all_idx     ON app.farm_plans (user_id);
CREATE INDEX farm_plan_likes_user_idx    ON app.farm_plan_likes (user_id);
CREATE INDEX reminders_user_idx          ON app.reminders (user_id);

-- 19.1 Row Level Security on every table (partitions included; partitions get no grants or policies)
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT n.nspname AS s, c.relname AS t
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname IN ('game','app') AND c.relkind IN ('r','p')
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.s, r.t);
  END LOOP;
END $$;

-- 19.2 Game content: everyone reads published rows, editors and admins can read and write everything
DO $$
DECLARE r record; has_status boolean;
BEGIN
  FOR r IN
    SELECT c.relname AS t FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'game' AND c.relkind = 'r'
  LOOP
    has_status := EXISTS (SELECT 1 FROM pg_attribute a
                          WHERE a.attrelid = format('game.%I', r.t)::regclass
                            AND a.attname = 'status' AND NOT a.attisdropped);
    EXECUTE format('CREATE POLICY public_read ON game.%I FOR SELECT TO anon, authenticated USING (%s)',
                   r.t, CASE WHEN has_status THEN 'status = ''published''' ELSE 'true' END);
    EXECUTE format('CREATE POLICY editor_all ON game.%I FOR ALL TO authenticated USING (private.is_editor()) WITH CHECK (private.is_editor())', r.t);
  END LOOP;
END $$;

-- 19.3 App data owned directly by a user
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['devices','farms','farm_plans','farm_plan_likes','saved_calculations','favorites','reminders','save_imports']
  LOOP
    EXECUTE format('CREATE POLICY own_rows ON app.%I FOR ALL TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()))', t);
  END LOOP;
END $$;

-- 19.4 Progress tables: a row belongs to the user who owns its farm
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['farm_bundles','farm_bundle_items','farm_collections','farm_achievements','farm_friendships',
                           'farm_heart_events','farm_skill_levels','farm_professions','farm_quests','farm_monster_kills','farm_festival_notes']
  LOOP
    EXECUTE format('CREATE POLICY own_farm_rows ON app.%I FOR ALL TO authenticated
                    USING (farm_id IN (SELECT id FROM app.farms WHERE user_id = (SELECT auth.uid())))
                    WITH CHECK (farm_id IN (SELECT id FROM app.farms WHERE user_id = (SELECT auth.uid())))', t);
  END LOOP;
END $$;

-- 19.5 Special cases
CREATE POLICY profiles_select_own ON app.profiles FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));
CREATE POLICY profiles_update_own ON app.profiles FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY farm_plans_public_read ON app.farm_plans FOR SELECT TO anon, authenticated
  USING (is_public AND deleted_at IS NULL);
CREATE POLICY feedback_insert_own ON app.content_feedback FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) AND status = 'open' AND resolved_by IS NULL AND resolved_at IS NULL);
CREATE POLICY feedback_select_own ON app.content_feedback FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY feedback_editor_all ON app.content_feedback FOR ALL TO authenticated
  USING (private.is_editor()) WITH CHECK (private.is_editor());
-- newsletter_subscribers, search_logs and audit_log get no policies and no grants:
-- write to them from server code with the secret key. Anonymous "report a mistake" and newsletter sign-ups
-- should also go through a server route (rate limited, with a bot check).

-- 19.6 Grants (new tables are not exposed automatically, so grant explicitly)
GRANT USAGE ON SCHEMA game, app TO anon, authenticated, service_role;

GRANT SELECT ON ALL TABLES IN SCHEMA game TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA game TO authenticated;          -- gated by the editor_all policy
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA game TO authenticated;

GRANT SELECT ON app.profiles TO authenticated;
GRANT UPDATE (display_name, theme, locale, marketing_opt_in, preferences) ON app.profiles TO authenticated;  -- users cannot change their own role

GRANT SELECT, INSERT, UPDATE, DELETE ON
  app.devices, app.farms, app.farm_plans, app.farm_plan_likes, app.saved_calculations, app.favorites,
  app.reminders, app.save_imports,
  app.farm_bundles, app.farm_bundle_items, app.farm_collections, app.farm_achievements, app.farm_friendships,
  app.farm_heart_events, app.farm_skill_levels, app.farm_professions, app.farm_quests, app.farm_monster_kills,
  app.farm_festival_notes
TO authenticated;
GRANT SELECT ON app.farm_plans TO anon;
GRANT SELECT, INSERT, UPDATE ON app.content_feedback TO authenticated;
GRANT SELECT ON app.v_farm_bundle_progress TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA game, app TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA game, app TO service_role;

-- 19.7 Storage buckets (media_assets.storage_key points at these paths)
INSERT INTO storage.buckets (id, name, public) VALUES
  ('game-assets',     'game-assets',     true),    -- sprites, portraits, maps (editors upload)
  ('plan-thumbnails', 'plan-thumbnails', true)     -- user farm-plan images, stored under <user id>/...
ON CONFLICT (id) DO NOTHING;

CREATE POLICY game_assets_editor_all ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'game-assets' AND private.is_editor())
  WITH CHECK (bucket_id = 'game-assets' AND private.is_editor());
CREATE POLICY plan_thumbs_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'plan-thumbnails' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
CREATE POLICY plan_thumbs_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'plan-thumbnails' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
CREATE POLICY plan_thumbs_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'plan-thumbnails' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);

COMMIT;
