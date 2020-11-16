import {createMachine, assign} from 'https://cdn.skypack.dev/xstate@^4.13.0'
import {random} from './util.ts'

interface Player {
  name: string
  color: string
}

interface Region {
  name: string
  troops: number
  player: string
}

interface GameContext {
  rolls: [{}]
  deployableTroops: number
  origin: string
  target: string
  regions: {[key: string]: Region}
}

type SelectRegionEvent = {type: 'SELECT_REGION'; region: string}
type AttackEvent = {type: 'ATTACK'; automatic: boolean}
type ReinforceEvent = {type: 'REINFORCE'; troopCount: number}
type DeployEvent = {type: 'DEPLOY'; troopCount: number}
type EndEvent = {type: 'END'}

export const createGameMachine = (players: Player[]) => {
  return createMachine(
    {
      initial: 'deploy',
      context: {
        rolls: [],
        deployableTroops: 3,
        origin: undefined,
        target: undefined,
        regions: createRegions(players.map(({name}) => name)),
      },
      states: {
        deploy: {
          on: {
            SELECT_REGION: {
              target: 'deploy',
              actions: assign((_: any, event: SelectRegionEvent) => ({origin: event.region})),
              cond: (context: GameContext, event: SelectRegionEvent) => isValidOrigin(context, event.region),
            },
            DEPLOY: {
              target: 'postDeploy',
              actions: assign((context: GameContext, event: DeployEvent) => {
                const {regions, origin, deployableTroops} = context
                const region = {
                  ...regions[origin],
                  troops: regions[origin].troops + Math.min(context.deployableTroops, event.troopCount),
                }
                return {
                  regions: {...regions, [origin]: region},
                  deployableTroops: context.deployableTroops - event.troopCount,
                  origin: undefined,
                }
              }),
            },
          },
        },
        postDeploy: {
          always: [
            {
              target: 'preAttack',
              actions: assign({origin: undefined, target: undefined}),
              cond: (context: GameContext) => context.deployableTroops == 0,
            },
            'deploy',
          ],
        },
        preAttack: {
          on: {
            SELECT_REGION: selectRegions(true),
            END: {
              target: 'preReinforce',
              actions: assign({origin: undefined, target: undefined}),
            },
          },
        },
        attack: {
          on: {
            SELECT_REGION: selectRegions(true),
            ATTACK: {
              target: 'postAttack',
              actions: assign((context: GameContext, event: AttackEvent) => attack(context, event.automatic)),
            },
            END: {
              target: 'preReinforce',
              actions: assign({origin: undefined, target: undefined}),
            },
          },
        },
        postAttack: {
          always: [
            {
              target: 'reinforceVictory',
              cond: (context: GameContext) => context.regions[context.target].player == 'corey',
            },
            {
              target: 'preAttack',
              actions: assign({origin: undefined, target: undefined}),
              cond: (context: GameContext) => context.regions[context.origin].troops < 2,
            },
            'attack',
          ],
        },
        reinforceVictory: {
          on: {
            REINFORCE: {
              target: 'preAttack',
              actions: [
                assign((context: GameContext, event: ReinforceEvent) => reinforce(context, event.troopCount)),
                assign({origin: undefined, target: undefined}),
              ],
            },
          },
        },
        preReinforce: {
          on: {
            SELECT_REGION: selectRegions(false),
            END: 'end',
          },
        },
        reinforce: {
          on: {
            SELECT_REGION: selectRegions(false),
            REINFORCE: {
              target: 'end',
              actions: assign((context: GameContext, event: ReinforceEvent) => reinforce(context, event.troopCount)),
            },
            END: 'end',
          },
        },
        end: {},
      },
    },
    null,
  )
}

// This seems wrong
const selectRegions = (isAttacking: boolean) => [
  {
    target: isAttacking ? 'preAttack' : 'preReinforce',
    actions: assign({origin: undefined, target: undefined}),
    cond: (context: GameContext, event: SelectRegionEvent) => context.origin == event.region,
  },
  {
    target: isAttacking ? 'attack' : 'reinforce',
    actions: assign((_: any, event: SelectRegionEvent) => ({target: event.region})),
    cond: (context: GameContext, event: SelectRegionEvent) =>
      isValidTarget(context, event.region, isAttacking, !isAttacking),
  },
  {
    target: isAttacking ? 'preAttack' : 'preReinforce',
    actions: assign((_: any, event: SelectRegionEvent) => ({origin: event.region, target: undefined})),
    cond: (context: GameContext, event: SelectRegionEvent) => isValidOrigin(context, event.region),
  },
]

export const isValidOrigin = (context: GameContext, regionName: string) => {
  const v = () => {
    const currentPlayer = CURRENT_PLAYER
    const {origin} = context
    const region = context.regions[regionName]
    if (regionName == origin) return false

    return region.troops > 1 && region.player == currentPlayer
  }
  return v()
}

export const isValidTarget = (
  context: GameContext,
  regionName: string,
  isAttacking: boolean,
  isReinforcing: boolean,
) => {
  const v = () => {
    const currentPlayer = CURRENT_PLAYER
    const {origin, target, regions} = context
    if (!origin) return false
    if (regionName == target) return false
    if (regionName == origin) return false

    if (isAttacking) {
      return regions[regionName].player != currentPlayer
    } else if (isReinforcing) {
      return regions[regionName].player == currentPlayer
    }
  }
  return v()
}

