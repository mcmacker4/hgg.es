import { WebGLContext, Engine } from "./engine";
import { vec3, quat, mat4 } from 'gl-matrix'

import vertexShaderSrc from './shaders/main.v.glsl'
import fragmentShaderSrc from './shaders/main.f.glsl'

export abstract class Scene {

    abstract onInit(gl: WebGLContext): void
    abstract onUpdate(): void
    abstract onRender(gl: WebGLContext): void

    onResize(width: number, height: number) {}

}

const cubeIndices = Int32Array.from([
    0, 1, 2
])

const cubeVertices = Float32Array.from([
    -0.5, -0.5, 0.0,
     0.5, -0.5, 0.0,
     0.0,  0.5, 0.0,
])

class VBO {

    private id: WebGLBuffer

    constructor(gl: WebGLContext, target: number, data: Float32Array | Int32Array) {
        this.id = gl.createBuffer()

        this.bind(gl, target)
        gl.bufferData(target, data, gl.STATIC_DRAW)
        this.unbind(gl, target)
    }

    bind(gl: WebGLContext, target: number) {
        gl.bindBuffer(target, this.id)
    }

    unbind(gl: WebGLContext, target: number) {
        gl.bindBuffer(target, null)
    }

}

class VAO {

    private id: WebGLVertexArrayObject
    readonly vertexCount: number

    constructor(gl: WebGLContext, indices: Int32Array, vertices: Float32Array) {
        this.id = gl.createVertexArray()

        const indicesVBO = new VBO(gl, gl.ELEMENT_ARRAY_BUFFER, indices)
        const verticesVBO = new VBO(gl, gl.ARRAY_BUFFER, vertices)

        this.bind(gl)

        indicesVBO.bind(gl, gl.ELEMENT_ARRAY_BUFFER)

        verticesVBO.bind(gl, gl.ARRAY_BUFFER)
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(0)
        verticesVBO.unbind(gl, gl.ARRAY_BUFFER)

        this.vertexCount = indices.length

        this.unbind(gl)
    }

    bind(gl: WebGLContext) {
        gl.bindVertexArray(this.id)
    }

    unbind(gl: WebGLContext) {
        gl.bindVertexArray(null)
    }

}

class Cube {

    readonly model: VAO

    position: vec3
    rotation: quat
    scale: vec3

    readonly matrix = mat4.create()

    constructor(model: VAO) {
        this.model = model;
        this.position = vec3.create()
        this.rotation = quat.create()
        this.scale = vec3.fromValues(1, 1, 1)
    }

    onUpdate() {
        quat.rotateY(this.rotation, this.rotation, Math.PI / 80)
        mat4.fromRotationTranslationScale(this.matrix, this.rotation, this.position, this.scale)
    }

    get modelMatrix(): mat4 {
        return this.matrix
    }

}

function createShader(gl: WebGLContext, type: number, src: string): WebGLShader {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, src)

    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error(`Shader Compilation Error (${type == gl.VERTEX_SHADER ? 'vertex' : 'fragment'}).\n` + gl.getShaderInfoLog(shader))

    return shader
}

function createProgram(gl: WebGLContext, vsrc: string, fsrc: string): WebGLProgram {
    const program = gl.createProgram()

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

export class BackgroundScene extends Scene {

    private program: WebGLShader
    private cube: Cube

    private projectionMatrix: mat4

    onInit(gl: WebGLContext): void {
        this.program = createProgram(gl, vertexShaderSrc, fragmentShaderSrc)

        this.projectionMatrix = mat4.create()

        const model = new VAO(gl, cubeIndices, cubeVertices)
        this.cube = new Cube(model)

        this.cube.position = vec3.fromValues(0, 0, -2)
    }

    onUpdate(): void {
        this.cube.onUpdate()
    }

    onRender(gl: WebGLContext): void {

        gl.useProgram(this.program)

        const { model } = this.cube

        const locations = {
            projectionMatrix: gl.getUniformLocation(this.program, 'projectionMatrix'),
            modelMatrix: gl.getUniformLocation(this.program, 'modelMatrix')
        }

        gl.uniformMatrix4fv(locations.projectionMatrix, false, this.projectionMatrix)
        gl.uniformMatrix4fv(locations.modelMatrix, false, this.cube.modelMatrix)

        model.bind(gl)
        gl.drawElements(gl.TRIANGLES, model.vertexCount, gl.UNSIGNED_INT, 0)
        model.unbind(gl)

        gl.useProgram(null)

    }

    onResize(width: number, height: number) {
        mat4.perspective(this.projectionMatrix, 70.0 * (Math.PI / 180), width / height, 0.1, 1000)
    }

}