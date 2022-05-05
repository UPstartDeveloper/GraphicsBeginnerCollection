// A: get a WebGL 1.0 rendering context
const canvas = document.getElementById("c");
const gl = canvas.getContext('webgl');

if (!gl) {
    throw new Error("Sorry, your browser doesn't support WebGL 1.0.");
}

/********************** THE TEXTURE TUTORIAL *************************/
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
 * Constuct an array by repeating `pattern` `n` times.
 * @param {*} pattern 
 * @param {int} n 
 * @returns {Array}
 */
function repeat(pattern, n) {
    return [...Array(n)].reduce(sum => sum.concat(pattern), []);
} 

const uvData = repeat([
    // start 0,0, move clockwise 
    1, 1, // top right
    1, 0, // bottom right
    0, 1, // top left

    0, 1, // top left
    1, 0, // bottom right
    0, 0  // bottom left
], 6);

// 3) create buffers - no color buffer, b/c we use textures instead
const posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

const uvBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvData), gl.STATIC_DRAW);


// TEXTURE LOADING
// ===============
function loadTexture(url) {
    const texture = gl.createTexture();
    const image = new Image();

    image.onload = e => {
        // tell the type of texture, and the texture obj
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(
            gl.TEXTURE_2D, 0, 
            gl.RGBA, gl.RGBA, 
            gl.UNSIGNED_BYTE, image
        );

        gl.generateMipmap(gl.TEXTURE_2D);  // ???
    };
    image.src = url;
    return texture;
}

// load the texture AND activate it!
const wall = loadTexture(`assets/textures/wall.jpeg`);
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, wall);

// 4) create vertex shader
let uniformLocations;
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
    precision mediump float;

    attribute vec3 position;
    attribute vec2 uv;

    varying vec2 vUV;  // recall that ultimately, this goes to the fragment shader (like the color attr did)

    uniform mat4 matrix;

    void main() {
        vUV = uv;
        gl_Position = matrix * vec4(position, 1);
    }
`);
gl.compileShader(vertexShader);

// 5) create fragment shader 
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
    precision mediump float;

    varying vec2 vUV;  // note that it's only a 2-vector!
    uniform sampler2D textureID;

    void main() {
        gl_FragColor = texture2D(textureID, vUV);
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

// 8) enable vertex attrs for position and texture
const positionLocation = gl.getAttribLocation(program, `position`);  // the string comes from our attribute in the GLSL above!
gl.enableVertexAttribArray(positionLocation);  // attrs are disabled by default 
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);  // re-bind, the last array to be bound to the buffer has color data, not positions
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);


const uvLocation = gl.getAttribLocation(program, `uv`);
gl.enableVertexAttribArray(uvLocation);   
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
// NOTE: the "2" here tells WebGL the number of components per UV coord. as such, it has be 2 (if it was pos, it'd be 3)
gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

gl.useProgram(program); // creates an exec on the GPU
// make sure to enable the depth buffer - the color in front should be shown, occlude what's behind
gl.enable(gl.DEPTH_TEST);

// 9) pull in uniforms
uniformLocations = {
    matrix: gl.getUniformLocation(program, `matrix`),
    textureID: gl.getUniformLocation(program, `textureID`)
};

gl.uniform1i(uniformLocations.textureID, 0); // ???

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
const mvpMatrix = glMatrix.mat4.create(); // this is the final matrix to render - composite of the "model", "view", and "perspective" transforms

// glMatrix.mat4.translate(modelMatrix, modelMatrix, [0, 0, 0]);
glMatrix.mat4.translate(viewMatrix, viewMatrix, [0, 0.1, 2]);
glMatrix.mat4.invert(viewMatrix, viewMatrix);

// 11) animations, anyone?
function animate() {
    requestAnimationFrame(animate);
    // glMatrix.mat4.rotateZ(matrix, matrix, Math.PI/2 / 70);  // rotating by 90 deg
    glMatrix.mat4.rotateX(modelMatrix, modelMatrix, Math.PI/2 / 70);  // rotating by 90 deg
    glMatrix.mat4.rotateY(modelMatrix, modelMatrix, Math.PI/2 / 70);  // rotating by 90 deg
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
