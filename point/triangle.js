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


const number = initVertexBuffer(gl);

function initVertexBuffer(context) {
    const vertexts = new Float32Array([
        -0.2, 0.2, -0.2, -0.2, 0.2, 0.2
    ]);
    //列主序列，记住要处理！！！
    /**
     * 1 0 0 x
     * 0 1 0 y     
     * 1 0 0 z
     * 0 0 0 1
     */
    const veticalMatrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.2, 0.0, 0.0, 1.0
    ]);

    //创建缓存区
    const buffers = context.createBuffer();
    //绑定缓存区
    context.bindBuffer(context.ARRAY_BUFFER, buffers);
    //向缓存区中存入数据
    context.bufferData(context.ARRAY_BUFFER, vertexts, context.STATIC_DRAW);
    //获取变量名
    const a_Position = context.getAttribLocation(context.program, 'a_Position');
    // 获取矩阵名
    const u_FormMatrix = context.getUniformLocation(context.program, 'u_FormMatrix');
    //传入矩阵和变量
    context.uniformMatrix4fv(u_FormMatrix, false, veticalMatrix);
    context.vertexAttribPointer(a_Position, 2, context.FLOAT, false, 0, 0);

    //开启变量
    context.enableVertexAttribArray(a_Position);
    return vertexts.length / 2;
}

gl.drawArrays(gl.TRIANGLES, 0, number);


