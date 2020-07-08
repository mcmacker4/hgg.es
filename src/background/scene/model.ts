import { GLContext } from "../engine";
import { VBO } from "../gl/vbo";
import { VAO } from "../gl/vao";


export class Model {

    private vao: VAO
    private vertexCount: number

    constructor(gl: GLContext, vertices: Float32Array, normals: Float32Array) {
        this.vao = new VAO(gl)

        const verticesVBO = new VBO(gl, gl.ARRAY_BUFFER, vertices)
        const normalsVBO = new VBO(gl, gl.ARRAY_BUFFER, normals)

        this.vertexCount = Math.floor(vertices.length / 3)

        this.vao.bind(gl)
        this.vao.attachAttribute(gl, verticesVBO, 0, 3, gl.FLOAT)
        this.vao.attachAttribute(gl, normalsVBO, 1, 3, gl.FLOAT)
        this.vao.unbind(gl)
    }

    render(gl: GLContext) {
        this.vao.bind(gl)
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount)
        this.vao.unbind(gl)
    }

}