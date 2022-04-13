export const vertexShader = `
    void main() {
        vec3 transPosition = position;

        // set the z-coords to look wavy
        float distortion = sin(transPosition.x * 5.0);
        transPosition.z = transPosition.z + distortion;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(transPosition, 1.0);
    }
`;
