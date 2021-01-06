import {mat4, quat, vec2, vec3} from "gl-matrix";
import {createProgram, VAO, VBO} from "../../engine/gl";
import {Scene} from "../../engine/scene";

import vertexShaderSrc from './shaders/main.vert'
import fragmentShaderSrc from './shaders/main.frag'

import {cubeVertices, cubeNormals} from '../../models/cube'
import {WebGLContext} from "../../engine";

interface Cube {
    matrix: mat4
    position: vec3
    rotation: quat
    scale: vec3
}

const rand = (from: number, to: number) => Math.random() * (to - from) + from

export class ReactiveCubes extends Scene {

    private program: WebGLShader | undefined
    private cubeModel: VAO | undefined
    private projectionMatrix: mat4 = mat4.create()

    private matricesBuffers: Float32Array[] = []
    private matricesVBOs: VBO[] = []

    private cubes: Cube[] = []
    private globalRotation: vec2 = vec2.fromValues(0, 0)
    private targetRotation: vec2 = vec2.fromValues(0, 0)
    private worldMatrix = mat4.create()

    private canvasSize: vec2 = vec2.fromValues(0, 0)

    private readonly cubeCount: number
    private readonly space: number = 8
    private readonly depth: number = 10
    private readonly sensitivity: number = 0.2
    private readonly normalSpeed: number = 2.5

    private readonly cubeScale: number = 0.3

    constructor(cubeCount: number = 400) {
        super()
        this.cubeCount = cubeCount
    }

    async onInit(gl: WebGLContext) {
        this.program = createProgram(gl, vertexShaderSrc, fragmentShaderSrc)

        window.addEventListener("mousemove", (event: MouseEvent) => {
            vec2.set(this.targetRotation, (event.clientY / this.canvasSize[1] - 0.5) * this.sensitivity, (event.clientX / this.canvasSize[0] - 0.5) * this.sensitivity)
        })

        const aspect = this.canvasSize[0] / this.canvasSize[1]

        this.cubes = [...Array(this.cubeCount)].map(() => {
            const position = vec3.fromValues(rand(-this.space, this.space), rand(-this.space, this.space), rand(-this.depth, 0))
            const rotation = quat.random(quat.create())
            const scale = vec3.fromValues(this.cubeScale, this.cubeScale, this.cubeScale)
            return {
                position,
                rotation,
                scale,
                matrix: mat4.fromRotationTranslationScale(
                    mat4.create(),
                    rotation,
                    scale,
                    vec3.fromValues(position[0] * aspect, position[1], position[2])
                )
            }
        })

        for (let i = 0; i < 4; i++) {
            this.matricesBuffers[i] = new Float32Array(this.cubeCount * 4)
            this.matricesVBOs![i] = new VBO(gl, gl.ARRAY_BUFFER, null, gl.DYNAMIC_DRAW)
        }
        this.loadModelMatrices(gl)

        this.cubeModel = new VAO(gl, cubeVertices, cubeNormals)
        this.cubeModel.bind(gl)
        // Set up instanced array of matrices
        for (let i = 0; i < 4; i++) {
            this.matricesVBOs![i].bind(gl, gl.ARRAY_BUFFER)
            gl.vertexAttribPointer(2 + i, 4, gl.FLOAT, false, 0, 0)
            gl.enableVertexAttribArray(2 + i)
            this.matricesVBOs![i].unbind(gl, gl.ARRAY_BUFFER)
            gl.vertexAttribDivisor(2 + i, 1)
        }
        this.cubeModel.unbind(gl)

        const pos1 = Math.floor(Math.random() * 3)
        const pos2 = [0, 1, 2].filter(p => p !== pos1)[Math.floor(Math.random() * 2)]

        const bright = 30

        const lights: {position: vec3, color: vec3}[] = [
            {
                position: vec3.fromValues(-4, -4, 10),
                color: [0, 0, 0].map((_, i) => i === pos1 ? 2 : 1).map(n => n * bright) as vec3
                //color: vec3.fromValues(60, 30, 30)
            },
            {
                position: vec3.fromValues(4, 4, 10),
                color: [0, 0, 0].map((_, i) => i === pos1 || i === pos2 ? 2 : 1).map(n => n * bright) as vec3
                //color: vec3.fromValues(30, 60, 60)
            }
        ]

        gl.useProgram(this.program)
        const countLoc = gl.getUniformLocation(this.program, 'lightCount')
        gl.uniform1i(countLoc, lights.length)
        lights.forEach((light, i) => {
            const posLoc = gl.getUniformLocation(this.program!, `lightPositions[${i}]`)
            const colorLoc = gl.getUniformLocation(this.program!, `lightColors[${i}]`)
            gl.uniform3fv(posLoc, light.position)
            gl.uniform3fv(colorLoc, light.color)
        })
        gl.useProgram(null)

    }

