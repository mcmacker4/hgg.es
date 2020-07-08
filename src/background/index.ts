import { Engine } from './engine'
import { WaveScene } from './scene/wave'


const engine = new Engine('background')

engine.setScene(new WaveScene())
engine.start()
