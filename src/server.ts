import {Application, send} from 'https://deno.land/x/oak/mod.ts'
import {createGameMachine} from './game.ts'
import router from './routes/mod.ts'

const port = Deno.env.get('PORT')
if (!port) throw new Error('Env var PORT is not defined')
console.log('About to start server using port ', {port})

const app = new Application()

app.use(router.routes())
app.use(router.allowedMethods())
app.addEventListener('error', (event) => {
  console.log('Uncaught error:', event.error)
})

// In production, this points to the react build created by `sp build`
app.use(async (context) => {
  await send(context, context.request.url.pathname, {
    root: `${Deno.cwd()}/client/build`,
    index: 'index.html',
  })
})

createGameMachine([{name: 'corey', color: 'red'}])

console.log(`Listening on port ${port}`)
await app.listen({port: Number(port)})
