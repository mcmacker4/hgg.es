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



/*
    Index Position of each vertex in the cubeVertices array

    4                     7
    - - - - - - - - - - - -
    | \                   | \
    |   \                 |   \
    |     \               |     \
    |       \ 0           |       \ 3
    |         - - - - - - - - - - - -
    |         |           |         |
    |         |           |         |
    |         |           |         |
    |         |           |         |
    - - - - - | - - - - - -         |
    5 \       |           6 \       |
        \     |               \     |
          \   |                 \   |
            \ |                   \ |
              - - - - - - - - - - - -
              1                     2
*/

// const cubeVertices = Float32Array.from([
//     -1,  1,  1, // 0
//     -1, -1,  1, // 1
//      1, -1,  1, // 2
//      1,  1,  1, // 3
//     -1,  1, -1, // 4
//     -1, -1, -1, // 5
//      1, -1, -1, // 6
//      1,  1, -1, // 7
// ])

// const cubeIndices = Int32Array.from([
//     0, 1, 2, 0, 2, 3, // Front
//     3, 2, 6, 3, 6, 7, // Right
//     7, 6, 5, 7, 5, 4, // Back
//     4, 5, 1, 4, 1, 0, // Left
//     4, 0, 3, 4, 3, 7, // Top
//     1, 5, 6, 1, 6, 2  // Bottom
// ])

const cubeVertices = Float32Array.from([
    -1,  1,  1, // 0
    -1, -1,  1, // 1
    1, -1,  1, // 2
    -1,  1,  1, // 0
    1, -1,  1, // 2
    1,  1,  1, // 3

    1,  1,  1, // 3
    1, -1,  1, // 2
    1, -1, -1, // 6
    1,  1,  1, // 3
    1, -1, -1, // 6
    1,  1, -1, // 7

    1,  1, -1, // 7
    1, -1, -1, // 6
    -1, -1, -1, // 5
    1,  1, -1, // 7
    -1, -1, -1, // 5
    -1,  1, -1, // 4

    -1,  1, -1, // 4
    -1, -1, -1, // 5
    -1, -1,  1, // 1
    -1,  1, -1, // 4
    -1, -1,  1, // 1
    -1,  1,  1, // 0

    -1,  1, -1, // 4
    -1,  1,  1, // 0
    1,  1,  1, // 3
    -1,  1, -1, // 4
    1,  1,  1, // 3
    1,  1, -1, // 7

    -1, -1,  1, // 1
    -1, -1, -1, // 5
    1, -1, -1, // 6
    -1, -1,  1, // 1
    1, -1, -1, // 6
    1, -1,  1, // 2
])

