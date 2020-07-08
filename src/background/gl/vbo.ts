import { GLContext } from "../engine";


export class VBO {
    
    private id: WebGLBuffer

    constructor(gl: GLContext, target: number, data: ArrayBufferView) {
        this.id = gl.createBuffer()
        gl.bindBuffer(target, this.id)
        gl.bufferData(target, data, gl.STATIC_DRAW)
        gl.bindBuffer(target, null)
    }

    bind(gl: GLContext, target: number) {
        gl.bindBuffer(target, this.id)
    }

    unbind(gl: GLContext, target: number) {
        gl.bindBuffer(target, null)
    }

}