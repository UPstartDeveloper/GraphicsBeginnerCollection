// A: get a WebGL 1.0 rendering context
const canvas = document.getElementById("c");
const gl = canvas.getContext('webgl');

if (!gl) {
    throw new Error("Sorry, your browser doesn't support WebGL 1.0.");
}

alert(`Everything all good with WebGL!`);

/********************** THE FIRST TRIANGLE *************************/
// define vertices
const vertexData = [
    0, 1, 0,    // center, up
    1, -1, 0,  // right, down
    -1, -1, 0  // left, down
]

// create buffer
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

// load vertexData into buffer                               the 3rd arg helps the GPU optimize for redrawing (or not)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

// create vertex shader
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
    attribute vec3 position;
    void main() {
        gl_Position = vec4(position, 1);
    }
`);
gl.compileShader(vertexShader);

// create fragment shader 
const fragmentShader = gl.createShader(gl.FRAGENT_SHADER);
gl.shaderSource(fragmentShader, `
    void main() {
        gl_FragColor = vec4(1, 0, 0, 1); // this is hardcoding a color across ALL pixels
    }
`);
gl.compileShader();

// create program
const program = gl.createProgram();
// attach shaders to program
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program); // ???

// enable vertex attrs - in this case, we just have position
const positionLocation = gl.getAttribLocation(program, `position`);  // the string comes from our attribute in the GLSL above!
gl.enableVertexAttribArray(positionLocation);  // attrs are disabled by default 

/**
 * the '3' tells WebGL that each position takes 3 values
 * dtype comes from the Float32Array above  
 * no normalization for now (more so for optimization)  
 * no stride, 
 * no offset
 */
gl.vertexAttribPointer(positionLocation, 3, gl.Float, false, 0, 0);

gl.useProgram(program); // creates an exec on the GPU
// draw!!
gl.drawArrays(gl.TRIANGLES, 0, 3);
