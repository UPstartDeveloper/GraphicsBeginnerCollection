// A: get a WebGL 1.0 rendering context
const canvas = document.getElementById("c");
const gl = canvas.getContext('webgl');

if (!gl) {
    throw new Error("Sorry, your browser doesn't support WebGL 1.0.");
}

/********************** THE POINT CLOUD *************************/
/**
 * 1) define vertices
 * @param {number} numPoints 
 */
function spherePointCloud(numPoints) {
    let points = [];
    for (let i = 0; i < numPoints; i++) {
        // make a random point
        const r = () => Math.random() - 0.5;  // stay in the range [-.5, .5]
        const inputPoint = [r(), r(), r()];
        // because we normalize, all the points are the same (radial) dist (of 1) from the center
        const outputPoint = glMatrix.vec3.normalize(glMatrix.vec3.create(), inputPoint); // the length of a vector divided by itself
        points.push(...outputPoint);
    }
    return points;
}

const vertexData = spherePointCloud(1e5);

/**
 * Random RGB value generator.
 * @returns Array of numbers
 */
function randomColor() {
    return [Math.random(), Math.random(), Math.random()]
}

// 3) create buffers
const posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);


// 4) create vertex shader
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
    precision mediump float;

    attribute vec3 position;
    varying vec3 vColor;

    uniform mat4 matrix;

    void main() {
        vColor = vec3(position.xy, 1);  // always blue, + using the XY coords
        gl_Position = matrix * vec4(position, 1);
        gl_PointSize = 1.0;
    }
`);
gl.compileShader(vertexShader);

// 5) create fragment shader - using a general formula for color again
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

gl.useProgram(program); // creates an exec on the GPU

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
const mvpMatrix = glMatrix.mat4.create(); // this is the final matrix to render - composite of the "model", "view", and "perspective" transforms

glMatrix.mat4.translate(modelMatrix, modelMatrix, [0, 0, 0]);
glMatrix.mat4.translate(viewMatrix, viewMatrix, [0, 0.1, 2]);
glMatrix.mat4.invert(viewMatrix, viewMatrix);

// 11) animations, anyone?
function animate() {
    requestAnimationFrame(animate);
    glMatrix.mat4.rotateY(modelMatrix, modelMatrix, 0.015);  // rotating by 90 deg
    // 12) move objs to the right place in the scene 
    glMatrix.mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    // 13) add perspective transformation
    glMatrix.mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);
    // use matrix values to set uniform vars (false = no transposing)
    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
    // 14) draw!!
    gl.drawArrays(gl.POINTS, 0, vertexData.length / 3);  // divide by 3 --> draw 12 tris
}

animate();
