import { vec3, quat, mat4 } from 'gl-matrix'

import { Scene } from ".."
import { GLContext, Lifecycle } from "../../engine"
import { PlaneModel } from "./plane"
import { Model } from "../model"


import waveVertex from './wave.v.glsl'
import waveFragment from './wave.f.glsl'
import { ShaderProgram } from '../../gl/program'


class Entity implements Lifecycle {

    private model: Model

    readonly position: vec3 = vec3.create()
    readonly rotation: quat = quat.create()
    readonly scale: vec3 = vec3.fromValues(1, 1, 1)

    private matrix: mat4

    constructor(model: Model) {
        this.model = model
        this.matrix = mat4.create()
    }

    onInit(gl: GLContext) {}

    onUpdate(delta: number) {
        mat4.fromRotationTranslationScale(this.matrix, this.rotation, this.position, this.scale)
    }

    onRender(gl: GLContext) {
        this.model.render(gl)
    }

    get modelMatrix(): mat4 {
        return this.matrix
    }

}


export class WaveScene extends Scene {

    private planeEntity: Entity

    private program: ShaderProgram

    private projectionMatrix: mat4

    onInit(gl: GLContext): void {
        const planeModel = new PlaneModel(gl, 50, 50, 0.3)
        this.planeEntity = new Entity(planeModel)

        vec3.set(this.planeEntity.position, -25, -1, -50)

        this.program = new ShaderProgram(gl, waveVertex, waveFragment)

        this.projectionMatrix = mat4.create()
    }

    onUpdate(delta: number): void {
        this.planeEntity.onUpdate(delta)
    }

    onRender(gl: GLContext): void {
        this.program.bind(gl)

        this.program.uniformMat4(gl, 'projectionMatrix', this.projectionMatrix)
        this.program.uniformMat4(gl, 'modelMatrix', this.planeEntity.modelMatrix)

        this.planeEntity.onRender(gl)
        
        this.program.unbind(gl)
    }

    onResize(width: number, height: number) {
        mat4.perspective(this.projectionMatrix, 60 * (Math.PI / 180), width / height, 0.1, 1000)
    }
    
}