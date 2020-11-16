import {Migration} from 'https://deno.land/x/nessie/mod.ts'

export const up: Migration = () => {
  return `create table games (
    id serial not null primary key, 
    context jsonb not null default '{}'::jsonb,
    updated_at timestamptz,
    created_at timestamptz
  );
  
  create table games_users (
    user_id int, 
    game_id int,
    play_order int,
    updated_at timestamptz,
    created_at timestamptz
  );`
}

export const down: Migration = () => {
  return 'DROP TABLE players; DROP TABLE games'
}
