export const fragmentShader = `
    varying float vDistortion;

    void main() {
        gl_FragColor = vec4(vDistortion, vDistortion, vDistortion, 1.0);
    }
`;
