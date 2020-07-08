import { Scene } from './scene'

export type GLContext = WebGL2RenderingContext


export interface Lifecycle {
    onInit(gl: GLContext): void
    onUpdate(delta: number): void
    onRender(gl: GLContext): void
}


export class Engine {

    private canvas: HTMLCanvasElement
    private gl: GLContext

    private scene: Scene
    private lastUpdate: number = Date.now()

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement
        this.gl = this.canvas.getContext('webgl2')

        if (!this.gl) throw new Error("Could not create WebGL2 Rendering Context")

        window.addEventListener('resize', () => this.onCanvasRezie())
    }

    setScene(scene: Scene) {
        this.scene = scene
    }

    // Lifecycle Methods

    start() {
        if (!this.scene)
            throw new Error("No scene set.")
        this.initialize()
        this.nextFrame()
    }

    private initialize() {
        this.gl.clearColor(0, 0, 0, 0)
        this.gl.enable(this.gl.DEPTH_TEST)

        this.scene.onInit(this.gl)
        this.onCanvasRezie()
    }

    private nextFrame() {
        this.update()
        this.render()
        requestAnimationFrame(() => this.nextFrame())
    }

    private update() {
        const now = Date.now()
        const delta = now - this.lastUpdate
        this.scene.onUpdate(delta / 1000)
        this.lastUpdate = now
    }

    private render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
        this.scene.onRender(this.gl)
    }

    // Event Methods

    private onCanvasRezie() {
        const { innerWidth: width, innerHeight: height } = window
        this.canvas.width = width
        this.canvas.height = height
        this.gl.viewport(0, 0, width, height)
        this.scene.onResize(width, height)
    }

}