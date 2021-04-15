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
    v_Color = vec4(1.0, 1.0, 1.0, 1.0);
}`

// 片元着色器
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec4 v_Color;
  void main() {
    gl_FragColor = v_Color;
}`

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
  
  if (!program) {
    console.log('Failed to intialize shaders.');
    return;
  }
  
  
  const {pointer, vertexs, len, colors} = calculatePoints();
 


  function drawCylinder(start) {
    gl.useProgram(program);
    
    myInitBuffer(gl, program, vertexs, 'a_Position', 3);
    // myInitBuffer(gl, program, colors, 'a_Color', 3);
    myInitBuffer(gl, program, pointer, null, null, true);

     //绘制场景
     myinitMatrix(gl, program, start);

     // 执行画点的指令
    gl.drawElements(gl.TRIANGLE_STRIP, len, gl.UNSIGNED_SHORT, 0);

  }

  function drawLine() {
    gl.useProgram(program1);
    myInitBuffer(gl, program1, vertexs, 'a_Position', 3);
    //绘制场景
    myinitMatrix(gl, program1, start);
    // 执行画点的指令
    gl.drawArrays(gl.LINE_STRIP, 0, vertexs.length/3);
  }

 WebGL2RenderingContext.
  

  
  // 指定清除canvas的颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  let start = 0, speed = 0.5;
  var tick = function() {
    start += speed;
       // 清除canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // drawCylinder(start);
    drawLine(start);
   

    // requestAnimationFrame(tick);
  }
  
  tick();
}

//计算出圆柱体的各个点的位置
function calculatePoints() {
    const TOP = [0, 2, 0], RADIUS = 1, RESOLUTION = 30, BOTTOM = [0, 0, 0],
    theta = 360 / RESOLUTION * Math.PI / 180;
    let vertexs = [];
    let colors = [];
    for (let index = 0; index < RESOLUTION; index++) {
        const x = Math.cos(theta * index) * RADIUS;
        const z = Math.sin(theta * index) * RADIUS;
        const UADvetices = [x, 2, z, x, 0, z];
        vertexs = vertexs.concat(UADvetices);
    }
    // 顶点位置0，其他点1~resolution 底部中心点的位置 resolution + 1;
    vertexs = vertexs.concat(BOTTOM).concat(TOP);
    colors = [Math.random(1), Math.random(1), Math.random(1)].concat(vertexs).concat([Math.random(1), Math.random(1), Math.random(1)]);
    let pointer = [];
    // //斜边
    for (let index = 0; index < RESOLUTION * 2; index++) {
        pointer.push(index); // 顶部点的位；
        /* 通过 % 实现当Y Z大于resultion的时候取绝对值，实现点位的循环。
        如：x =40 时 x 为 0  或者x = 41时，x 为 1；
        因为矩形的最后一个三角面点需要和第一个点和第二个点进行合并。
        */
        pointer.push( (index + 1) % (RESOLUTION * 2) );
        pointer.push( (index + 2) % (RESOLUTION * 2) );

    }

    
 


    //底边
    for (let index = 0; index < RESOLUTION; index++) {
        const step = (2 * index + 1) % (2 * RESOLUTION);
        const step2 = (2 * (index + 1) + 1) % ( 2* RESOLUTION);
        // 永远是底部中心点开始的
        pointer.push(step);
        pointer.push(RESOLUTION+1);// 底部中心点的在vertexs中的位置 即 1 + RESOLUTION
        pointer.push(step2);
    }

    //顶边
    for (let index = 0; index < RESOLUTION; index++) {
      const step = (2 * index + 2) % (2 * RESOLUTION);
      const step2 = (2 * (index + 2)) % ( 2* RESOLUTION);
      // 永远是底部中心点开始的
      pointer.push(step);
      pointer.push(RESOLUTION);// 底部中心点的在vertexs中的位置 即 1 + RESOLUTION
      pointer.push(step2);
  }


    vertexs = new Float32Array(vertexs);
    colors = new Float32Array(colors);
    pointer = new Uint16Array(pointer);
    return {vertexs, colors, pointer, len: pointer.length};
}