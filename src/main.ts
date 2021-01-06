import './style.scss'

import {Engine} from './engine'
import {ReactiveCubes} from './scenes/reactive-cubes'

let scene = new ReactiveCubes(10000)
let engine = new Engine(scene)

engine.start().catch(e => console.error(e))

async function setCubeCount(cubes: number) {
    engine.stop()
    scene = new ReactiveCubes(cubes)
    engine = new Engine(scene)
    await engine.start()
}

// @ts-ignore
window._cubez = setCubeCount

