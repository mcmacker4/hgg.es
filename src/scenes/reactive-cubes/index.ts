import {mat4, quat, vec2, vec3} from "gl-matrix";
import {createProgram, VAO} from "../../engine/gl";
import {Scene} from "../../engine/scene";

import vertexShaderSrc from './shaders/main.vert'
import fragmentShaderSrc from './shaders/main.frag'

import {cubeVertices, cubeNormals} from '../../models/cube'

interface Cube {
    position: vec3
    rotation: quat
    scale: vec3
}

const rand = (from: number, to: number) => Math.random() * (to - from) + from

export class ReactiveCubes extends Scene {

    private program: WebGLShader | undefined
    private cubeModel: VAO | undefined
    private projectionMatrix: mat4 = mat4.create()

    private cubes: Cube[] = []
    private globalRotation: vec2 = vec2.fromValues(0, 0)

    private canvasSize: vec2 = vec2.fromValues(0, 0)

    private readonly space = 10
    private readonly sensitivity = 0.2

    onInit(gl: WebGL2RenderingContext): void {
        this.program = createProgram(gl, vertexShaderSrc, fragmentShaderSrc)
        this.cubeModel = new VAO(gl, cubeVertices, cubeNormals)


        window.addEventListener("mousemove", (event: MouseEvent) => {
            vec2.set(this.globalRotation, (event.clientY / this.canvasSize[1] - 0.5) * this.sensitivity, (event.clientX / this.canvasSize[0] - 0.5) * this.sensitivity)
        })

        this.cubes = [...Array(200)].map(() => {
            return {
                position: vec3.fromValues(rand(-this.space, this.space), rand(-this.space, this.space), rand(-10, 0)),
                rotation: quat.random(quat.create()),
                scale: vec3.fromValues(0.3, 0.3, 0.3)
            }
        })

        const pos1 = Math.floor(Math.random() * 3)
        const pos2 = [0, 1, 2].filter(p => p !== pos1)[Math.floor(Math.random() * 2)]

        const bright = 30
        
        const lights: { position: vec3, color: vec3 }[] = [
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

    onUpdate(_: number): void {}

    onRender(gl: WebGL2RenderingContext): void {
        gl.useProgram(this.program!)
        this.cubeModel!.bind(gl)

        const projMatLoc = gl.getUniformLocation(this.program!, "projectionMatrix")
        gl.uniformMatrix4fv(projMatLoc, false, this.projectionMatrix)

        const modelMat = mat4.create()
        const modelMatLoc = gl.getUniformLocation(this.program!, "modelMatrix")

        const interMat = mat4.create()
        const position = vec3.create()

        this.cubes?.forEach(cube => {
            vec3.copy(position, cube.position)
            position[0] *= this.canvasSize[0] / this.canvasSize[1]

            mat4.identity(modelMat)
            mat4.rotateX(modelMat, modelMat, this.globalRotation[0])
            mat4.rotateY(modelMat, modelMat, this.globalRotation[1])
            mat4.translate(modelMat, modelMat, position)
            mat4.mul(modelMat, modelMat, mat4.fromQuat(interMat, cube.rotation))
            mat4.scale(modelMat, modelMat, cube.scale)

            gl.uniformMatrix4fv(modelMatLoc, false, modelMat)

            gl.drawArrays(gl.TRIANGLES, 0, this.cubeModel!.vertexCount)
        })

        this.cubeModel!.unbind(gl)
        gl.useProgram(null)
    }

    onResize(width: number, height: number): void {
        vec2.set(this.canvasSize, width, height)

        mat4.perspective(this.projectionMatrix, 80.0 / 180 * Math.PI, width / height, 0.1, 1000)
        mat4.translate(this.projectionMatrix, this.projectionMatrix, vec3.fromValues(0, 0, -5))
    }

}

