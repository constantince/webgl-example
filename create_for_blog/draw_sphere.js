function _loaderShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        console.warn(info);
        return false;
    }
    return shader;
}

function myCreateProgram(gl, shader1, shader2) {
    const program = gl.createProgram();
    gl.attachShader(program, shader1);
    gl.attachShader(program, shader2);
    gl.linkProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        console.warn(info);
        return false;
    }

    return program;
}

function myInitShader(gl, v, f) {
    const vShader = _loaderShader(gl, gl.VERTEX_SHADER, v);
    const fShader = _loaderShader(gl, gl.FRAGMENT_SHADER, f);

    if(!vShader || !fShader) return;
    
    const program = myCreateProgram(gl, vShader, fShader);

    if(!program) return;

    return program;
}

function myInitBuffer(gl, program, data, name, size, type = false) {
    const buffer = gl.createBuffer();
    const bufferType =  type ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
    gl.bindBuffer(bufferType, buffer)
    gl.bufferData(bufferType, data, gl.STATIC_DRAW);

    if( !type ) {
        const target = gl.getAttribLocation(program, name);
        if( target < 0) {
            return console.warn("not vaild attribute.")
        }
        gl.vertexAttribPointer(target, size, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(target);
    }
}

function myinitMatrix(gl, program,start) {
    // 投影矩阵
    const pM = mat4.create();
    mat4.identity(pM)
    mat4.perspective(pM, glMatrix.toRadian(60), 1, 1, 100);
    
    //视图矩阵
    const wM = mat4.create();
    mat4.identity(wM)
    mat4.lookAt(wM, [0, 0, 5], [0, 0, 0], [0, 1, 0]);

    //模型矩阵 
    const fM = mat4.create();
    mat4.identity(fM)
    mat4.fromRotation(fM, glMatrix.toRadian(-30), [1, 0, 0]);
    mat4.rotateY(fM, fM, glMatrix.toRadian(start));
    // mat4.rotateZ(fM, fM, glMatrix.toRadian(start));
    // mat4.rotateX(fM, fM, glMatrix.toRadian(start));

    // 赋值uniform
    const projectionMatrixLocation = gl.getUniformLocation(program, "u_ProjectionMatrix");
    const worldMatrixLocation = gl.getUniformLocation(program, "u_WorldMatrix");
    const rotateMatrixLocation = gl.getUniformLocation(program, "u_RoateMatrix");
    gl.uniformMatrix4fv(projectionMatrixLocation, false, pM);
    gl.uniformMatrix4fv(worldMatrixLocation, false, wM);
    gl.uniformMatrix4fv(rotateMatrixLocation, false, fM);
}

// 顶点着色器。
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;

  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_WorldMatrix;
  uniform mat4 u_RoateMatrix;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_ProjectionMatrix * u_WorldMatrix * u_RoateMatrix * a_Position;
    v_Color = vec4(1.0, 0.0, 0.0, 1.0);
}`

// 片元着色器
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec4 v_Color;
  void main() {
    gl_FragColor = v_Color;
}`

// 顶点着色器-线条。
var VSHADER_SOURCE_LINE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;

  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_WorldMatrix;
  uniform mat4 u_RoateMatrix;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_ProjectionMatrix * u_WorldMatrix * u_RoateMatrix * a_Position;
    v_Color = a_Color;
}`

// 片元着色器-线条
var FSHADER_SOURCE_LINE =`
  precision mediump float;
  varying vec4 v_Color;
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}`

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = canvas.getContext("webgl");
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  
  // 初始化着色器程序
  const program = myInitShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);
  const program1 = myInitShader(gl, VSHADER_SOURCE_LINE, FSHADER_SOURCE_LINE);
  
  if (!program) {
    console.log('Failed to intialize shaders.');
    return;
  }
  
  
  const {pointer, vertexs, linePointer} = calculatePoints();
  // 绘制圆柱体
  function drawSphere(start) {
    //切换程序
    gl.useProgram(program);
    myInitBuffer(gl, program, vertexs, 'a_Position', 3);
    myInitBuffer(gl, program, pointer, null, null, true);
     //绘制场景
    myinitMatrix(gl, program, start);
    // 执行画点的指令
    gl.drawElements(gl.TRIANGLE_STRIP, pointer.length, gl.UNSIGNED_SHORT, 0);

  }
  //绘制表面线条
  function drawLine() {
    gl.useProgram(program1);
    myInitBuffer(gl, program1, vertexs, 'a_Position', 3);
    myInitBuffer(gl, program1, linePointer, null, null, true);
    //绘制场景
    myinitMatrix(gl, program1, start);
    // 执行画线条的指令
    gl.drawElements(gl.LINES, linePointer.length, gl.UNSIGNED_SHORT, 0);
  }

  // 指定清除canvas的颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  let start = 0, speed = 0.5;
  var tick = function() {
    start += speed;
       // 紧贴表面偏移量，避免两个左边相同的元素互相影响。
    gl.enable(gl.POLYGON_OFFSET_FILL);
	gl.polygonOffset(1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawSphere(start);
    gl.disable(gl.POLYGON_OFFSET_FILL);
    // 为了方便，我们也换出紧贴表面的视觉引导线
    drawLine(start);
    requestAnimationFrame(tick);
  }
  
  tick();
}

const RADIUS = 1, RESOLUTION = 30;
const theta = (360 / RESOLUTION) * (Math.PI / 180);
const beta = (360 / RESOLUTION) * (Math.PI / 180);
//计算出圆体以及表面线条的各个点的位置
function calculatePoints() {
    let vertexs = [], pointer = [], linePointer = [];
     for (let index = 0; index <= RESOLUTION; index++) {
         // 同等高度的Y值
        const y = Math.cos(theta * index) * RADIUS;
        // 底边作为斜边的长度
        const d = Math.sin(theta * index) * RADIUS;
        for (let index1 = 0; index1 <= RESOLUTION; index1++) {
            // 斜边的余弦即是x轴的距离
            const x = Math.cos(beta * index1) * d;
            // 斜边的正弦即是Z轴的距离
            const z = Math.sin(beta * index1) * d;
            vertexs.push(x);
            vertexs.push(y);
            vertexs.push(z);
        }
     }

    /* 计算出顶点的位置为 [0, 1,..... 一个循环之后, RESOLUTION, RESOLUTION + 1]
     我们需要连接的是 0, 1, RESOLUTION 顶点的位置拼凑成一个三角形
    */
    for(var index = 0; index < Math.pow(RESOLUTION, 2); index ++)
    {
            pointer.push(index); // 本行第一个
            pointer.push(index + RESOLUTION + 1); // 下一行第一个
            pointer.push(index + 1); // 本行第二个

            pointer.push(index + 1); // 本行第二个
            pointer.push(index + RESOLUTION + 1); // 下一行第一个
            pointer.push(index + RESOLUTION + 2); // 下一行第二个

            //到此，一个四边形被拼凑成功

            // 划线只需要沿着精度和纬度连接每个点即可
            linePointer.push(index);
            linePointer.push(index + 1);
            linePointer.push(index);
            linePointer.push(index + RESOLUTION + 1);


    }

    console.log(vertexs, pointer, linePointer);
    
    return {
        vertexs : new Float32Array( vertexs ),
        pointer: new Uint16Array(pointer),
        linePointer: new Uint16Array(linePointer)
    };
}