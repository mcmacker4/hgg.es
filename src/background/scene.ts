import { WebGLContext } from "../engine";
import { vec3, quat, mat4 } from 'gl-matrix'

import vertexShaderSrc from './shaders/main.vert'
import fragmentShaderSrc from './shaders/main.frag'
import {createProgram, VAO} from "../engine/gl";
import {Scene} from "../engine/scene";


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

    onUpdate(_: number) {
        mat4.fromRotationTranslationScale(this.matrix, this.rotation, this.position, this.scale)
    }

    get modelMatrix(): mat4 {
        return this.matrix
    }

}

class Cube extends Entity {

    readonly speed: vec3
    private posDelta: vec3

    constructor(model: VAO, speed: vec3) {
        super(model)
        this.speed = speed
        this.posDelta = vec3.create()
    }

    onUpdate(delta: number) {
        vec3.scale(this.posDelta, this.speed, delta)
        vec3.add(this.position, this.position, this.posDelta)
        super.onUpdate(delta)
    }

}

interface Light {
    position: vec3
    color: vec3
}

export class BackgroundScene extends Scene {

    private program: WebGLShader | undefined

    private cubeModel: VAO | undefined
    private cubes: Cube[] | undefined

    private projectionMatrix: mat4 | undefined

    private cubeDelta: number = 0
    
    private softCubeLimit = 100
    private cubeSpeed: number = 0.5
    private totalDistance: number = 20
    private cubeRate: number = this.totalDistance / (this.cubeSpeed * this.softCubeLimit)

    onInit(gl: WebGLContext): void {
        this.program = createProgram(gl, vertexShaderSrc, fragmentShaderSrc)

        this.projectionMatrix = mat4.create()

        this.cubeModel = new VAO(gl, cubeVertices, cubeNormals)
        this.cubes = [...Array(this.softCubeLimit)].map(() => {
            const cube = new Cube(this.cubeModel!, vec3.fromValues(Math.random() < 0.5 ? -this.cubeSpeed : this.cubeSpeed, 0, 0))
            cube.position = vec3.fromValues((Math.random() - 0.5) * this.totalDistance, (Math.random() - 0.5) * 3, Math.random() * 3 - 5)
            cube.scale = vec3.fromValues(0.1, 0.1,  0.1)
            cube.rotation = quat.fromEuler(cube.rotation, Math.random() * 180, Math.random() * 180, Math.random() * 180)
            return cube
        })

        const lights: Light[] = [
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
            const posLoc = gl.getUniformLocation(this.program!, `lightPositions[${i}]`)
            const colorLoc = gl.getUniformLocation(this.program!, `lightColors[${i}]`)
            gl.uniform3fv(posLoc, light.position)
            gl.uniform3fv(colorLoc, light.color)
        })
        gl.useProgram(null)

    }

    onUpdate(delta: number): void {
        this.cubeDelta += delta;
        if (this.cubeDelta > this.cubeRate) {
            let cube: Cube
            if (Math.random() < 0.5) {
                // From the left, positive speed
                const speed = vec3.fromValues(this.cubeSpeed, 0, 0)
                cube = new Cube(this.cubeModel!, speed)
                cube.position = vec3.fromValues(-10, (Math.random() - 0.5) * 3, Math.random() * 3 - 5)
                cube.scale = vec3.fromValues(0.1, 0.1,  0.1)
                cube.rotation = quat.fromEuler(cube.rotation, Math.random() * 180, Math.random() * 180, Math.random() * 180)
            } else {
                const speed = vec3.fromValues(-this.cubeSpeed, 0, 0)
                cube = new Cube(this.cubeModel!, speed)
                cube.position = vec3.fromValues(10, (Math.random() - 0.5) * 3, Math.random() * 3 - 5)
                cube.scale = vec3.fromValues(0.1, 0.1,  0.1)
                cube.rotation = quat.fromEuler(cube.rotation, Math.random() * 180, Math.random() * 180, Math.random() * 180)
            }

            this.cubes = this.cubes!.filter(cube => (cube.speed[0] > 0 && cube.position[0] < this.totalDistance / 2) || (cube.speed[0] < 0 && cube.position[0] > -(this.totalDistance / 2)))

            this.cubes.push(cube)
            this.cubeDelta = this.cubeDelta % this.cubeRate

        }

        this.cubes!.forEach(cube => cube.onUpdate(delta))
    }

    onRender(gl: WebGLContext): void {

        gl.useProgram(this.program!)

        this.cubes!.forEach(cube => {

            const locations = {
                projectionMatrix: gl.getUniformLocation(this.program!, 'projectionMatrix'),
                modelMatrix: gl.getUniformLocation(this.program!, 'modelMatrix')
            }

            gl.uniformMatrix4fv(locations.projectionMatrix, false, this.projectionMatrix!)
            gl.uniformMatrix4fv(locations.modelMatrix, false, cube.modelMatrix)

            cube.model.bind(gl)
            // gl.drawElements(gl.TRIANGLES, cube.model.vertexCount, gl.UNSIGNED_INT, 0)
            gl.drawArrays(gl.TRIANGLES, 0, cube.model.vertexCount)
            cube.model.unbind(gl)

        })

        gl.useProgram(null)

    }

    onResize(width: number, height: number) {
        mat4.perspective(this.projectionMatrix!, 50.0 * (Math.PI / 180), width / height, 0.1, 1000)
    }

}
