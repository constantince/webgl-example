// RotateObject.js (c) 2012 matsuda and kanda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'varying vec2 v_TexCoord;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  'varying vec4 v_Color;\n' +
  'uniform bool u_Special;\n' +
  'void main() {\n' +
  '   gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
  '}\n';

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('cube');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex information
  
  if (32 < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix) { 
    console.log('Failed to get the storage location of uniform variable');
    return;
  }

  // Calculate the view projection matrix
  var viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  // Register the event handler
  var currentAngle = [0.0, 0.0]; // Current rotation angle ([x-axis, y-axis] degrees)
  initEventHandlers(canvas, currentAngle);

  // Set texture
  // if (!initTextures(gl)) {
  //   console.log('Failed to intialize the texture.');
  //   return;
  // }

  // initIndex(gl, [ 0, 1, 2,   0, 2, 3]);
  // draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle);
  // initIndex(gl, [ 4, 5, 6,   4, 6, 7]);
  // draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle);
  // initIndex(gl, [ 8, 9,10,   8,10,11]);
  // draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle);
  // initIndex(gl, [ 12,13,14,  12,14,15]);
  // draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle);
  // initIndex(gl, [ 16,17,18,  16,18,19]);
  // draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle);
  // initIndex(gl, [ 20,21,22,  20,22,23 ]);
  // draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle);
  initVertexBuffers(gl, viewProjMatrix, u_MvpMatrix, currentAngle);
  // var tick = function() {   // Start drawing
  //   initVertexBuffers(gl, viewProjMatrix, u_MvpMatrix, currentAngle);
  //   // draw(gl, 6, viewProjMatrix, u_MvpMatrix, currentAngle);
  //   // requestAnimationFrame(tick);

  // };
  // tick();
}

//   // Indices of the vertices
//   var indices = new Uint8Array([
//     0, 1, 2,   0, 2, 3,    // front
//     4, 5, 6,   4, 6, 7,    // right
//     8, 9,10,   8,10,11,    // up
//    12,13,14,  12,14,15,    // left
//    16,17,18,  16,18,19,    // down
//    20,21,22,  20,22,23     // back
//  ]);

function initVertexBuffers(gl, viewProjMatrix, u_MvpMatrix, currentAngle) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
  ]);

  var color = new Float32Array([
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
    1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
    0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 0.0   // v4-v7-v6-v5 back  
]);

  var texCoords = new Float32Array([   // Texture coordinates
      1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
      0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
      1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
      1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
      0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
      0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
  ]);

  // // Indices of the vertices
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

  // Write vertex information to buffer object
  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) return -1; // Vertex coordinates
  if (!initArrayBuffer(gl, texCoords, 2, gl.FLOAT, 'a_TexCoord')) return -1;// Texture coordinates
  // if (!initArrayBuffer(gl, color, 3, gl.FLOAT, 'a_Color')) return -1;// Texture coordinates

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var unity = [
    {img: './brick.jpg', pointer: [ 0, 1, 2,   0, 2, 3]},
    {img: './sky.jpg', pointer: [ 4, 5, 6,   4, 6, 7]},
    {img: './js.jpg', pointer: [ 8, 9,10,   8,10,11]},
    {img: './python.png', pointer: [ 12,13,14,  12,14,15]},
    {img: './brick1.png', pointer: [ 16,17,18,  16,18,19]},
    {img: './css.jpeg', pointer: [ 20,21,22,  20,22,23 ]}
  ]

  
  // var drawed = false;
  var tick = function() {   // Start drawing
    for (let index = 0; index < unity.length; index++) {
      const element = unity[index];
      initIndex(element.img, gl, element.pointer, viewProjMatrix, u_MvpMatrix, currentAngle);
    }
    
    // draw(gl, 6, viewProjMatrix, u_MvpMatrix, currentAngle);
    // setTimeout(function() {
    requestAnimationFrame(tick);
    // }, 2000)
   

  };
  tick();
  


  

  return indices.length;
}

var shadow = {};
var g_imgs = [];
function initIndex(src, gl, ind, viewProjMatrix, u_MvpMatrix, currentAngle) {
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
      return -1;
    }
  // Write the indices to the buffer object
  // Create a buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(ind), gl.STATIC_DRAW); 
    initTextures(src, gl, viewProjMatrix, u_MvpMatrix, currentAngle, indexBuffer);
  
  

}

function initEventHandlers(canvas, currentAngle) {
  var dragging = false;         // Dragging or not
  var lastX = -1, lastY = -1;   // Last position of the mouse

  canvas.onmousedown = function(ev) {   // Mouse is pressed
    var x = ev.clientX, y = ev.clientY;
    // Start dragging if a moue is in <canvas>
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      lastX = x; lastY = y;
      dragging = true;
    }
  };

  canvas.onmouseup = function(ev) { dragging = false;  }; // Mouse is released

  canvas.onmousemove = function(ev) { // Mouse is moved
    var x = ev.clientX, y = ev.clientY;
    if (dragging) {
      var factor = 100/canvas.height; // The rotation ratio
      var dx = factor * (x - lastX);
      var dy = factor * (y - lastY);
      // Limit x-axis rotation angle to -90 to 90 degrees
      currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
      currentAngle[1] = currentAngle[1] + dx;
    }
    lastX = x, lastY = y;
  };
}

var g_MvpMatrix = new Matrix4(); // Model view projection matrix
function draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle) {
  // Caliculate The model view projection matrix and pass it to u_MvpMatrix
  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);

  
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // Draw the cube
  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // Clear buffers
}

function initArrayBuffer(gl, data, num, type, attribute) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment to a_attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

function initTextures(src, gl, viewProjMatrix, u_MvpMatrix, currentAngle, b) {


  

  // Create a texture object
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  // Get the storage location of u_Sampler
  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }

  if(shadow[src]) {
    loadTexture(gl, texture, u_Sampler, shadow[src], viewProjMatrix, u_MvpMatrix, currentAngle, b);
  } else {
    // Create the image object
    var image = new Image();
    if (!image) {
      console.log('Failed to create the image object');
      return false;
    }
    // Register the event handler to be called when image loading is completed
    image.onload = function(){ loadTexture(gl, texture, u_Sampler, image, viewProjMatrix, u_MvpMatrix, currentAngle, b); };
    // Tell the browser to load an Image
    image.src = src;
    shadow[src] = image;

    return true;
  }

  
}

function loadTexture(gl, texture, u_Sampler, image, viewProjMatrix, u_MvpMatrix, currentAngle, b) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
  // Activate texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set texture parameters
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); 
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the image to texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Pass the texure unit 0 to u_Sampler
  gl.uniform1i(u_Sampler, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b);

  console.log("drawed.");
  draw(gl, 6, viewProjMatrix, u_MvpMatrix, currentAngle);
}
