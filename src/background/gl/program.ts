import { GLContext } from "../engine"
import { mat4 } from "gl-matrix"



export class ShaderProgram {

    private id: WebGLProgram

    private locations: Map<string, number> = new Map()

    constructor(gl: GLContext, vertexSrc: string, fragmentSrc: string) {
        this.id = gl.createProgram()

        const vShader = this.createShader(gl, gl.VERTEX_SHADER, vertexSrc)
        const fShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentSrc)

        gl.attachShader(this.id, vShader)
        gl.attachShader(this.id, fShader)

        gl.linkProgram(this.id)
        if (!gl.getProgramParameter(this.id, gl.LINK_STATUS)) {
            throw new Error("Could not compile shader.\n" + gl.getProgramInfoLog(this.id))
        }

        gl.validateProgram(this.id)
        if (!gl.getProgramParameter(this.id, gl.VALIDATE_STATUS)) {
            throw new Error("Could not compile shader.\n" + gl.getProgramInfoLog(this.id))
        }
    }

    private createShader(gl: GLContext, type: number, source: string): WebGLShader {
        const shader = gl.createShader(type)
        gl.shaderSource(shader, source)
        
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error("Could not compile shader.\n" + gl.getShaderInfoLog(shader))
        }

        return shader
    }

    uniformMat4(gl: GLContext, name: string, value: mat4) {
        const loc = this.getLocation(gl, name)
        gl.uniformMatrix4fv(loc, false, value)
    }

    private getLocation(gl: GLContext, name: string) {
        if (this.locations.has(name)) {
            return this.locations.get(name)
        } else {
            const loc = gl.getUniformLocation(this.id, name)
            this.locations[name] = loc
            return loc
        }
    }

    bind(gl: GLContext) {
        gl.useProgram(this.id)
    }

    unbind(gl: GLContext) {
        gl.useProgram(null)
    }

}