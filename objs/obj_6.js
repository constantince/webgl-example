const canvas = document.getElementById("cube");

const vertex = `
    attribute vec4 a_Position;
    void main() {
        gl_Position = a_Position;
    }
`;

const fragment = `
    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`;




function createTriangles(n) {
    let v = []; let start = 0;
    const width = 0.3;
    const oneAngle = Math.PI / 180;
    const zata = (360 / n) * oneAngle;
    for (let index = 0; index < 2 * n; index++) {
        v.push(Math.cos(start) * width);
        v.push(Math.sin(start) * width);
        start += zata; 
    }
    return v;
    
}
const xPosition = Math.tan(30 * Math.PI / 180) * 0.3 * 2;
const yPosition = 0.3;
console.log(xPosition, yPosition);
// console.log(createTriangles(6))
const geometryFrag = {
    'triangle': {
        draw: 'TRIANGLES',
        indicate: 2,
        vertex: [
            0, 0,
            0.3, 0.3,
            0, 0.3 
         ],
         n: 3
    },
    "rectangle": {
        draw: "TRIANGLE_STRIP",
        indicate: 2,
        vertex: [
            -0.3, 0.3,
            -0.3, -0.3,
            0.3, 0.3,
            0.3, -0.3
        ],
        n: 4
    },
    "hexagon": {
        draw: "TRIANGLE_FAN",
        indicate: 2,
        vertex: createTriangles(6),
        n: 12
    },
    "circle": {
        draw: "TRIANGLE_FAN",
        indicate: 2,
        vertex: createTriangles(64),
        n: 33
    },
    "star": {
        draw: 'TRIANGLE_STRIP',
        indicate: 2,
        vertex: [
            0, 0.3,
            -xPosition, -yPosition,
            xPosition, -yPosition,
            //三角形退化，减少绘制次数
            xPosition, -yPosition,
            -xPosition, yPosition - 0.2,

            -xPosition, yPosition - 0.2,
            xPosition, yPosition - 0.2,
            0, -0.3 - 0.2
         ],
         n: 8
    }
}

var current = geometryFrag['star'];

function main() {
    const webgl = canvas.getContext("webgl");
    if(!_initShaders(webgl, vertex, fragment)) {
        return;
    }
    _initBuffer(webgl, current.indicate, current.vertex);
    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    // webgl.enable(webgl.DEPTH_TEST_BUFFER);
    webgl.clear(webgl.COLOR_BUFFER_BIT);
    webgl.drawArrays(webgl[current.draw], 0, current.n);
}

//init buffer
function _initBuffer(gl, indicate, vertex) {
    const triangles = new Float32Array(vertex);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW);
    const a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, indicate, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
}

//init shaders
function _initShaders(gl, vertexP, fragmentP) {
    const v_shader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(v_shader, vertexP);
    gl.compileShader(v_shader);
    let comp = gl.getShaderParameter(v_shader, gl.COMPILE_STATUS);
    if(!comp) {
        const info = gl.getShaderInfoLog(v_shader);
        console.warn(info);
        gl.deleteShader(v_shader)
        return false;
    }

    const f_shader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(f_shader, fragmentP);
    gl.compileShader(f_shader);
    comp = gl.getShaderParameter(f_shader, gl.COMPILE_STATUS);
    if(!comp) {
        const info = gl.getShaderInfoLog(f_shader);
        console.warn(info);
        gl.deleteShader(f_shader);
        return false;
    }

    const program = gl.createProgram();
    

    if(gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.log("oppss~~~ link program failed");
    }

    gl.attachShader(program, v_shader);
    gl.attachShader(program, f_shader);
    gl.linkProgram(program);

    gl.useProgram(program);
    gl.program = program;

    return true;
}

