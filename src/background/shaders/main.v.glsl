#version 300 es

layout (location = 0) in vec3 position;

out vec3 _position;

uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;

void main() {
    gl_Position = projectionMatrix * modelMatrix * vec4(position, 1.0);

    _position = position;
}