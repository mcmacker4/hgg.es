#version 300 es

layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec4 modelMatrix1;
layout (location = 3) in vec4 modelMatrix2;
layout (location = 4) in vec4 modelMatrix3;
layout (location = 5) in vec4 modelMatrix4;

out vec3 _position;
out vec3 _normal;

uniform mat4 projectionMatrix;
uniform mat4 worldMatrix;

void main() {
    mat4 modelMatrix = mat4(modelMatrix1, modelMatrix2, modelMatrix3, modelMatrix4);

    gl_Position = projectionMatrix * worldMatrix * modelMatrix * vec4(position, 1.0);

    _position = (worldMatrix * modelMatrix * vec4(position, 1.0)).xyz;
    _normal = (worldMatrix * modelMatrix * vec4(normal, 0.0)).xyz;
}
