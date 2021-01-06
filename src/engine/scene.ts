import {WebGLContext} from ".";

export abstract class Scene {

    abstract onInit(gl: WebGLContext): Promise<void>
    abstract onUpdate(delta: number): void
    abstract onRender(gl: WebGLContext): void
    abstract onCleanup(gl: WebGLContext): void

    abstract onResize(gl: WebGLContext, width: number, height: number): void
}
