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

function myinitMatrix(gl, program, rad) {
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
    mat4.rotateX(fM, fM, glMatrix.toRadian(30));
    mat4.rotateY(fM, fM, glMatrix.toRadian(rad));

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
    gl_PointSize = 10.0;
  }`

// 片元着色器
var FSHADER_SOURCE =`
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
  
  if (!program) {
    console.log('Failed to intialize shaders.');
    return;
  }
  
  gl.useProgram(program);

  const {pointer, color, vertexs, len} = calculatePoints();


  myInitBuffer(gl, program, vertexs, 'a_Position', 3);
  myInitBuffer(gl, program, pointer, null, null, true);
  let ang = 0.0;
  var tick = () => {
    // ccalculateAngle(ang)
    // 绘制场景
    myinitMatrix(gl, program, calculateAngle(ang));
    // 指定清除canvas的颜色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // 清除canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 执行正方形的指令
    console.log(len)
    gl.drawElements(gl.LINES, len, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(tick);
  }
  tick();
}

const angleStep = 60, start = Date.now();
var then = start;

function calculateAngle(prev_angle) {
  let now = Date.now();
  let elspeed = now - start;
  let newangle = prev_angle + (angleStep * elspeed) / 1000; 
  then = start;
  return newangle %= 360;
}

//计算出立方体的各个点的位置
function calculatePoints() {
    const vertexs = new Float32Array([
       0,0, 0,0, 0,0, // v1
       0.0, 1.0, 0.0, // v2
       1.0, 1.0, 0.0, // v3
       1.0, 0.0, 0.0, //v4

       0.0, 0.0, 1.0, //v5
       0.0, 1.0, 1.0, // v6
       1.0, 1.0, 1.0, //v7
       1.0, 0.0, 1.0 // v8
    ]);

    const pointer = new Uint16Array([
        1, 2,
        2, 3,
        3, 4,
        4, 1,

        5, 6,
        6, 7,
        7, 8,
        8, 5,
       
        1, 5,
        4, 8,
        2, 6,
        3, 7
    ]);

    return {vertexs, pointer, len: pointer.length};
}
  
