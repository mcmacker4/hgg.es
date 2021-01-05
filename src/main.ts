import "./style.scss"

import { Engine } from './engine'
import { ReactiveCubes } from './scenes/reactive-cubes'

const scene = new ReactiveCubes()

const engine = new Engine(scene)

engine.start()
