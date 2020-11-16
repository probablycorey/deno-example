import {Relationships} from 'https://deno.land/x/denodb@v1.0.12/lib/relationships.ts'
import Game from './game.ts'
import User from './user.ts'
import db from '../db.ts'

const GameUser = Relationships.manyToMany(Game, User)
db.link([GameUser])

export default GameUser
