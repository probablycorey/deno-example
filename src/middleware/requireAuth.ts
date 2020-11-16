import {Context} from 'https://deno.land/x/oak/mod.ts'
import {validateJwt} from 'https://deno.land/x/djwt/validate.ts'
import {jwtKey, payloadFromToken} from '../utils.ts/jwt.ts'

export const requireAuth = async ({cookies, response, state}: Context, next: any) => {
  const jwt = cookies.get('jwt') || ''
  const token = await validateJwt({jwt, key: jwtKey(), algorithm: 'HS256'})
  const payload = payloadFromToken(token)
  if (payload) {
    state.userEmail = payload.email as string
    await next()
  } else {
    cookies.delete('jwt')
    response.status = 401
    response.body = {success: false, message: 'Unauthorized'}
  }
}
