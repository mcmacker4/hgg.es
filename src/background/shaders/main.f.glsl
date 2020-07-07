#version 300 es
precision highp float;

in vec3 _position;

out vec4 fragColor;

void main() {
    fragColor = vec4(_position + 0.5, 1.0);
}