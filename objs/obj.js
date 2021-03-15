"use strict";
var canvas = document.getElementById("cube");
var webgl = canvas.getContext("webgl");
var vertex = "\n    attribute vec4 a_Position;\n    attribute vec4 a_Color;\n    varying vec4 v_Color;\n    void main() {\n        gl_Position = a_Position;\n    }\n";
var fragment = "\n    precision mediump float;\n    varying vec4 v_Color;\n    \n    void main() {\n        gl_FragColor = vec4(1.0,0.0,0.0,1.0);\n    }\n";
var initShader = function (v, f) {
    var vertexShader = webgl.createShader(webgl.VERTEX_SHADER);
    webgl.shaderSource(vertexShader, v);
    webgl.compileShader(vertexShader);
    if (!webgl.getShaderParameter(vertexShader, webgl.COMPILE_STATUS)) {
        throw new Error(webgl.getShaderInfoLog(vertexShader));
    }
    ;
    var fragmentShader = webgl.createShader(webgl.FRAGMENT_SHADER);
    webgl.shaderSource(fragmentShader, f);
    webgl.compileShader(fragmentShader);
    if (!webgl.getShaderParameter(fragmentShader, webgl.COMPILE_STATUS)) {
        throw new Error(webgl.getShaderInfoLog(fragmentShader));
    }
    ;
    var pro = webgl.createProgram();
    webgl.attachShader(pro, vertexShader);
    webgl.attachShader(pro, fragmentShader);
    webgl.linkProgram(pro);
    if (!webgl.getProgramParameter(pro, webgl.LINK_STATUS)) {
        throw new Error(webgl.getProgramInfoLog(pro));
    }
    ;
    // webgl.detachShader(pro, vertexShader);
    // webgl.deleteShader(vertexShader);
    // webgl.detachShader(pro, fragmentShader);
    // webgl.deleteShader(fragmentShader);
    webgl.useProgram(pro);
    return pro;
};
var initBuffer = function (gl, pro) {
    var data = new Float32Array([
        0, 0.7,
        0.5, -0.7,
        -0.5, -0.7,
    ]);
    var size = data.BYTES_PER_ELEMENT;
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    var a_Position = gl.getAttribLocation(pro, "a_Position");
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    // const a_Color = gl.getAttribLocation(pro, "a_Color");
    // gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, size * 5, size * 3);
    // gl.enableVertexAttribArray(a_Color);
    return 3;
};
function main() {
    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    var pro = initShader(vertex, fragment);
    var number = initBuffer(webgl, pro);
    webgl.clear(webgl.COLOR_BUFFER_BIT);
    webgl.drawArrays(webgl.TRIANGLES, 0, number);
}
