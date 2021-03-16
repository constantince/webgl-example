const vertex = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    void main() {
        gl_Position = a_Position;
        v_Color = a_Color;
    }
`;

const fragment = `
    precision mediump float;
    varying vec4 v_Color;
    void main() {
        gl_FragColor = v_Color;
    }
`;

function loadShaders(gl, shaderArrays, SHADERS) {
    return shaderArrays.map((v, i) => {
        const Shader = gl.createShader(SHADERS[i]);
        gl.shaderSource(Shader, v);
        gl.compileShader(Shader);
        if(!gl.getShaderParameter(Shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(Shader))
        }
        return Shader;
    })
}

function programShader(gl, array) {
    const pro = gl.createProgram();
    array.forEach(v => {
        gl.attachShader(pro, v);
    });
   
    gl.linkProgram(pro);

    if (!gl.getProgramParameter(pro, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(pro))
    };

    gl.useProgram(pro);

    return pro;
}

function initShader(gl, vtx, fgt) {
    const result = loadShaders(gl, [vtx, fgt], [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER])
    return programShader(gl, result);
}

function initBuffer(gl, program) {
    const data = new Float32Array([
        0.0, 0.5, 0.0, 1.0, 0.0,
        0.0, 0.0, 1.0, 0.0, 0.0,
        0.5, 0.5, 0.0, 0.0, 1.0,
        0.5, 0.0, 1.0, 0.0, 1.0
    ]);

    const size = data.BYTES_PER_ELEMENT;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    const a_Position = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, size * 5, 0);
    gl.enableVertexAttribArray(a_Position);


    const a_Color = gl.getAttribLocation(program, "a_Color");
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, size * 5, size * 2);
    gl.enableVertexAttribArray(a_Color);

    return 4;
}

function main() {
    const canvas = document.getElementById("cube");
    const gl = canvas.getContext("webgl");

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const program = initShader(gl, vertex, fragment);

    const number = initBuffer(gl, program);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, number)
}

