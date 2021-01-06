import {WebGLContext} from ".";

export abstract class Scene {

    abstract onInit(gl: WebGLContext): void
    abstract onUpdate(delta: number): void
    abstract onRender(gl: WebGLContext): void

    abstract onResize(gl: WebGLContext, width: number, height: number): void
}
