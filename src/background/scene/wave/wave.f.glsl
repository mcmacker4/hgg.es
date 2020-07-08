#version 300 es
precision highp float;

in vec3 _position;
in vec3 _normal;

out vec4 fragColor;

const vec3 sunDir = normalize(vec3(0, -1, -1));

void main() {

    float bright = dot(-sunDir, _normal);

    fragColor = vec4(vec3(bright * 0.6), 1.0);
}