export const attack = (context: GameContext, automatic: boolean) => {
  const {regions, origin, target, rolls} = context

  let attackerCount = regions[origin].troops
  let defenderCount = regions[target].troops
  const newRolls = []
  do {
    const attackerDice = roll(attackerDieCount(attackerCount))
    const defenderDice = roll(defenderDieCount(defenderCount))
    newRolls.push({attackerDice, defenderDice})

    for (let i = 0; i < defenderDice.length; i++) {
      if (defenderDice[i] >= attackerDice[i]) {
        attackerCount--
      } else {
        defenderCount--
      }
    }
  } while (automatic && attackerCount > 0 && defenderCount > 0)

  let updatedRolls = [...rolls, ...newRolls]
  let updatedRegions = {
    ...regions,
    [origin]: {...regions[origin], troops: attackerCount},
    [target]: {...regions[target], troops: defenderCount},
  }

  // VICTORY!
  if (defenderCount == 0) {
    updatedRegions[origin] = {
      ...updatedRegions[origin],
      troops: updatedRegions[origin].troops - 1,
    }
    updatedRegions[target] = {
      ...updatedRegions[target],
      troops: 1,
      player: updatedRegions[origin].player,
    }
  }
  return {rolls: updatedRolls, regions: updatedRegions}
}

const reinforce = (context: GameContext, troops: number) => {
  const {origin, target, regions} = context
  const originRegion = {
    ...regions[origin],
    troops: regions[origin].troops - troops,
  }
  const targetRegion = {
    ...regions[target],
    troops: regions[target].troops + troops,
  }
  const updatedRegions = {
    ...context.regions,
    [origin]: originRegion,
    [target]: targetRegion,
  }
  return {regions: updatedRegions, origin: undefined, target: undefined}
}

const roll = (count: number) => {
  const dice = []
  for (let i = 0; i < count; i++) {
    dice.push(Math.floor(Math.random() * 6) + 1)
  }
  dice.sort().reverse()
  return dice
}

const attackerDieCount = (troopCount: number) => {
  if (troopCount > 3) return 3
  if (troopCount > 2) return 2
  return 1
}

const defenderDieCount = (troopCount: number) => {
  if (troopCount > 1) return 2
  return 1
}

const createRegions = (playerNames: string[]) => {
  const regionInfo: {[key: string]: Region} = {}
  Object.keys(REGION_GRAPH).forEach((name) => {
    const player = ['japan', 'mongolia'].includes(name) ? 'corey' : random(playerNames)
    const troops = Math.ceil(Math.random() * 10) * (player == CURRENT_PLAYER ? 3 : 1)
    regionInfo[name] = {name, player, troops}
  })
  return regionInfo
}

const REGION_GRAPH = {
  eastern_australia: ['western_australia', 'new_guinea'],
  indonesia: ['siam', 'western_australia', 'new_guinea'],
  new_guinea: ['indonesia', 'western_australia', 'eastern_australia'],
  alaska: ['kamchatka', 'alberta', 'northwest_territory'],
  ontario: ['northwest_territory', 'alberta', 'greenland', 'quebec', 'eastern_united_states', 'western_united_states'],
  northwest_territory: ['ontario', 'alberta', 'greenland'],
  venezuela: ['central_america'],
  madagascar: [],
  north_africa: [],
  greenland: ['northwest_territory', 'ontario', 'quebec'],
  iceland: ['greenland'],
  great_britain: [],
  scandinavia: [],
  japan: ['kamchatka', 'mongolia'],
  yakursk: ['kamchatka', 'irkutsk', 'siberia'],
  kamchatka: ['irkutsk', 'mongolia', 'yakursk', 'japan'],
  siberia: ['ural', 'china', 'irkutsk', 'mongolia', 'yakursk'],
  ural: ['ukraine', 'afghanistan', 'china', 'siberia'],
  afghanistan: ['ukraine', 'middle_east', 'india', 'china', 'ural'],
  middle_east: ['ukraine', 'india', 'southern_europe', 'egypt', 'east_africa', 'afghanistan'],
  india: ['middle_east', 'afghanistan', 'china', 'siam'],
  siam: ['indonesia', 'india', 'china'],
  china: ['siam', 'india', 'afghanistan', 'middle_east', 'ural', 'siberia', 'mongolia'],
  mongolia: ['china', 'japan', 'kamchatka', 'irkutsk', 'siberia'],
  irkutsk: ['mongolia', 'kamchatka', 'yakursk', 'siberia'],
  ukraine: ['afghanistan'],
  southern_europe: [],
  western_europe: [],
  northern_europe: [],
  egypt: [],
  east_africa: [],
  congo: [],
  south_africa: [],
  brazil: [],
  argentina: [],
  eastern_united_states: ['ontario', 'quebec', 'western_united_states', 'central_america'],
  western_united_states: ['alberta', 'ontario', 'eastern_united_states', 'central_america'],
  quebec: ['ontario', 'greenland'],
  central_america: ['eastern_united_states', 'western_united_states'],
  peru: [],
  western_australia: ['eastern_australia', 'new_guinea', 'indonesia'],
  alberta: ['northwest_territory', 'ontario', 'eastern_united_states', 'western_united_states'],
}

const CURRENT_PLAYER = 'corey'
