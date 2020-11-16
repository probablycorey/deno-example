import {ClientPostgreSQL} from 'https://deno.land/x/nessie/mod.ts'
import {creds} from './db/config.ts'

const clientOptions = {
  migrationFolder: './db/migrations',
  seedFolder: './db/seeds',
}

const clientPg = new ClientPostgreSQL(clientOptions, creds)

const config = {client: clientPg, exposeQueryBuilder: false}

export default config
