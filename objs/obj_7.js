const VERTEX_SHADER = `
    attribute vec4 a_Position;
    uniform mat4 u_ViewMatrixModel;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    void main() {
        gl_Position = u_ViewMatrixModel * a_Position;
        v_Color = a_Color;
    }
`;

const FRAGMENT_SHADER = `
    precision mediump float;
    varying vec4 v_Color;
    void main() {
        gl_FragColor = v_Color;
    }
`;

function _initShaders(gl, v_shader, f_shader) {
    const vshader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vshader, v_shader);
    gl.compileShader(vshader);

    if(!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(vshader);
        console.warn(info);
        return false;
    }

    const fshader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fshader, f_shader);
    gl.compileShader(fshader);

    if(!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(fshader);
        console.warn(info);
        return false;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vshader);
    gl.attachShader(program, fshader);
    gl.linkProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const infoProgram = gl.getProgramInfoLog(program);
        console.warn(infoProgram);
        return false;
    }
    
    gl.deleteShader(vshader);
    gl.deleteShader(fshader);

    gl.useProgram(program);
    gl.program = program;

    return true;

}

function _createBuffer(gl, index, name, size) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, index, gl.STATIC_DRAW);
    const variable = gl.getAttribLocation(gl.program, name);
    gl.vertexAttribPointer(variable, size, gl.FLOAT,  false, 0, 0);
    gl.enableVertexAttribArray(variable);
}

function _initBuffer(gl) {
    const vertexs = new Float32Array([
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
       -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
       -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
    ]);

    const color = new Float32Array([
        0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
       0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
       1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
       1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
       1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
       0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
    ]);

    const pointer = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
       12,13,14,  12,14,15,    // left
       16,17,18,  16,18,19,    // down
       20,21,22,  20,22,23     // back
    ]);

    _createBuffer(gl, vertexs, 'a_Position', 3);
    _createBuffer(gl, color, 'a_Color', 3);
    
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, pointer, gl.STATIC_DRAW);
    return pointer.length;

}



 function _initMatrixModel(gl, vM, rM, angle) {
    rM.setRotate(angle, 1.0, 1.0, 0.0);
    vM.multiply(rM);
    const u_ViewMatrixModel = gl.getUniformLocation(gl.program, 'u_ViewMatrixModel');
    gl.uniformMatrix4fv(u_ViewMatrixModel, false, vM.elements); 
}


function main() {
    const canvas = document.getElementById("cube");
    const webgl = canvas.getContext("webgl");
    if(!_initShaders(webgl, VERTEX_SHADER, FRAGMENT_SHADER)) {
        return false;
    }
    var rotateMatrix = new Matrix4();
    var M = new Matrix4();
    M.setPerspective(30, 1, 1, 100).lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
    let speed = 1, start = 0;

    // _initMatrixModel(webgl, canvas.widht, canvas.height);

    const number = _initBuffer(webgl);

    webgl.clearColor(0.75, 0.85, 0.8, 0.9);
    webgl.enable(webgl.DEPTH_TEST);
    
    function move() {
        const ang = start + speed;
        _initMatrixModel(webgl, M, rotateMatrix, ang);
        webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
        webgl.drawElements(webgl.TRIANGLES, number, webgl.UNSIGNED_BYTE, 0);
        requestAnimationFrame(move)
    }

    move();
    
    

    console.log("hello webgl");
}