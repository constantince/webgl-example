var canvas = document.getElementById("cube");
var gl = canvas.getContext("webgl");

//##变量的前后关系很重要
var VERTEX_SHADER = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    uniform mat4 a_ViewModalMatrix;
    uniform mat4 a_PerspectiveMatrix;
    uniform mat4 u_TranslateMatrix;
    uniform mat4 u_AllMatrix;
    void main() {
        
        gl_Position = u_AllMatrix * a_Position;
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
    initShaders(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    var number = initVertexBuffers();
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    initMatrix();
    // initTranlate(0.75);
    // initTranlate(-0.75);

    
}

function initVertexBuffers() {
    var n = 18;
    var vertexs = new Float32Array([
        0.0,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
        -0.5, -1.0,   0.0,  0.4,  0.4,  1.0,
        0.5, -1.0,   0.0,  1.0,  0.4,  0.4, 

        0.0,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
        -0.5, -1.0,  -2.0,  1.0,  1.0,  0.4,
        0.5, -1.0,  -2.0,  1.0,  0.4,  0.4, 
        // Vertex coordinates and color
        0.0,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
        -0.5, -1.0,  -4.0,  0.4,  1.0,  0.4,
        0.5, -1.0,  -4.0,  1.0,  0.4,  0.4, 

       

       
    ]);

    var size = vertexs.BYTES_PER_ELEMENT;

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexs, gl.STATIC_DRAW);
    
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, size * 6, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, size * 6, size * 3);
    gl.enableVertexAttribArray(a_Color);
    return n;
}

function initMatrix() {
    var all = new Matrix4();
    var viewModal = new Matrix4();
    var perspective = new Matrix4();
    var Translate = new Matrix4();

    viewModal.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
    perspective.setPerspective(30, 1, 1, 100);
    Translate.setTranslate(0.75, 0, 0);
    
    all.set(perspective).multiply(viewModal).multiply(Translate);
    var u_AllMatrix = gl.getUniformLocation(gl.program, 'u_AllMatrix');
    gl.uniformMatrix4fv(u_AllMatrix, false, all.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 9);

    Translate.setTranslate(-0.75, 0, 0);
    all.set(perspective).multiply(viewModal).multiply(Translate);
    var u_AllMatrix = gl.getUniformLocation(gl.program, 'u_AllMatrix');
    gl.uniformMatrix4fv(u_AllMatrix, false, all.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 9);
}