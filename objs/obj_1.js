// const vertex = `
//     attribute vec4 a_Position;
//     uniform mat4 u_ProjectionMatrix;
//     attribute vec2 a_TextCoord;
//     varying vec2 v_TextCoord;
//     void main() {
//         gl_Position = u_ProjectionMatrix * a_Position;
//         v_TextCoord = a_TextCoord;
//     }
// `;

// const fragment = `
//     precision mediump float;
//     uniform sampler2D u_Sampler;
//     varying vec2 v_TextCoord;
//     void main() {
//         gl_FragColor = texture2D(u_Sampler, v_TextCoord);
//     }
// `;

var vertex =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '}\n';

// Fragment shader program
var fragment =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
  '}\n';

function loadShaders(gl, shaderArrays, SHADERS) {
    return shaderArrays.map((v, i) => {
        const Shader = gl.createShader(SHADERS[i]);
        gl.shaderSource(Shader, v);
        gl.compileShader(Shader);
        if(!gl.getShaderParameter(Shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(Shader))
        }
        return Shader;
    })
}

function programShader(gl, array) {
    const pro = gl.createProgram();
    array.forEach(v => {
        gl.attachShader(pro, v);
    });
   
    gl.linkProgram(pro);

    if (!gl.getProgramParameter(pro, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(pro))
    };

    gl.useProgram(pro);

    return pro;
}

function initShader(gl, vtx, fgt) {
    const result = loadShaders(gl, [vtx, fgt], [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER])
    return programShader(gl, result);
}

function initBuffer(gl, program, u) {
    var vertices = new Float32Array([   // Vertex coordinates
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
       -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
       -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
     ]);
   
     var colors = new Float32Array([     // Colors
       0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
       0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
       1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
       1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
       1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
       0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
     ]);

     var texture = new Float32Array([
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
        0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
        1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
        0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
        0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
     ]);
   
     var indices = new Uint8Array([       // Indices of the vertices
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
       12,13,14,  12,14,15,    // left
       16,17,18,  16,18,19,    // down
       20,21,22,  20,22,23     // back
     ]);

    // const size = data.BYTES_PER_ELEMENT;
    if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position', program)) return -1; // Vertex coordinates
    if (!initArrayBuffer(gl, texture, 2, gl.FLOAT, 'a_TexCoord', program)) return -1;// Texture coordinates
  
    // const buffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // const a_Position = gl.getAttribLocation(program, "a_Position");
    // gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(a_Position);


    // const buffer1 = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, buffer1);
    // gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    // const a_Color = gl.getAttribLocation(program, "a_Color");
    // gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(a_Color);

    // const buffer1 = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, buffer1);
    // gl.bufferData(gl.ARRAY_BUFFER, texture, gl.STATIC_DRAW);

    // const a_TextCoord = gl.getAttribLocation(program, "a_TextCoord");
    // gl.vertexAttribPointer(a_TextCoord, 2, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(a_TextCoord);

    // gl.bindBuffer(gl.ARRAY_BUFFER, null);

   const buffer2 = gl.createBuffer();
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer2);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

   return indices.length;
}

function initArrayBuffer(gl, data, num, type, attribute, program) {
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
    var a_attribute = gl.getAttribLocation(program, attribute);
    if (a_attribute < 0) {
      console.log('Failed to get the storage location of ' + attribute);
      return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment to a_attribute variable
    gl.enableVertexAttribArray(a_attribute);
  
    return true;
  }

function initMatrix(gl, program, angle, x) {
    // const M = new Matrix4();
    // console.log("angle is", angle);
    // M.rotate(angle, 1.0, 0.0, 0.0); // Rotate appropriately
    // M.rotate(angle, 0.0, 1.0, 0.0);
    // M.rotate(angle, 0.0, 0.0, 1.0);
    // M.setRotate(angle, 0, 0, 1);
    // const original = gl.getUniformLocation(program, "u_ViewMatrix");
    // gl.uniformMatrix4fv(original, false, M.elements);

    const mM = new Matrix4();
    console.log(angle);
    mM.setPerspective(30, 1, 1, 100).lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
    mM.rotate(angle, 0.0, 1.0, 0.0); 
    const u_ProjectionMatrix = gl.getUniformLocation(program, "u_ProjectionMatrix");
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, mM.elements);
    
}

function initTextures(gl,  program) {
    // Create a texture object
    var texture = gl.createTexture();
    if (!texture) {
      console.log('Failed to create the texture object');
      return false;
    }
  
    // Get the storage location of u_Sampler
    var u_Sampler = gl.getUniformLocation(program, 'u_Sampler');
    if (!u_Sampler) {
      console.log('Failed to get the storage location of u_Sampler');
      return false;
    }
  
    // Create the image object
    var image = new Image();
    if (!image) {
      console.log('Failed to create the image object');
      return false;
    }
    // Register the event handler to be called when image loading is completed
    image.onload = function(){ loadTexture(gl, texture, u_Sampler, image); };
    // Tell the browser to load an Image
    image.src = './brick.jpg';
  
    return true;
  }

function loadTexture(gl, texture, u_Sampler, image) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
    // Activate texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the image to texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
    // Pass the texure unit 0 to u_Sampler
    gl.uniform1i(u_Sampler, 0);
  }



function main() {
    const canvas = document.getElementById("cube");
    const gl = canvas.getContext("webgl");
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    const program = initShader(gl, vertex, fragment);
    let va = 1, vx = 5, original_angle = 0, original_x = 0;
    gl.enable(gl.DEPTH_TEST);
    
    
    function move() {
        original_angle = original_angle + va;
        // console.log(original_x);
        // if(original_x + 0.5 > 1 || original_x < -1) {
        //     vx = -vx;
        // }
        original_x = original_x + vx;
        initMatrix(gl, program, original_angle, original_x);
        const number = initBuffer(gl, program);
        gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
        console.log(number);
        initTextures(gl, program);
        gl.drawElements(gl.TRIANGLES, number, gl.UNSIGNED_BYTE, 0);

       
        // requestAnimationFrame(move);
    }

    move();
}



