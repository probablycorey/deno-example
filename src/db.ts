import {Database} from 'https://deno.land/x/denodb/mod.ts'
import {creds} from '../db/config.ts'

export default new Database('postgres', creds)
