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

function myinitMatrix(gl, program, start) {
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
    mat4.rotateX(fM, fM, glMatrix.toRadian(-15));
    mat4.rotateY(fM, fM, glMatrix.toRadian(start));

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
    v_Color = a_Color;
  }`

// 片元着色器
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec4 v_Color;
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;

// 顶点着色器。
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

// 片元着色器
var FSHADER_SOURCE_LINE =`
  precision mediump float;
  varying vec4 v_Color;
  void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
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
  if (!program || !program1) {
    console.log('Failed to intialize shaders.');
    return;
  }
  
  

  const {pointer, vertexs, lPointer, len} = calculatePoints();

  var draw_cone = function(rad) {
    gl.useProgram(program);
    myInitBuffer(gl, program, vertexs, 'a_Position', 3);
    myInitBuffer(gl, program, pointer, null, null, true);
    //绘制场景
    myinitMatrix(gl, program, rad);
    // 执行画点的指令
    gl.drawElements(gl.TRIANGLES, len, gl.UNSIGNED_SHORT, 0);
  }

  var draw_line = function(rad) {
    gl.useProgram(program1);
    myInitBuffer(gl, program1, vertexs, 'a_Position', 3);
    myInitBuffer(gl, program1, lPointer, null, null, true);
    //绘制场景
    myinitMatrix(gl, program1, rad);
    // 执行画点的指令
    gl.drawElements(gl.LINES, lPointer.length, gl.UNSIGNED_SHORT, 0);
  }

  let start = 0, speed = 0.5;
  var tick = () => {
    start += speed;
    // 指定清除canvas的颜色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 清除canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.POLYGON_OFFSET_FILL);
	  gl.polygonOffset(1.0, 1.0);
    draw_cone(start);
    gl.disable(gl.POLYGON_OFFSET_FILL);
    draw_line(start);

    requestAnimationFrame(tick)
  }
  
  tick();

}

//计算出圆锥体的各个点的位置
function calculatePoints() {
    const HEIGHT = 2.5,
    TOP = [0, HEIGHT, 0], RADIUS = 1, RESOLUTION = 15, BOTTOM = [0, 0, 0],
    theta = 360 / RESOLUTION * Math.PI / 180;
    let vertexs = [];
    for (let index = 0; index < RESOLUTION; index++) {
        vertexs.push(Math.cos(theta * index) * RADIUS);
        vertexs.push(0);
        vertexs.push(Math.sin(theta * index) * RADIUS);
    }
    // 顶点位置0，其他点1~resolution 底部中心点的位置 resolution + 1;
    vertexs = TOP.concat(vertexs).concat(BOTTOM);
    
    let pointer = [];
    //斜边
    for (let index = 0; index < RESOLUTION; index++) {
        //永远是第一个顶点开始的
        pointer.push(0); // 顶部点的位置，在 0；
        pointer.push(1 + (index % RESOLUTION));
        pointer.push(1 + ((index+1) % RESOLUTION));
    }
    //底边
    for (let index = 0; index < RESOLUTION; index++) {
        // 永远是底部中心点开始的
        pointer.push(RESOLUTION + 1);// 底部中心点的在vertexs中的位置 即 1 + RESOLUTION
        pointer.push(1 + (index % RESOLUTION));
        pointer.push(1 + ((index+1) % RESOLUTION));
    }

    let lPointer = [];
    //线条
    for (let index = 1; index <= RESOLUTION; index++) {
      //永远是第一个顶点开始的
      lPointer.push(0); // 顶部点的位置，在 0；
      lPointer.push(1 + (index % RESOLUTION));

      lPointer.push(1 + (index % RESOLUTION));
      lPointer.push(RESOLUTION + 1);
    }



    vertexs = new Float32Array(vertexs);
    pointer = new Uint16Array(pointer);
    lPointer = new Uint16Array(lPointer);

    return {vertexs, pointer, lPointer, len: pointer.length};
}
  
