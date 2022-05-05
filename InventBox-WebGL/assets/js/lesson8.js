// A: get a WebGL 1.0 rendering context
const canvas = document.getElementById("c");
const gl = canvas.getContext('webgl');

if (!gl) {
    throw new Error("Sorry, your browser doesn't support WebGL 1.0.");
}

/********************** The VIEW MATRIX *************************/
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
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

// 4) create vertex shader
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
    precision mediump float;

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
        gl_FragColor = vec4(vColor, 1);
    }
`);
gl.compileShader(fragmentShader);
console.log(gl.getShaderInfoLog(fragmentShader));

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
// make sure to enable the depth buffer - the color in front should be shown, occlude what's behind
gl.enable(gl.DEPTH_TEST);

// 9) pull in uniforms
const uniformLocations = {
    matrix: gl.getUniformLocation(program, `matrix`),
};

// 10) apply transformations!
const modelMatrix = glMatrix.mat4.create();
const viewMatrix = glMatrix.mat4.create();
const projectionMatrix = glMatrix.mat4.create();
glMatrix.mat4.perspective(
    projectionMatrix, 
    75 * Math.PI/180,  // vertical FOV (angle in radians)
    canvas.width/canvas.height,  // aspect W/H ratio
    1e-4,  // "near", aka culling distance
    1e4 // "far" cull plane
)

const mvMatrix = glMatrix.mat4.create();  // short for "model view matrix" - just an intermediary reprsentation, 
                                          // b/c we can only multiply 2 matrices at a time
const mvpMatrix = glMatrix.mat4.create(); // this is the final matrix to render - composite of the "model", "view", and "perspective" transforms

glMatrix.mat4.translate(modelMatrix, modelMatrix, [-1.5, 0, -2]);
glMatrix.mat4.translate(viewMatrix, viewMatrix, [-3, 0, 1]);
glMatrix.mat4.invert(viewMatrix, viewMatrix);

// 11) animations, anyone?
function animate() {
    requestAnimationFrame(animate);
    // glMatrix.mat4.rotateZ(matrix, matrix, Math.PI/2 / 70);  // rotating by 90 deg
    // glMatrix.mat4.rotateX(matrix, matrix, Math.PI/2 / 70);  // rotating by 90 deg
    glMatrix.mat4.rotateY(modelMatrix, modelMatrix, -Math.PI/2 / 50);  // rotating by 90 deg
    // 12) move objs to the right place in the scene 
    glMatrix.mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    // 13) add perspective transformation
    glMatrix.mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);
    // use matrix values to set uniform vars (false = no transposing)
    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
    // 14) draw!!
    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);  // divide by 3 --> draw 12 tris
}

animate();
