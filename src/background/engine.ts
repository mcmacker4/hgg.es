import { Scene } from './scene'

export type WebGLContext = WebGL2RenderingContext

export class Engine {

    private canvas: HTMLCanvasElement
    private gl: WebGLContext

    private running: boolean

    private scene: Scene

    constructor(scene: Scene) {
        this.canvas = document.getElementById('background') as HTMLCanvasElement
        this.gl = this.canvas.getContext('webgl2')

        this.scene = scene

        if (!this.gl) throw new Error("Could not create WebGL2 Rendering Context")

        window.addEventListener('resize', () => this.onCanvasRezie())
    }

    // Lifecycle Methods

    start() {
        this.running = true
        this.initialize()
        this.nextFrame()
    }

    private initialize() {
        this.gl.clearColor(0, 0, 0, 0)
        this.gl.enable(this.gl.DEPTH_TEST)
        // this.gl.enable(this.gl.CULL_FACE)

        this.scene.onInit(this.gl)
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