    onUpdate(delta: number): void {
        delta = delta > 0.1 ? 0.1 : delta
        const distance = vec2.sub(vec2.create(), this.targetRotation, this.globalRotation)
        const speed = vec2.scale(vec2.create(), distance, this.normalSpeed)
        vec2.scale(speed, speed, delta)
        vec2.add(this.globalRotation, this.globalRotation, speed)

        mat4.identity(this.worldMatrix)
        mat4.rotateX(this.worldMatrix, this.worldMatrix, this.globalRotation[0])
        mat4.rotateY(this.worldMatrix, this.worldMatrix, this.globalRotation[1])
    }

    onRender(gl: WebGLContext): void {
        gl.useProgram(this.program!)
        this.cubeModel!.bind(gl)

        const projMatLoc = gl.getUniformLocation(this.program!, "projectionMatrix")
        gl.uniformMatrix4fv(projMatLoc, false, this.projectionMatrix)

        const worldMatLoc = gl.getUniformLocation(this.program!, "worldMatrix")
        gl.uniformMatrix4fv(worldMatLoc, false, this.worldMatrix)

        gl.drawArraysInstanced(gl.TRIANGLES, 0, this.cubeModel!.vertexCount, this.cubeCount)

        this.cubeModel!.unbind(gl)
        gl.useProgram(null)
    }

    onCleanup(gl: WebGLContext) {
        gl.deleteProgram(this.program!)
        this.cubeModel?.delete(gl)
        this.matricesVBOs.forEach(vbo => vbo.delete(gl))
    }

    onResize(gl: WebGLContext, width: number, height: number): void {
        const aspect = width / height

        vec2.set(this.canvasSize, width, height)

        mat4.perspective(this.projectionMatrix, 80.0 / 180 * Math.PI, aspect, 0.1, 1000)
        mat4.translate(this.projectionMatrix, this.projectionMatrix, vec3.fromValues(0, 0, -5))

        this.cubes.forEach(cube => {
            mat4.fromRotationTranslationScale(
                cube.matrix,
                cube.rotation,
                vec3.fromValues(cube.position[0] * aspect, cube.position[1], cube.position[2]),
                cube.scale
            )
        })

        this.loadModelMatrices(gl)
    }

    private loadModelMatrices(gl: WebGLContext) {
        this.copyCubeMatrices()
        for (let i = 0; i < 4; i++) {
            this.matricesVBOs[i]!.bind(gl, gl.ARRAY_BUFFER)
            gl.bufferData(gl.ARRAY_BUFFER, this.matricesBuffers[i]!, gl.DYNAMIC_DRAW)
            this.matricesVBOs[i]!.unbind(gl, gl.ARRAY_BUFFER)
        }
    }

    private copyCubeMatrices() {
        for (let cube = 0; cube < this.cubes.length; cube++) {
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    this.matricesBuffers[row][cube * 4 + col] = this.cubes[cube].matrix[row * 4 + col]
                }
            }
        }
    }

}
