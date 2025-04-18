// NOT MY CODE, PROF'S CODE: https://github.com/harviu/WebGL-Example/tree/master
// Get WebGL context
const canvas1 = document.getElementById('webgl-canvas-1');
const canvas2 = document.getElementById('webgl-canvas-2');
const gl1 = canvas1.getContext('webgl');
const gl2 = canvas2.getContext('webgl');

if (!gl1 || !gl2) {
    alert('WebGL not supported!');
    throw new Error('WebGL not supported');
}

// AI Assisted Modifications
// Create and compile a shader from a source file
async function createShader(gl, type, filePath) {
    const response = await fetch(filePath);
    if (!response.ok) {
        console.error(`Failed to load shader source from ${filePath}`);
        return null;
    }

    const source = await response.text();
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile failed: ', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function linkShaderProgram(gl, program) {
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking failed: ', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

const vsGeneric = "shaders/generic.vert"; // Will likely need modification
const cubeMap = "shaders/cubeMap.frag";
const chromaticAberration = "shaders/chromaticAberration.frag";
const phong = "shaders/phong.frag";

//FIXME: Hardcoded paths
//FIXME: Hardcoded for only 2 canvases

// Create the shader1 program
const vertexShader1 = createShader(gl1, gl1.VERTEX_SHADER, vsGeneric);
const fragmentShader1 = createShader(gl1, gl1.FRAGMENT_SHADER, phong);

// Create the shader2 program
const vertexShader2 = createShader(gl2, gl2.VERTEX_SHADER, vsGeneric);
const fragmentShader2 = createShader(gl2, gl2.FRAGMENT_SHADER, phong);
//const fragmentShader2_1 = createShader(gl2, gl2.FRAGMENT_SHADER, chromaticAberration);

// Compile shader1
const program1 = gl1.createProgram();
gl1.attachShader(program1, vertexShader1);
gl1.attachShader(program1, fragmentShader1);
linkShaderProgram(gl1, program1);

// Compile shader2
const program2 = gl2.createProgram();
gl2.attachShader(program2, vertexShader2);
gl2.attachShader(program2, fragmentShader2);
gl2.attachShader(program2, fragmentShader2_1);
linkShaderProgram(gl1, program2);

