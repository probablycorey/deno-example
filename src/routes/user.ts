import {Context} from 'https://deno.land/x/oak/mod.ts'
import User from '../models/user.ts'

const routes: {[key: string]: (x: Context) => any} = {}

routes.get = async ({state, response}: Context) => {
  const email = state.userEmail
  const user = await User.where('email', email).first()
  if (user) {
    response.status = 200
    response.body = {
      success: true,
      data: {user},
    }
  } else {
    response.status = 404
    response.body = {
      success: false,
      message: 'unknown user',
    }
  }
}

routes.recentPlayers = async ({response}: Context) => {
  response.status = 200
  response.body = {success: true, data: {players: ['Gandolf', 'Bilbo']}}
}

routes.search = async ({response, request}: Context) => {
  const players = ['Corey', 'Chris', 'Jeff', 'Paul', 'Brian', 'Lowden']
  let filter = request.url.searchParams.get('filter')
  response.status = 200
  const filteredPlayers = players.filter((p) => filter && p.toLowerCase().startsWith(filter))
  response.body = {success: true, data: {players: filteredPlayers}}
}

export default routes
