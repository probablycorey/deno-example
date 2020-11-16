import {Cookies} from 'https://deno.land/x/oak/mod.ts'
import {makeJwt, setExpiration, Jose, Payload} from 'https://deno.land/x/djwt/create.ts'
import {JwtValidation} from 'https://deno.land/x/djwt/validate.ts'

export const markAsAuthenticated = async (email: string, cookies: Cookies) => {
  const days = 60 * 60 * 24
  const payload: Payload = {email, exp: setExpiration(days * 365)}
  const header: Jose = {alg: 'HS256', typ: 'JWT'}
  const jwt = await makeJwt({header, payload, key: jwtKey()})
  cookies.set('jwt', jwt)
}

export const jwtKey = () => {
  const key = Deno.env.get('JWT_KEY')
  if (!key) throw new Error('Env var `JWT_KEY` is not set')
  return key
}

export const payloadFromToken = (token: JwtValidation) => {
  if (token.isValid && isObject(token.payload) && has('email', token.payload)) {
    return token.payload
  } else {
    return undefined
  }
}

// Dumb typescript hack https://github.com/timonson/djwt/issues/25
const isObject = (obj: unknown): obj is object => {
  return obj !== null && typeof obj === 'object' && Array.isArray(obj) === false
}

const has = <K extends string>(key: K, x: object): x is {[key in K]: unknown} => {
  return key in x
}