const cubeNormals = Float32Array.from([
    // Front
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    // Right
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    // Back
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    // Left
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    // Top
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    // Bottom
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
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

    constructor(gl: WebGLContext, vertices: Float32Array, normals: Float32Array) {
        this.id = gl.createVertexArray()

        this.bind(gl)

        // this.addIndices(gl, indices)
        this.addAttribute(gl, vertices, 0, 3, gl.FLOAT)
        this.addAttribute(gl, normals, 1, 3, gl.FLOAT)

        // this.vertexCount = indices.length
        this.vertexCount = Math.floor(vertices.length / 3)

        this.unbind(gl)
    }

    private addIndices(gl: WebGLContext, indices: Int32Array) {
        const vbo = new VBO(gl, gl.ELEMENT_ARRAY_BUFFER, indices)
        vbo.bind(gl, gl.ELEMENT_ARRAY_BUFFER)
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

class Entity {

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
        mat4.fromRotationTranslationScale(this.matrix, this.rotation, this.position, this.scale)
    }

    get modelMatrix(): mat4 {
        return this.matrix
    }

}

class Cube extends Entity {

    readonly speed: vec3

    constructor(model: VAO, speed: vec3) {
        super(model)
        this.speed = vec3.scale(vec3.create(), speed, 0.1)
    }

    onUpdate() {
        vec3.add(this.position, this.position, this.speed)
        super.onUpdate()
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

interface Light {
    position: vec3
    color: vec3
}

export class BackgroundScene extends Scene {

    private program: WebGLShader

    private cubeModel: VAO
    private cubes: Cube[]

    private projectionMatrix: mat4

    private lastCubeTime: number = Date.now()

    onInit(gl: WebGLContext): void {
        this.program = createProgram(gl, vertexShaderSrc, fragmentShaderSrc)

        this.projectionMatrix = mat4.create()

        this.cubeModel = new VAO(gl, cubeVertices, cubeNormals)
        this.cubes = [...Array(60)].map((_, i) => {
            const cube = new Cube(this.cubeModel, vec3.fromValues(Math.random() < 0.5 ? -0.2 : 0.2, 0, 0))
            cube.position = vec3.fromValues(Math.random() * 20 - 10, Math.random() * 3 - 1.5, Math.random() * 3 - 5)
            cube.scale = vec3.fromValues(0.1, 0.1,  0.1)
            cube.rotation = quat.fromEuler(cube.rotation, Math.random() * 180, Math.random() * 180, Math.random() * 180)
            return cube
        })

        const lights = [
            {
                position: vec3.fromValues(-4, -4, 0),
                color: vec3.fromValues(20, 10, 10)
            },
            {
                position: vec3.fromValues(4, 4, 0),
                color: vec3.fromValues(20, 10, 20)
            }
        ]

        gl.useProgram(this.program)
        const countLoc = gl.getUniformLocation(this.program, 'lightCount')
        gl.uniform1i(countLoc, lights.length)
        lights.forEach((light, i) => {
            const posLoc = gl.getUniformLocation(this.program, `lightPositions[${i}]`)
            const colorLoc = gl.getUniformLocation(this.program, `lightColors[${i}]`)
            gl.uniform3fv(posLoc, light.position)
            gl.uniform3fv(colorLoc, light.color)
        })
        gl.useProgram(null)

    }

    onUpdate(): void {
        const now = Date.now()

        if (now > this.lastCubeTime + 200) {
            let cube: Cube
            if (Math.random() < 0.5) {
                // From the left, positive speed
                const speed = vec3.fromValues(0.2, 0, 0)
                cube = new Cube(this.cubeModel, speed)
                cube.position = vec3.fromValues(-10, Math.random() * 3 - 1.5, Math.random() * 3 - 5)
                cube.scale = vec3.fromValues(0.1, 0.1,  0.1)
                cube.rotation = quat.fromEuler(cube.rotation, Math.random() * 180, Math.random() * 180, Math.random() * 180)
            } else {
                const speed = vec3.fromValues(-0.2, 0, 0)
                cube = new Cube(this.cubeModel, speed)
                cube.position = vec3.fromValues(10, Math.random() * 3 - 1.5, Math.random() * 3 - 5)
                cube.scale = vec3.fromValues(0.1, 0.1,  0.1)
                cube.rotation = quat.fromEuler(cube.rotation, Math.random() * 180, Math.random() * 180, Math.random() * 180)
            }

            this.cubes = this.cubes.filter(cube => (cube.speed[0] > 0 && cube.position[0] < 10) || (cube.speed[0] < 0 && cube.position[0] > -10))

            this.cubes.push(cube)
            this.lastCubeTime = now

            console.log(this.cubes.length)
        }

        this.cubes.forEach(cube => cube.onUpdate())
    }

    onRender(gl: WebGLContext): void {

        gl.useProgram(this.program)

        this.cubes.forEach(cube => {

            const locations = {
                projectionMatrix: gl.getUniformLocation(this.program, 'projectionMatrix'),
                modelMatrix: gl.getUniformLocation(this.program, 'modelMatrix')
            }

            gl.uniformMatrix4fv(locations.projectionMatrix, false, this.projectionMatrix)
            gl.uniformMatrix4fv(locations.modelMatrix, false, cube.modelMatrix)

            cube.model.bind(gl)
            // gl.drawElements(gl.TRIANGLES, cube.model.vertexCount, gl.UNSIGNED_INT, 0)
            gl.drawArrays(gl.TRIANGLES, 0, cube.model.vertexCount)
            cube.model.unbind(gl)

        })

        gl.useProgram(null)

    }

    onResize(width: number, height: number) {
        mat4.perspective(this.projectionMatrix, 50.0 * (Math.PI / 180), width / height, 0.1, 1000)
    }

}