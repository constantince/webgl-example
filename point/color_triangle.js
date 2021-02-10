var canvas = document.getElementById("screen");
var gl = canvas.getContext("webgl");

var VERTEX_SHADER = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 b_Color;
    void main() {
        gl_Position = a_Position;
        b_Color = a_Color;
    }
`;

var FRAGMENT_SHADER = `
    precision mediump float;
    varying vec4 b_Color;
    void main() {
        gl_FragColor = b_Color;
    }
`;

initShaders(gl, VERTEX_SHADER, FRAGMENT_SHADER);


var number = initVertexBuffer(gl);


function initVertexBuffer(c) {
    var vertexs = new Float32Array([
        0.0, 0.5, 1.0, 0.0, 0.0,
        0.5, 0.0, 0.0, 1.0, 0.0,
        -0.5, 0.0, 0.0, 0.0, 1.0
    ]);

    var buffer = c.createBuffer();
    c.bindBuffer(c.ARRAY_BUFFER, buffer);
    c.bufferData(c.ARRAY_BUFFER, vertexs, gl.STATIC_DRAW);
    var size = vertexs.BYTES_PER_ELEMENT;

    var a_Position = c.getAttribLocation(c.program, 'a_Position');
    c.vertexAttribPointer(a_Position, 2, c.FLOAT, false, size * 5, 0);
    c.enableVertexAttribArray(a_Position);


    var a_Color = c.getAttribLocation(c.program, 'a_Color');
    c.vertexAttribPointer(a_Color, 3, c.FLOAT, false, size * 5, size * 2);
    c.enableVertexAttribArray(a_Color);
    return 3;

}

gl.drawArrays(gl.TRIANGLES, 0, number);

