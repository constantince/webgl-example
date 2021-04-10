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

var VSHADER_SOURCE =
'attribute vec4 a_Position;\n' +
'void main() {\n' +
'  gl_Position = a_Position;\n' +
'  gl_PointSize = 100.0;\n' +
'}\n';

// Fragment shader program
var FSHADER_SOURCE =
'void main() {\n' +
'  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
'}\n';

function main() {
// Retrieve <canvas> element
var canvas = document.getElementById('webgl');

// Get the rendering context for WebGL
var gl = canvas.getContext("webgl");
if (!gl) {
  console.log('Failed to get the rendering context for WebGL');
  return;
}
const program = myInitShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);

// Initialize shaders
if (!program) {
  console.log('Failed to intialize shaders.');
  return;
}
gl.useProgram(program)
var a_Position = gl.getAttribLocation(program, 'a_Position');
if (a_Position < 0) {
  console.log('Failed to get the storage location of a_Position');
  return;

}

  // Specify the color for clearing <canvas>
gl.clearColor(0.0, 0.0, 0.0, 1.0);

// Clear <canvas>
gl.clear(gl.COLOR_BUFFER_BIT);

// Pass the position of a point to a_Position variable
gl.vertexAttrib3f(a_Position, -0.14, -0.09, 0.0);

  // Draw
gl.drawArrays(gl.POINTS, 0, 1);
}

