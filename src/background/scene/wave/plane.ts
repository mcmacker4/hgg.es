import { GLContext } from "../../engine";
import { Model } from "../model";
import { vec3 } from "gl-matrix";


export class PlaneModel extends Model {

    constructor(gl: GLContext, width: number, height: number, offset: number) {

        const nx = width + 1
        const ny = height + 1

        const uniqueVertices = new Array<number>(nx * ny * 3)

        for (let j = 0; j < ny; j++) {
            for (let i = 0; i < nx; i++) {
                const idx = (j * nx + i) * 3
                uniqueVertices[idx + 0] = i
                uniqueVertices[idx + 1] = Math.random() * offset
                uniqueVertices[idx + 2] = j
            }
        }

        const squareCount = width * height
        const triangleCount = squareCount * 2
        const indices = new Int32Array(triangleCount * 3)

        for (let i = 0; i < squareCount; i++) {
            const x = i % width;
            const y = Math.floor(i / height)

            const baseIdx = y * nx + x

            indices[i * 6 + 0] = baseIdx + nx
            indices[i * 6 + 1] = baseIdx
            indices[i * 6 + 2] = baseIdx + 1
            indices[i * 6 + 3] = baseIdx + nx
            indices[i * 6 + 4] = baseIdx + 1
            indices[i * 6 + 5] = baseIdx + nx + 1
        }

        const vertices = new Float32Array(indices.length * 3)
        const normals = new Float32Array(indices.length * 3)

        const a = vec3.create()
        const b = vec3.create()
        const c = vec3.create()

        const ba = vec3.create()
        const bc = vec3.create()

        const normal = vec3.create()

        for (let i = 0; i < triangleCount; i++) {

            const aidx = indices[i * 3]
            const bidx = indices[i * 3 + 1]
            const cidx = indices[i * 3 + 2]

            vec3.set(a, uniqueVertices[aidx * 3], uniqueVertices[aidx * 3 + 1], uniqueVertices[aidx * 3 + 2])
            vec3.set(b, uniqueVertices[bidx * 3], uniqueVertices[bidx * 3 + 1], uniqueVertices[bidx * 3 + 2])
            vec3.set(c, uniqueVertices[cidx * 3], uniqueVertices[cidx * 3 + 1], uniqueVertices[cidx * 3 + 2])

            vec3.sub(ba, a, b)
            vec3.sub(bc, c, b)

            vec3.cross(normal, ba, bc)
            vec3.normalize(normal, normal);

            [a, b, c].forEach((v, vi) => {
                let vertexIdx = i * 3 + vi
                vertices[vertexIdx * 3 + 0] = v[0]
                vertices[vertexIdx * 3 + 1] = v[1]
                vertices[vertexIdx * 3 + 2] = v[2]
                normals[vertexIdx * 3 + 0] = normal[0]
                normals[vertexIdx * 3 + 1] = normal[1]
                normals[vertexIdx * 3 + 2] = normal[2]
            })

        }

        super(gl, vertices, normals)

    }

}