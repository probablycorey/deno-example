import {Model, DataTypes} from 'https://deno.land/x/denodb/mod.ts'
import {hashSync} from 'https://deno.land/x/bcrypt@v0.2.4/src/main.ts'

import db from '../db.ts'

export default class User extends Model {
  static table = 'users'
  static timestamps = true
  static fields = {
    id: {type: DataTypes.INTEGER, primaryKey: true},
    email: {type: DataTypes.STRING, unique: true, allowNull: false, length: 50},
    password: DataTypes.string(20),
  }

  static async createWithPassword(email: string, password: string) {
    console.log('creating - ', email)
    const hashedPassword = hashSync(password)
    await User.create({email, password: hashedPassword})
    console.log('created ', email)
  }
}

db.link([User])
