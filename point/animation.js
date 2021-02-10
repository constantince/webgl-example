const canvas = document.getElementById("screen");
const gl = canvas.getContext("webgl");

const VERTEX_SHADER = `
    attribute vec4 a_Position;
    uniform mat4 u_FormMatrix;
    void main() {
        gl_Position = u_FormMatrix * a_Position ;
    }
`;

const FRAGMENT_SHADER = `
    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`;

initShaders(gl, VERTEX_SHADER, FRAGMENT_SHADER);

const angles = 45.0;

const number = initVertexBuffer(gl);

function initVertexBuffer(context) {
    const vertexts = new Float32Array([
        -0.2, 0.2, -0.2, -0.2, 0.2, 0.2
    ]);

    //创建缓存区
    const buffers = context.createBuffer();
    //绑定缓存区
    context.bindBuffer(context.ARRAY_BUFFER, buffers);
    //向缓存区中存入数据
    context.bufferData(context.ARRAY_BUFFER, vertexts, context.STATIC_DRAW);
    //获取变量名
    const a_Position = context.getAttribLocation(context.program, 'a_Position');   
    //传入变量
    context.vertexAttribPointer(a_Position, 2, context.FLOAT, false, 0, 0);
    //开启变量
    context.enableVertexAttribArray(a_Position);
    return vertexts.length / 2;
}

var a = 1;
var m = 0.01;
var stop = null;

function draw() {
    if(stop) return;
    m += 0.01;
    const matrix = new Matrix4();
    // matrix.setRotate(a++, 0, 0, 1);
    matrix.setTranslate(m, 0, 0);
    // console.log(a);
     // 获取矩阵名
     const u_FormMatrix = gl.getUniformLocation(gl.program, 'u_FormMatrix');
     gl.uniformMatrix4fv(u_FormMatrix, false, matrix.elements);
     gl.drawArrays(gl.TRIANGLES, 0, 3);
     requestAnimationFrame(draw)
}

// draw()

document.getElementById('green').addEventListener('click', () => {
    if(stop === false) return;
    stop = false;
    draw();
});

document.getElementById('blue').addEventListener('click', () => {
    stop = true;
});

document.getElementById('start').addEventListener('click', () => {
    draw();
});


