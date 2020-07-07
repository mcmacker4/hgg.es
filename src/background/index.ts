import { Engine } from './engine'
import { BackgroundScene } from './scene'

const scene = new BackgroundScene()

const engine = new Engine(scene)

engine.start()
