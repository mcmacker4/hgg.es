import { GLContext } from "../engine";
import { VBO } from "./vbo";


export class VAO {
    
    private id: WebGLVertexArrayObject

    constructor(gl: GLContext) {
        this.id = gl.createVertexArray()
    }

    attachAttribute(gl: GLContext, vbo: VBO, index: number, size: number, type: number, normalized: boolean = false, stride: number = 0, offset: number = 0) {
        vbo.bind(gl, gl.ARRAY_BUFFER)
        gl.vertexAttribPointer(index, size, type, normalized, stride, offset)
        gl.enableVertexAttribArray(index)
        vbo.unbind(gl, gl.ARRAY_BUFFER)
    }

    bind(gl: GLContext) {
        gl.bindVertexArray(this.id)
    }

    unbind(gl: GLContext) {
        gl.bindVertexArray(this.id)
    }

}