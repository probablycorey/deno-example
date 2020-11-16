import {Model, DataTypes, Relationships} from 'https://deno.land/x/denodb/mod.ts'
import db from '../db.ts'
import User from './user.ts'

export default class Game extends Model {
  static table = 'games'
  static timestamps = true
  static fields = {
    id: {type: DataTypes.INTEGER, primaryKey: true},
    context: {type: DataTypes.JSONB},
  }

  static players() {
    return this.hasMany(User)
  }
}

db.link([Game])
