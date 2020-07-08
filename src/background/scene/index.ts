import { Lifecycle, GLContext, Engine } from "../engine";


export abstract class Scene implements Lifecycle {

    abstract onInit(gl: GLContext): void
    abstract onUpdate(delta: number): void
    abstract onRender(gl: GLContext): void

    onResize(width: number, height: number): void {}

}