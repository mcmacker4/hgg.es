import { Scene } from './scene'

export type WebGLContext = WebGL2RenderingContext

export class Engine {

    private canvas: HTMLCanvasElement
    private ctx: WebGLContext

    private running: boolean

    private scene: Scene

    constructor(scene: Scene) {
        this.canvas = document.getElementById('background') as HTMLCanvasElement
        this.ctx = this.canvas.getContext('webgl2')

        this.scene = scene

        if (!this.ctx) throw new Error("Could not create WebGL2 Rendering Context")

        window.addEventListener('resize', () => this.onCanvasRezie())
    }

    // Lifecycle Methods

    start() {
        this.running = true
        this.initialize()
        this.nextFrame()
    }

    private initialize() {
        this.ctx.clearColor(0, 0, 0, 0)
        this.scene.onInit(this.ctx)
        this.onCanvasRezie()
    }

    private nextFrame() {
        if (this.running) {
            this.update()
            this.render()
            requestAnimationFrame(() => this.nextFrame())
        }
    }

    private update() {
        this.scene.onUpdate()
    }

    private render() {
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT)
        this.scene.onRender(this.ctx)
    }

    // Event Methods

    private onCanvasRezie() {
        const { innerWidth: width, innerHeight: height } = window
        this.canvas.width = width
        this.canvas.height = height
        this.ctx.viewport(0, 0, width, height)
        this.scene.onResize(width, height)
    }

}