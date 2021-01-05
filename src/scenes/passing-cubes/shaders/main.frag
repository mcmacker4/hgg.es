#version 300 es
precision highp float;

in vec3 _position;
in vec3 _normal;

out vec4 fragColor;

uniform vec3 lightPositions[20];
uniform vec3 lightColors[20];

uniform int lightCount;

const vec3 ambient = vec3(0.1);

void main() {

    vec3 normal = normalize(_normal);
    vec3 result = vec3(0);

    for (int i = 0; i < lightCount; i++) {

        vec3 lightPos = lightPositions[i];
        vec3 lightColor = lightColors[i];

        vec3 lightDir = normalize(lightPos - _position);
        
        float lightDist = length(lightPos - _position);
        
        float bright = dot(lightDir, normal) / (lightDist * lightDist);

        result += bright * lightColor;

    }

    fragColor = vec4(max(result, ambient), 1.0);
}