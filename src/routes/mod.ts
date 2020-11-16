import {Router} from 'https://deno.land/x/oak/mod.ts'
import {requireAuth} from '../middleware/requireAuth.ts'
import auth from './auth.ts'
import game from './game.ts'
import user from './user.ts'

const router = new Router()

router.post('/api/signup', auth.signup)
router.post('/api/signin', auth.signin)
router.post('/api/logout', auth.logout)

router.get('/api/user/recentPlayers', requireAuth, user.recentPlayers)
router.get('/api/user/search', requireAuth, user.search)
router.get('/api/user', requireAuth, user.get)

router.get('/api/game/:id', requireAuth, game.status)
router.post('/api/game/:id', requireAuth, game.message)
router.post('/api/game', requireAuth, game.create)

export default router
