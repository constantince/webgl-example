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

function cubeVertex() {

    var vertices = new Float32Array([   // Coordinates
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
       -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
       -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
     ]);
   
   
     var colors = new Float32Array([    // Colors
       1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
       1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
       1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
       1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
       1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
       1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
    ]);
   
   
     var normals = new Float32Array([    // Normal
       0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
       1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
       0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
      -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
       0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
       0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
     ]);
   
   
     // Indices of the vertices
     var triangleIndices = new Uint16Array([
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
       12,13,14,  12,14,15,    // left
       16,17,18,  16,18,19,    // down
       20,21,22,  20,22,23     // back
    ]);
    	// vertices definition
	////////////////////////////////////////////////////////////
	// const vertices = new Float32Array([
	// 	-0.5, -0.5,  0.5,
	// 	 0.5, -0.5,  0.5,
	// 	-0.5,  0.5,  0.5,
	// 	 0.5,  0.5,  0.5,
	// 	-0.5, -0.5, -0.5,
	// 	 0.5, -0.5, -0.5,
	// 	-0.5,  0.5, -0.5,
	// 	 0.5,  0.5, -0.5
	// ]);

	// triangles definition
	////////////////////////////////////////////////////////////
	
	// const triangleIndices = new Uint16Array([
	// 	0, 1, 2,  2, 1, 3,  // front
	// 	5, 4, 7,  7, 4, 6,  // back
	// 	4, 0, 6,  6, 0, 2,  // left
	// 	1, 5, 3,  3, 5, 7,  // right
	// 	2, 3, 6,  6, 3, 7,  // top
	// 	4, 5, 0,  0, 5, 1   // bottom
	// ]);

    // const normals = new Float32Array([
    //    0, 0, -1,
    //    0, 0, -1,
    //    0, 0, -1,
    //    0, 0, -1,
    //    0, 0, -1,
    //    0, 0, -1,

    //    0, 0, 1,
    //    0, 0, 1,
    //    0, 0, 1,
    //    0, 0, 1,
    //    0, 0, 1,
    //    0, 0, 1,

    //    0, 1, 0,
    //    0, 1, 0,
    //    0, 1, 0,
    //    0, 1, 0,
    //    0, 1, 0,
    //    0, 1, 0,

    //    0, -1, 0,
    //    0, -1, 0,
    //    0, -1, 0,
    //    0, -1, 0,
    //    0, -1, 0,
    //    0, -1, 0,

    //   -1, 0, 0,
    //   -1, 0, 0,
    //   -1, 0, 0,
    //   -1, 0, 0,
    //   -1, 0, 0,
    //   -1, 0, 0,

    //    1, 0, 0,
    //    1, 0, 0,
    //    1, 0, 0,
    //    1, 0, 0,
    //    1, 0, 0,
    //    1, 0, 0,
    // ]);

    return {
        vertices,
        triangleIndices,
        normals,
        len: triangleIndices.length
    }

}

function myInitBuffer(gl, program, data, name, size, type = false) {
    const buffer = gl.createBuffer();
    const bufferType =  type ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
    gl.bindBuffer(bufferType, buffer)
    gl.bufferData(bufferType, data, gl.STATIC_DRAW);

    if( !type ) {
        const target = gl.getAttribLocation(program, name);
        if (target < 0) {
            console.log('Failed to get the storage location of ' + attribute);
            return false;
          }
        gl.vertexAttribPointer(target, size, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(target);
    }
}