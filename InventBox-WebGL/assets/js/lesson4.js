// A: get a WebGL 1.0 rendering context
const canvas = document.getElementById("c");
const gl = canvas.getContext('webgl');

if (!gl) {
    throw new Error("Sorry, your browser doesn't support WebGL 1.0.");
}

alert(`Everything all good with WebGL!`);

/********************** THE FIRST TRIANGLE *************************/
// 1) define vertices
const vertexData = [
    0, 1, 0,    // center, up
    1, -1, 0,  // right, down
    -1, -1, 0  // left, down
]
const colorData = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
]

// 2) create buffers
const posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
                            // the 3rd arg helps the GPU optimize for redrawing (or not)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

// 3) create vertex shader
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
    precision mediump float;    // mediump works more broadly across devices

    attribute vec3 position;
    attribute vec3 color;
    varying vec3 vColor;
    void main() {
        vColor = color;  // what color THIS vertex will have
        gl_Position = vec4(position, 1);
    }
`);
gl.compileShader(vertexShader);

// 4) create fragment shader 
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
    precision mediump float;
    varying vec3 vColor;
    void main() {
        gl_FragColor = vec4(vColor, 1); // this is hardcoding a color across ALL pixels
    }
`);
gl.compileShader(fragmentShader);

// 5) create program
const program = gl.createProgram();

// 6) attach shaders to program
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
// 9) draw!!
gl.drawArrays(gl.TRIANGLES, 0, 3);
