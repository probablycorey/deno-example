import {Context} from 'https://deno.land/x/oak/mod.ts'

const routes: {[key: string]: (x: Context) => any} = {}

routes.create = async ({request, response, cookies}: Context) => {
  const body = await request.body()
  let {players} = await body.value
}
routes.message = async ({request, response, cookies}: Context) => {}
routes.status = async ({request, response, cookies}: Context) => {}

export default routes
