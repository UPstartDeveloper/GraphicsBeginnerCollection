// A: get a WebGL 1.0 rendering context
const canvas = document.getElementById("c");
const gl = canvas.getContext('webgl');

if (!gl) {
    throw new Error("Sorry, your browser doesn't support WebGL 1.0.");
}

/********************** THE TEXTURE TUTORIAL *************************/
// DEFINE VERTICES
// ================

// face order: F|L|B|R|T|U
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

// DEFINE UV COORDS (this is for texturing later on)
// =================================================
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

// 1) define the info about the suface normals for each vertex 
const normalData = [
    // we use repeat() b/c there's some redundancy here - 6 faces (F|L|B|R|T|U), each has 6 vertices with the same attrs
    ...repeat([0, 0, 1], 6),  // Z+ 
    ...repeat([-1, 0, 0], 6),  // X-
    ...repeat([0, 0, -1], 6),  // Z-
    ...repeat([1, 0, 0], 6),  // X+
    ...repeat([0, 1, 0], 6),  // Y+
    ...repeat([0, -1, 0], 6),  // Y-
];

// CREATE BUFFERS
// ==================
const posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

const uvBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvData), gl.STATIC_DRAW);

// 2) add buffer for normals
const normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);


// TEXTURE LOADING
// ====================
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

const wall = loadTexture(`assets/textures/wall.jpeg`);
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, wall);

// CREATE SHADERS
// ===============
let uniformLocations;
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
    precision mediump float;

    // 4) brute force create a light direction vector - this is a global btw
    const vec3 lightDirection = normalize(vec3(0, 1.0, 1.0));
    const float ambient = 0.1;  // this is +10% lighting, for low-light scenes

    attribute vec3 position;
    attribute vec2 uv;
    attribute vec3 normal;

    varying vec2 vUV; 
    varying float vBrightness;

    uniform mat4 matrix;
    uniform mat4 normalMatrix;

    void main() {
        // 5) move the normal into world space (to account for animations) and get the brightness!
        vec3 worldSpaceNormal = (normalMatrix * vec4(normal, 1)).xyz;
        float diffuse = dot(worldSpaceNormal, lightDirection);
        float nonNegDiffuse = max(0.0, diffuse);

        // 6) pass into on to the frag shader
        vBrightness = ambient + nonNegDiffuse;
        vUV = uv;
        gl_Position = matrix * vec4(position, 1);
    }
`);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
    precision mediump float;

    varying vec2 vUV;  // note that it's only a 2-vector!
    varying float vBrightness;

    uniform sampler2D textureID;

    void main() {
        // 7) add the texture, and adjust the RGB given the diffuse lighting
        vec4 texel = texture2D(textureID, vUV);
        texel.xyz *= vBrightness;
        gl_FragColor = texel;
    }
`);
gl.compileShader(fragmentShader);
console.log(gl.getShaderInfoLog(fragmentShader));   

// CREATE PROGRAM
// ===============
const program = gl.createProgram();

// ATTACH SHADERS
// ===============
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program); // ???

// ENABLE VERTEX ATTRS (position, uv, normals)
// ===========================================
const positionLocation = gl.getAttribLocation(program, `position`);  // the string comes from our attribute in the GLSL above!
gl.enableVertexAttribArray(positionLocation);  // attrs are disabled by default 
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);  // re-bind, the last array to be bound to the buffer has color data, not positions
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

const uvLocation = gl.getAttribLocation(program, `uv`);
gl.enableVertexAttribArray(uvLocation);   
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
// NOTE: the "2" here tells WebGL the number of components per UV coord. as such, it has be 2 (if it was pos, it'd be 3)
gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

// 3) add vertex attr for normals
const normalLocation = gl.getAttribLocation(program, `normal`);
gl.enableVertexAttribArray(normalLocation);   
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
// NOTE: the "2" here tells WebGL the number of components per UV coord. as such, it has be 2 (if it was pos, it'd be 3)
gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

// USE IT
// ========
gl.useProgram(program); // creates an exec on the GPU
// make sure to enable the depth buffer - the color in front should be shown, occlude what's behind
gl.enable(gl.DEPTH_TEST);

// PULL IN UNIFORMS
//==================
uniformLocations = {
    matrix: gl.getUniformLocation(program, `matrix`),
    // 8) add the uniform here!
    normalMatrix: gl.getUniformLocation(program, `normalMatrix`),
    textureID: gl.getUniformLocation(program, 'textureID'),
};

gl.uniform1i(uniformLocations.textureID, 0); // ???

// APPLY TRANSFORMS
// ==================
const modelMatrix = glMatrix.mat4.create();
const viewMatrix = glMatrix.mat4.create();
const projectionMatrix = glMatrix.mat4.create();
glMatrix.mat4.perspective(
    projectionMatrix, 
    75 * Math.PI/180,  // vertical FOV (angle in radians)
    canvas.width/canvas.height,  // aspect W/H ratio
    1e-4,  // "near", aka culling distance
    1e4 // "far" cull plane
);

const mvMatrix = glMatrix.mat4.create();  // short for "model view matrix" - just an intermediary reprsentation, 
const mvpMatrix = glMatrix.mat4.create(); // this is the final matrix to render - composite of the "model", "view", and "perspective" transforms

// glMatrix.mat4.translate(modelMatrix, modelMatrix, [0, 0, 0]);
glMatrix.mat4.translate(viewMatrix, viewMatrix, [0, 0.1, 2]);
glMatrix.mat4.invert(viewMatrix, viewMatrix);

// 9) create the normalMatrix - Math please???
const normalMatrix = glMatrix.mat4.create();

// RENDER LOOP
// ==============
function animate() {
    requestAnimationFrame(animate);
    // glMatrix.mat4.rotateZ(matrix, matrix, Math.PI/2 / 70);  // rotating by 90 deg
    glMatrix.mat4.rotateX(modelMatrix, modelMatrix, Math.PI/100);  // rotating by 90 deg
    glMatrix.mat4.rotateY(modelMatrix, modelMatrix, Math.PI/200);  // rotating by 90 deg
    // move objs to the right place in the scene 
    glMatrix.mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    // add perspective transformation
    glMatrix.mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);

    // 10) finish creating the normalMatrix
    glMatrix.mat4.invert(normalMatrix, mvMatrix);
    glMatrix.mat4.transpose(normalMatrix, normalMatrix);

    // use matrix values to set uniform vars (false = no transposing)
    gl.uniformMatrix4fv(uniformLocations.normalMatrix, false, normalMatrix);
    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
    // draw!!
    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);  // divide by 3 --> draw 12 tris
}

animate();
