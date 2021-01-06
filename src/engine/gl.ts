import {WebGLContext} from "."

export class VBO {

    private id: WebGLBuffer

    constructor(gl: WebGLContext, target: number, data: Float32Array | Int32Array | null, usage: number = gl.STATIC_DRAW) {
        const id = gl.createBuffer()
        if (id === null) throw new Error("Could not create Buffer.")

        this.id = id

        if (data !== null) {
            this.bind(gl, target)
            gl.bufferData(target, data, usage)
            this.unbind(gl, target)
        }
    }

    bind(gl: WebGLContext, target: number) {
        gl.bindBuffer(target, this.id)
    }

    unbind(gl: WebGLContext, target: number) {
        gl.bindBuffer(target, null)
    }

}

export class VAO {

    private id: WebGLVertexArrayObject
    readonly vertexCount: number

    constructor(gl: WebGLContext, vertices: Float32Array, normals: Float32Array) {
        const id = gl.createVertexArray()
        if (id === null) throw new Error("Could not create Vertex Array.")

        this.id = id

        this.bind(gl)

        // this.addIndices(gl, indices)
        this.addAttribute(gl, vertices, 0, 3, gl.FLOAT)
        this.addAttribute(gl, normals, 1, 3, gl.FLOAT)

        // this.vertexCount = indices.length
        this.vertexCount = Math.floor(vertices.length / 3)

        this.unbind(gl)
    }

    private addAttribute(gl: WebGLContext, data: Float32Array, index: number, size: number, type: number, normalized: boolean = false, stride: number = 0, offset: number = 0) {
        const vbo = new VBO(gl, gl.ARRAY_BUFFER, data)
        vbo.bind(gl, gl.ARRAY_BUFFER)
        gl.vertexAttribPointer(index, size, type, normalized, stride, offset)
        gl.enableVertexAttribArray(index)
        vbo.unbind(gl, gl.ARRAY_BUFFER)
    }

    bind(gl: WebGLContext) {
        gl.bindVertexArray(this.id)
    }

    unbind(gl: WebGLContext) {
        gl.bindVertexArray(null)
    }

}

export function createShader(gl: WebGLContext, type: number, src: string): WebGLShader {
    const shader = gl.createShader(type)

    if (shader === null) throw new Error("Could not create shader.")

    gl.shaderSource(shader, src)

    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error(`Shader Compilation Error (${type == gl.VERTEX_SHADER ? 'vertex' : 'fragment'}).\n` + gl.getShaderInfoLog(shader))

    return shader
}

export function createProgram(gl: WebGLContext, vsrc: string, fsrc: string): WebGLProgram {
    const program = gl.createProgram()

    if (program === null) throw new Error("Could not create program.")

    const vshader = createShader(gl, gl.VERTEX_SHADER, vsrc)
    const fshader = createShader(gl, gl.FRAGMENT_SHADER, fsrc)

    gl.attachShader(program, vshader)
    gl.attachShader(program, fshader)

    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error('Error linking program.\n' + gl.getProgramInfoLog(program))

    gl.validateProgram(program)
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS))
        throw new Error('Error validating program.\n' + gl.getProgramInfoLog(program))

    return program
}
