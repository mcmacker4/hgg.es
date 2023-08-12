import { Scene } from './scene'

export type WebGLContext = WebGL2RenderingContext

export class Engine {

    private canvas: HTMLCanvasElement
    private readonly gl: WebGLContext

    private running: boolean = false

    private scene: Scene

    private lastUpdate: number = performance.now()
    private lastFps: number = performance.now()
    private frameCount: number = 0

    constructor(scene: Scene) {
        this.canvas = document.getElementById('background') as HTMLCanvasElement

        const gl = this.canvas.getContext('webgl2')

        if (gl === null) {
            const errorNode = document.createElement('p')
            errorNode.className = "error"
            errorNode.innerText = "You're missing out! Looks like your browser does not support WebGL 2.0"
            document.getElementById('main')!.appendChild(errorNode)
            throw new Error("Could not create WebGL2 Rendering Context.")
        }

        console.log(gl.getParameter(gl.VENDOR))
        console.log(gl.getParameter(gl.VERSION))
        console.log(gl.getParameter(gl.SHADING_LANGUAGE_VERSION))

        this.gl = gl

        this.scene = scene

        window.addEventListener('resize', () => this.onCanvasResize())
    }

    // Lifecycle Methods

    async start() {
        this.running = true
        await this.initialize()
        this.nextFrame()
    }

    private async initialize() {
        this.gl.clearColor(0, 0, 0, 0)
        this.gl.enable(this.gl.DEPTH_TEST)
        this.gl.enable(this.gl.CULL_FACE)
        await this.scene.onInit(this.gl)
        this.onCanvasResize()
    }

    private nextFrame() {
        if (this.running) {
            this.update()
            this.render()
            requestAnimationFrame(() => this.nextFrame())
        }
    }

    private update() {
        const now = performance.now()
        const delta = (now - this.lastUpdate) / 1000
        this.scene.onUpdate(delta)
        this.lastUpdate = now

        //@ts-ignore
        if (process.env.NODE_ENV === 'development') {
            this.frameCount += 1
            if (now > this.lastFps + 1000) {
                this.lastFps = now
                console.log(`FPS: ${this.frameCount}`)
                this.frameCount = 0
            }
        }
    }

    private render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
        this.scene.onRender(this.gl)
    }

    stop() {
        this.running = false
        this.scene.onCleanup(this.gl)
    }

    // Event Methods

    private onCanvasResize() {
        const { innerWidth: width, innerHeight: height } = window
        this.canvas.width = width
        this.canvas.height = height
        this.gl.viewport(0, 0, width, height)
        this.scene.onResize(this.gl, width, height)
    }

}
