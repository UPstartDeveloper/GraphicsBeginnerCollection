// A: get a WebGL 1.0 rendering context
const canvas = document.getElementById("c");
const gl = canvas.getContext('webgl');

if (!gl) {
    throw new Error("Sorry, your browser doesn't support WebGL 1.0.");
}

alert(`Everything all good with WebGL!`);

/********************** THE SPINNNING CUBE *************************/
// 1) define vertices
const vertexData = [
    // Front
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    -.5, -.5, 0.5,

    // Left
    -.5, 0.5, 0.5,
    -.5, -.5, 0.5,
    -.5, 0.5, -.5,
    -.5, 0.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, -.5,

    // Back
    -.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, 0.5, -.5,
    0.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, -.5, -.5,

    // Right
    0.5, 0.5, -.5,
    0.5, -.5, -.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    0.5, -.5, -.5,

    // Top
    0.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, -.5,

    // Bottom
    0.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, -.5,
];

/**
 * Random RGB value generator.
 * @returns Array of numbers
 */
function randomColor() {
    return [Math.random(), Math.random(), Math.random()]
}

// 2) define colors for each vertex
let colorData = [];
for (let face = 0; face < 6; face++) {
    let color = randomColor();
    for (let faceVertex = 0; faceVertex < 6; faceVertex++) {
        colorData.push(...color);
    }
}

// 3) create buffers
const posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
                            // the 3rd arg helps the GPU optimize for redrawing (or not)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

// 4) create vertex shader
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
    precision mediump float;    // mediump works more broadly across devices

    attribute vec3 position;
    attribute vec3 color;
    varying vec3 vColor;

    uniform mat4 matrix;

    void main() {
        vColor = color;  // what color THIS vertex will have
        gl_Position = matrix * vec4(position, 1);
    }
`);
gl.compileShader(vertexShader);

// 5) create fragment shader 
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
    precision mediump float;
    varying vec3 vColor;
    void main() {
        gl_FragColor = vec4(vColor, 1); // this is hardcoding a color across ALL pixels
    }
`);
gl.compileShader(fragmentShader);

// 6) create program
const program = gl.createProgram();

// 7) attach shaders to program
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program); // ???

// 8) enable vertex attrs for position and color
const positionLocation = gl.getAttribLocation(program, `position`);  // the string comes from our attribute in the GLSL above!
gl.enableVertexAttribArray(positionLocation);  // attrs are disabled by default 
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);  // re-bind, the last array to be bound to the buffer has color data, not positions
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

const colorLocation = gl.getAttribLocation(program, `color`);  // the string comes from our attribute in the GLSL above!
gl.enableVertexAttribArray(colorLocation);  // attrs are disabled by default 
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

gl.useProgram(program); // creates an exec on the GPU

// 9) pull in uniforms
const uniformLocations = {
    matrix: gl.getUniformLocation(program, `matrix`),
};

// make sure to enable the depth buffer - the color in front should be shown, occlude what's behind
gl.enable(gl.DEPTH_TEST);

// 10) apply transformations!
const matrix = glMatrix.mat4.create();  // 4x4 Identity matrix, does NOT need to be init'd at the bottom
glMatrix.mat4.translate(matrix, matrix, [.2, .5, 0]);
glMatrix.mat4.scale(matrix, matrix, [.25, .25, 1]);
console.log(matrix);

// 11) animations, anyone?
const animate = () => {
    requestAnimationFrame(animate);
    glMatrix.mat4.rotateZ(matrix, matrix, Math.PI/2 / 70);  // rotating by 90 deg
    glMatrix.mat4.rotateX(matrix, matrix, Math.PI/2 / 70);  // rotating by 90 deg
    glMatrix.mat4.rotateY(matrix, matrix, -Math.PI/2 / 50);  // rotating by 90 deg
    // use matrix values to set uniform vars (false = no transposing)
    gl.uniformMatrix4fv(uniformLocations.matrix, false, matrix);
    // 12) draw!!
    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);  // divide by 3 --> draw 12 tris
}

animate();
