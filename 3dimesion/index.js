

var VERTEX_SHADER = `
attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 a_ViewModelMatrix;
uniform mat4 a_Promatrix;
uniform mat4 a_Persmatrix;
varying vec4 v_Color;
void main() {
    gl_Position = a_ViewModelMatrix * a_Position * a_Promatrix * a_Persmatrix;
    v_Color = a_Color;
}
`;

var FRAGMENT_SHADER = `
precision mediump float;
varying vec4 v_Color;
void main() {
    gl_FragColor = v_Color;
}
`;
function main() {
var canvas = document.getElementById("cube");
var gl = getWebGLContext(canvas);
initShaders(gl, VERTEX_SHADER, FRAGMENT_SHADER);
console.log(gl);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
var n = initVertexBuffers(gl);
var eyeX = 0.25;
var near = 0;
var matrixModel = gl.getUniformLocation(gl.program, "a_ViewModelMatrix");
var Matrix4s = new Matrix4();

var ProModel = gl.getUniformLocation(gl.program, "a_Promatrix");
var ProMatrix = new Matrix4();

initMatrix(gl, eyeX, matrixModel, Matrix4s);

document.onkeydown = function (ev) {
    if (ev.keyCode === 40) {
        eyeX += 0.05;
    }
    if (ev.keyCode === 38) {
        eyeX -= 0.05
    }

    if(ev.keyCode === 39) {
        near += 0.05
    }

    if(ev.keyCode === 37) {
        near -= 0.05
    }

    proMatrix(gl, near, ProModel, ProMatrix);
    initMatrix(gl, parseFloat(eyeX), matrixModel, Matrix4s);
}
}



// start buffer
function initVertexBuffers(gl) {
var n = 9;
var pointsAndColor = new Float32Array([
    // Vertex coordinates and color
    0.0,  0.5,  -0.4,  0.4,  1.0,  0.4, // The back green one
    -0.5, -0.5,  -0.4,  0.4,  1.0,  0.4,
    0.5, -0.5,  -0.4,  1.0,  0.4,  0.4, 
    
    0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // The middle yellow one
    -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
    0.0, -0.6,  -0.2,  1.0,  1.0,  0.4, 

    0.0,  0.5,   0.0,  0.4,  0.4,  1.4,  // The front blue one 
    -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
    0.5, -0.5,   0.0,  1.0,  0.4,  0.4, 
]);

var size = pointsAndColor.BYTES_PER_ELEMENT;

var buffers = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffers);
gl.bufferData(gl.ARRAY_BUFFER, pointsAndColor, gl.STATIC_DRAW);

var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, size * 6, 0);
gl.enableVertexAttribArray(a_Position);

var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, size * 6, size * 3);
gl.enableVertexAttribArray(a_Color);

// gl.bindBuffer(gl.ARRAY_BUFFER, null);
return n;
}

// start matrix
function initMatrix(gl, ex, matrixModel, Matrix4s) {
console.log(ex);
Matrix4s.setLookAt(ex, ex, 0.25, 0, 0, 0, 0, 1, 0)
gl.uniformMatrix4fv(matrixModel, false, Matrix4s.elements);

gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES, 0, 9);

}
//set promatrix
function proMatrix(gl, x, matrixModel, Matrix) {
    Matrix.setOrtho(-1.0, 1.0, -1.0, 1.0, x, 2.0);
    gl.uniformMatrix4fv(matrixModel, false, Matrix.elements);
}



