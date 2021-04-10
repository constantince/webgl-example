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
        gl.vertexAttribPointer(target, size, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(target);
    }
}


// 顶点着色器。
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  void main() {
    gl_Position = a_Position;
  }`

// 片元着色器
var FSHADER_SOURCE =`
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
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
  
  // 初始化着色器程序
  const program = myInitShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);
  
  if (!program) {
    console.log('Failed to intialize shaders.');
    return;
  }
  
  gl.useProgram(program);

  //在webgl中定义好四个点的位置
  const points = new Float32Array([
      0,0, 0.0,
      0.5, 0.5,
      0.0, 0.5,
      0.5, 0.0
  ])

  myInitBuffer(gl, program, points, 'a_Position', 2);
  
    // 指定清除canvas的颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // 清除canvas
  gl.clear(gl.COLOR_BUFFER_BIT);

    // 执行画一个点的指令 使用STRIP模式 
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
  
