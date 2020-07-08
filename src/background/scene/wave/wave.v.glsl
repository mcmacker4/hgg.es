#version 300 es

layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;

out vec3 _position;
out vec3 _normal;

uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;

void main() {
    gl_Position = projectionMatrix * modelMatrix * vec4(position, 1.0);

    _position = (modelMatrix * vec4(position, 1.0)).xyz;
    _normal = (modelMatrix * vec4(normal, 0.0)).xyz;
}

