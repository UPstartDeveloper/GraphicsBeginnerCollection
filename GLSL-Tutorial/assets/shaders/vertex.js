export const vertexShader = `
    void main() {
    vec3 transPosition = position.xyz; 

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transPosition, 1.0);
    }
`;
