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
// create fragment shader 
// create program
// attach shaders to program

// enable vertex attrs

// draw!!
