import './style.scss'

import {Engine} from './engine'
import {ReactiveCubes} from './scenes/reactive-cubes'

let scene = new ReactiveCubes()
let engine = new Engine(scene)

engine.start().catch(e => console.error(e))
