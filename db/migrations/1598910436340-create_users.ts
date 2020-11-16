import {Migration} from 'https://deno.land/x/nessie/mod.ts'

export const up: Migration = () => {
  return `create table users (
    id serial primary key, 
    created_at timestamptz,
    updated_at timestamptz,
    email character varying unique, 
    password character varying
  ); 
  `
}

export const down: Migration = () => {
  return 'DROP TABLE users'
}
