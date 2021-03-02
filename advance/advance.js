var canvas = document.getElementById("advance");
var gl = canvas.getContext("webgl");

var VertexSharder = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    attribute vec4 a_Normal;
    uniform mat4 u_MvpMatrix;
    varying vec4 v_Color;
    uniform mat4 u_ModalMatrix;
    varying vec3 v_Position;
    varying vec3 v_Normal;
    void main() {
        gl_Position = u_MvpMatrix * a_Position;
        v_Normal = normalize(vec3(u_MvpMatrix * a_Normal));
        v_Position = vec3(u_ModalMatrix * a_Position);
        v_Color = a_Color;
    }
`;


var FragSharder = `
    precision mediump float;
    uniform vec3 u_LightPosition;
    uniform vec3 u_EnvLight;
    uniform vec3 u_LightColor;
    varying vec4 v_Color;
    varying vec3 v_Normal;
    varying vec3 v_Position;
    void main() {
        vec3 normal = normalize(v_Normal);
        vec3 lightDirection = normalize(u_LightPosition - v_Position);
        float nDot = max(dot(lightDirection, normal), 0.0);
        vec3 env = u_EnvLight * v_Color.rgb;
        vec3 diffuse = u_LightColor * v_Color.rbg * nDot;
        gl_FragColor = vec4(diffuse + env, v_Color.a);
    }
`;

function main(tran = 1) {
    initShaders(gl, VertexSharder, FragSharder);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    initMatrix(tran);
    const n = initVertexBuffer();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
}

function initVertexBuffer() {
    var vertexs = new Float32Array([
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
       -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
       -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
    ]);

    var color = new Float32Array([
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back  
    ]);

    var indices = new Uint8Array([       // Indices of the vertices
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
       12,13,14,  12,14,15,    // left
       16,17,18,  16,18,19,    // down
       20,21,22,  20,22,23     // back
     ]);

    var normals = new Float32Array([    // Normal
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
       -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    ]);

    shaderPointer("a_Position", vertexs);

    shaderPointer("a_Color", color);

    needLight();

    shaderPointer("a_Normal", normals);

    var bufferIndexPointer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferIndexPointer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
};

function needLight() {
    var a_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    var a_LightDirection = gl.getUniformLocation(gl.program, "u_LightDirection");
    var u_EnvLight = gl.getUniformLocation(gl.program, "u_EnvLight");

    var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
    // var u_ModalMatrix = gl.getUniformLocation(gl.program, 'u_ModalMatrix');

    gl.uniform3f(u_LightPosition, 2.3, 4.0, 3.5);

    gl.uniform3f(a_LightColor, 1.0, 1.0, 1.0);

    var directions = new Vector3([0.5, 3.0, 4.0]);

    directions.normalize();

    gl.uniform3fv(a_LightDirection, directions.elements);

    gl.uniform3f(u_EnvLight, 0.2, 0.2, 0,2);
}

function initMatrix(m) {
    console.log(m);
    var Ma = new Matrix4();
    var Modals = new Matrix4();


    Modals.setRotate(80, 0, 1, 0); 
    var u_ModalMatrix = gl.getUniformLocation(gl.program, 'u_ModalMatrix');
    gl.uniformMatrix4fv(u_ModalMatrix, false, Modals.elements);


    
    Ma.setPerspective(30, 1, 1, 100).lookAt(1, 3, 7, 0, 0, 0, m, 1, 0).multiply(Modals);
    var Modal = gl.getUniformLocation(gl.program, "u_MvpMatrix");
    gl.uniformMatrix4fv(Modal, false, Ma.elements);

}

function shaderPointer(name, vertexs) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexs, gl.STATIC_DRAW);

    var a_sharder = gl.getAttribLocation(gl.program, name);
    gl.vertexAttribPointer(a_sharder, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_sharder);
}