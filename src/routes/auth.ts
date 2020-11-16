import {Response, Context} from 'https://deno.land/x/oak/mod.ts'
import {hashSync, compareSync} from 'https://deno.land/x/bcrypt/mod.ts'
import User from '../models/user.ts'
import {markAsAuthenticated} from '../utils.ts/jwt.ts'

const signin = async ({request, response, cookies}: Context) => {
  const body = await request.body()
  const {email, password} = await body.value

  if (!email) {
    renderError('email must not be empty', response)
    return
  }
  if (!password) {
    renderError('password must not be empty', response)
    return
  }

  try {
    const result = await User.where('email', email).first()
    if (result && compareSync(password, result.password)) {
      response.body = {success: true}
      markAsAuthenticated(email, cookies)
    } else {
      response.status = 500
      response.body = {
        success: false,
        message: 'Incorrect username or password',
      }
    }
  } catch (error) {
    createErrorResponse(error, response)
  }
}

const signup = async ({request, response, cookies}: Context) => {
  const body = await request.body()
  let {email, password} = await body.value

  email = email.trim()

  if (email.length == 0) {
    renderError('email cannot be empty', response)
    return
  }

  if (password.length < 8) {
    renderError('Password must be at least 8 characters long.', response)
    return
  }

  try {
    await User.createWithPassword(email, password)
    markAsAuthenticated(email, cookies)
    response.status = 201
    response.body = {success: true}
  } catch (error) {
    createErrorResponse(error, response)
  }
}

const logout = async ({response, cookies}: Context) => {
  cookies.delete('jwt')
  response.status = 200
  response.body = {success: true}
}

const createErrorResponse = (error: Error, response: Response) => {
  response.status = 500
  response.body = {
    success: false,
    message: error.toString(),
  }
  console.error(error)
}

const renderError = (error: String, response: Response) => {
  response.status = 500
  response.body = {
    success: false,
    message: error,
  }
}

export default {signin, signup, logout}
