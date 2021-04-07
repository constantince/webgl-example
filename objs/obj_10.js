const VERTEX_SHADER_CUBE = `
    attribute vec4 a_Position;
    uniform mat4 a_ProjectionViewMatrix;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    uniform bool u_Clicked;
    void main() {
        gl_Position = a_ProjectionViewMatrix * a_Position;
        if (u_Clicked) {
            v_Color = vec4(1.0, 0.0, 0.0, 1.0);
        } else {
            v_Color = a_Color;
        }
        
    }
`;

const VERTEX_SHADER_SPHERE = `
    attribute vec4 a_Position;
    uniform mat4 a_ProjectionViewMatrix;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    uniform bool u_Clicked;
    void main() {
        gl_Position = a_ProjectionViewMatrix * a_Position;
        if (u_Clicked) {
            v_Color = vec4(0.0, 1.0, 0.0, 1.0);
        } else {
            v_Color = vec4(1.0, 0.0, 0.0, 1.0);
        }
        
    }
`;


const FRAG_SHADER_CUBE = `
    precision mediump float;
    varying vec4 v_Color;
    void main() {
        gl_FragColor = v_Color;
    }
`;

const FRAG_SHADER_SPHERE = `
    precision mediump float;
    varying vec4 v_Color;
    void main() {
        gl_FragColor = v_Color;
    }
`;

class Cube {
    name = "cube";
    angle = 0;
    size = 15;
    speed = 0;
    selectedColor = 255;
    position = [2, -1, 0]
    constructor(webgl, program) {
        this.webgl = webgl;
        this.program = getProgram(webgl, VERTEX_SHADER_CUBE, FRAG_SHADER_CUBE);
    }

    draw(angle, y = 0, size) {
        this.angle += this.speed;
        this.webgl.useProgram(this.program); 
        const u_Click = this.webgl.getUniformLocation(this.program, "u_Clicked");
        this.webgl.uniform1i(u_Click, y);
        this.number = createCubeVertexBuffer(this.webgl, this.program);
        createProjectionView(this.webgl, this.program, this.position, this.angle, size);
        this.webgl.drawElements(this.webgl.TRIANGLES, this.number, this.webgl.UNSIGNED_SHORT, 0);
    }

    click() {
        this.webgl.drawElements(this.webgl.TRIANGLES, this.number, this.webgl.UNSIGNED_SHORT, 0);
    }
}

class Sphere {
    name = "sphere";
    selectedColor = 226;
    angle = 0;
    size = 15;
    speed = 0;
    position = [-2, -1, 0]
    constructor(webgl) {
        this.webgl = webgl;
        this.program = getProgram(webgl, VERTEX_SHADER_SPHERE, FRAG_SHADER_CUBE);
    }

    draw(angle, y = 0, size) {
        this.angle += this.speed;
        this.webgl.useProgram(this.program); 
        const u_Click = this.webgl.getUniformLocation(this.program, "u_Clicked");
        this.webgl.uniform1i(u_Click, y);
        this.number = createSphereVertexBuffer(this.webgl, this.program);
        createProjectionView(this.webgl, this.program, this.position, this.angle, size);
        this.webgl.drawElements(this.webgl.TRIANGLES, this.number, this.webgl.UNSIGNED_SHORT, 0);
    }

    click() {
        this.webgl.drawElements(this.webgl.TRIANGLES, this.number, this.webgl.UNSIGNED_SHORT, 0);
    }
}

class Cone {
    name = "cone";
    selectedColor = 226;
    angle = 0;
    size = 15;
    speed = 0.5;
    position = [0, 1.5, 0]
    constructor(webgl) {
        this.webgl = webgl;
        this.program = getProgram(webgl, VERTEX_SHADER_CUBE, FRAG_SHADER_CUBE);
    }

    draw(angle, y = 0, size) {
        this.angle += this.speed;
        console.log(this.angle)
        this.webgl.useProgram(this.program); 
        const u_Click = this.webgl.getUniformLocation(this.program, "u_Clicked");
        this.webgl.uniform1i(u_Click, 1);
        this.number = createConeVertexBuffer(this.webgl, this.program);
        createProjectionView(this.webgl, this.program, this.position, this.angle, size);
        // console.log(this.number)
        this.webgl.drawElements(this.webgl.TRIANGLES, this.number, this.webgl.UNSIGNED_SHORT, 0);
    }

    click() {
        this.webgl.drawElements(this.webgl.TRIANGLES, this.number, this.webgl.UNSIGNED_SHORT, 0);
    }  
}


var animationParameters = {
    speed: 1,
    vsize: 0
}
function main() {
    console.log("let us start...");
    const canvas = document.getElementById("cube");
    const webgl = canvas.getContext("webgl");
    // const program = getProgram(webgl, VERTEX_SHADER_CUBE, FRAG_SHADER_CUBE);
    const cube = new Cube(webgl);
    const sphere = new Sphere(webgl);
    const cone = new Cone(webgl);
    webgl.clearColor(0.75, 0.85, 0.8, 0.9);
    webgl.enable(webgl.DEPTH_TEST);
    webgl.enable(webgl.CULL_FACE);
    webgl.enable(webgl.POLYGON_OFFSET_FILL);
	webgl.polygonOffset(1.0, 1.0);
	webgl.frontFace(webgl.CCW);
	webgl.cullFace(webgl.BACK);
    // webgl.useProgram(program);
    eventInitialion(canvas, webgl,  [cube, sphere]);
    let angle = 0, size = 15;
    var tick = () => {
        // angle += animationParameters.speed;
        // size += animationParameters.vsize;
        // console.log(size);
        // animationParameters.size += animationParameters.v_size
        webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BIT);
        // cube.draw(angle, 0, size);
        cube.draw(angle, 0, size);
        sphere.draw(angle, 0, size);
        cone.draw(angle, 0, size);
        // requestAnimationFrame(tick);
    }
    tick();
};

function objectSelectedAnimation(object) {
    // let angle = 0, speed = 1;
    // function start() {
    //     angle += speed;
    //     object.draw(angle, 0);
    //     requestAnimationFrame(start);
    // }
    // start();
}
// initialize shaders and return program;
function getProgram(gl, vshader, fshader) {
    const vShader = loadShader.call(gl, vshader, gl.VERTEX_SHADER);
    const fShader = loadShader.call(gl, fshader, gl.FRAGMENT_SHADER);
    if( !vShader || !fShader ) return false;
    const program = gl.createProgram();

    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);

    gl.linkProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        const errorInfo = gl.getProgramInfoLog(program);
        console.warn(errorInfo);
    }

    return program;
}
// Loader shader
function loadShader(text, type) {
    const vShader = this.createShader(type);
    this.shaderSource(vShader, text);
    this.compileShader(vShader);

    if(!this.getShaderParameter(vShader, this.COMPILE_STATUS)) {
        const info = this.getShaderInfoLog(vShader);
        console.warn(info);
        return false;
    }

    return vShader;
}
// vertexs for cube
function createCubeVertexBuffer(gl, program) {
    const vertex = new Float32Array([
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
       -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
       -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
    ]);

    const color = new Float32Array([
        0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
       0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
       1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
       1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
       1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
       0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
    ]);

    const pointer = new Uint16Array([
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
       12,13,14,  12,14,15,    // left
       16,17,18,  16,18,19,    // down
       20,21,22,  20,22,23     // back
    ]);

    loadBuffer(gl, vertex, 'a_Position', program);
    loadBuffer(gl, color, 'a_Color', program);
    loadBuffer(gl, pointer, null, program, gl.ELEMENT_ARRAY_BUFFER);

    return pointer.length;

}

function Cone1 (resolution) {

	var name = "cone";

	// vertices definition
	////////////////////////////////////////////////////////////
	
	var vertices = new Float32Array(3*(resolution+2));
	
	// apex of the cone
	vertices[0] = 0.0;
	vertices[1] = 2.0;
	vertices[2] = 0.0;
	
	// base of the cone
	var radius = 1.0;
	var angle;
	var step = 6.283185307179586476925286766559 / resolution;

	var vertexoffset = 3;
	for (var i = 0; i < resolution; i++) {
	
		angle = step * i;
		
		vertices[vertexoffset] = radius * Math.cos(angle);
		vertices[vertexoffset+1] = 0.0;
		vertices[vertexoffset+2] = radius * Math.sin(angle);
		vertexoffset += 3;
	}
	
	vertices[vertexoffset] = 0.0;
	vertices[vertexoffset+1] = 0.0;
	vertices[vertexoffset+2] = 0.0;
	
	// triangles defition
	////////////////////////////////////////////////////////////
	
	var triangleIndices = new Uint16Array(3*2*resolution);
	
	// lateral surface
	var triangleoffset = 0;
	for (var i = 0; i < resolution; i++) {
	
		triangleIndices[triangleoffset] = 0;
		triangleIndices[triangleoffset+1] = 1 + (i % resolution);
		triangleIndices[triangleoffset+2] = 1 + ((i+1) % resolution);
		triangleoffset += 3;
	}
	
	// bottom part of the cone
	for (var i = 0; i < resolution; i++) {
	
		triangleIndices[triangleoffset] = resolution+1;
		triangleIndices[triangleoffset+1] = 1 + (i % resolution);
		triangleIndices[triangleoffset+2] = 1 + ((i+1) % resolution);
		triangleoffset += 3;
	}

    console.log(vertices, triangleIndices)
}

// Cone1(6);
// vertexs for cone
function createConeVertexBuffer(gl, program) {
    const RADIUS = 1, TOP = [0, 1, 0], RESOLUTION = 16,
    theta = (360 / RESOLUTION) * (Math.PI / 180),
    BOTTOM = [0.0, 0.0, 0.0];
    let vertex = [0.0, 2.0, 0.0];
    // draw cirle on bottom
    for (let index = 0; index < RESOLUTION; index++) {
        let temp_vertex = [];
        temp_vertex[0] = Math.cos(theta * index) * RADIUS;
        temp_vertex[1] = 0.0;
        temp_vertex[2] = Math.sin(theta * index) * RADIUS;
        vertex = vertex.concat(temp_vertex);
    }

    vertex = vertex.concat(BOTTOM);
    // vertex = [1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.5, 0.5, 0.5];
    let indices = [];

    //indices for bottom circle
    for (let index = 0; index < RESOLUTION; index++) {
        let temp_indices = [];
        temp_indices[0] = RESOLUTION;
        temp_indices[1] = 1 + (index % RESOLUTION); 
        temp_indices[2] = 1 + ((index + 1) % RESOLUTION);
        indices = indices.concat(temp_indices);
    }

    //indices for latery circle
    for (let index = 0; index < RESOLUTION; index++) {
        let temp_indices = [];
        temp_indices[0] = 0; 
        temp_indices[1] = 1 + (index % RESOLUTION); 
        temp_indices[2] = 1 + ((index + 1) % RESOLUTION);
        indices = indices.concat(temp_indices);
    }

    // console.log(indices);

    //indices for bottom circle
    for (let index = 0; index < RESOLUTION; index++) {
        let temp_indices = [];
        temp_indices[0] = RESOLUTION;
        temp_indices[1] = 1 + (index % RESOLUTION); 
        temp_indices[2] = 1 + ((index + 1) % RESOLUTION);
        indices = indices.concat(temp_indices);
    }
    // console.log(indices)

    // indices = [0, 1, 2];
    loadBuffer(gl, new Float32Array(vertex), 'a_Position', program);
    // loadBuffer(gl, color, 'a_Color', program);
    loadBuffer(gl, new Uint16Array(indices), null, program, gl.ELEMENT_ARRAY_BUFFER);

    return indices.length;

    // console.log(indices)
}

// createConeVertexBuffer();

// create vertes for sphere
function createSphereVertexBuffer(gl, program) {
    const RADIUS = 1.5, LAT = 10, LNG = 10;
    let vertex = [];
    for (let n = 0; n <= LAT; n++) {
        const zita =  2 * Math.PI * (n / LAT);
        const Y = Math.cos(zita) * RADIUS;
        const U = Math.sin(zita) * RADIUS;

        for (let m = 0; m <= LNG; m++) {
            const beta = 2 * Math.PI * (m / LNG);
            const Z = Math.sin(beta) * U;
            const X = Math.cos(beta) * U;
            vertex.push(X);
            vertex.push(Y);
            vertex.push(Z);
        } 
    }

    // console.log(vertex);

    var indexData = [];
    for(var latNumber = 0; latNumber < LAT; latNumber ++)
    {
        for(var longNumber = 0; longNumber < LNG; longNumber ++)
        {
            var first = (latNumber * (LNG + 1)) + longNumber;
            var second = first + LNG + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);
            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }

    loadBuffer(gl, new Float32Array(vertex), 'a_Position', program);

    loadBuffer(gl, new Uint16Array(indexData), null, program, gl.ELEMENT_ARRAY_BUFFER);

    return indexData.length;
}

// create buffer for vertex
function loadBuffer(gl, vertex, name, program, type) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(type || gl.ARRAY_BUFFER, buffer);
    gl.bufferData(type || gl.ARRAY_BUFFER, vertex, gl.STATIC_DRAW);
    if( !type ) {
        const attrib = gl.getAttribLocation(program, name);
        gl.vertexAttribPointer(attrib, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attrib);
    }
}
// initialze matrix for projection
function createProjectionView(gl, program, x, angle = 0, size) {
    const vM = new Matrix4();
    const rM = new Matrix4();
    
    const max = 30, min = 10;
    if(size > max) {
        size = max;
    }

    if( size < min) {
        size = min
    }
    // console.log(volume)
    // let volume = start - size;
    // if (volume < max) {
    //     volume = max;
    // }
    // if(volume > 15) {
    //     volume = min;
    // }

    // console.log(volume);
    // console.log(volume);

    // if( 20 - size <= min) {
    //     size = 20 - size;
    // }
    
    vM.setPerspective(30.0, 1.0, 1.0, 100.0).lookAt(1, 3, 15, 0, 0, 0, 0, 1, 0);
    // vM.setPerspective(60, 1, 1, 100).lookAt(1, 3, 10, 0, 0, 0, 0, 1, 0);
    rM.setTranslate(x[0], x[1], x[2]).rotate(120, 1.0, 0.0, 0.0);
    vM.multiply(rM);
    const a_ProjectionViewMatrix = gl.getUniformLocation(program, "a_ProjectionViewMatrix");
    gl.uniformMatrix4fv(a_ProjectionViewMatrix, false, vM.elements);
}

function eventInitialion(canvas, gl, objects) {
    canvas.addEventListener("mouseup", ev => {
        // console.log(ev.clientX, ev.clientY);
        
        const canvasRect = ev.target.getBoundingClientRect();
        // console.log("ll")
        const x_in_webgl = ev.clientX - canvasRect.left;
        const y_in_webgl = ev.clientY - canvasRect.top;
        let arr = new Uint8Array(4);
        // objects.pop()
        // console.log(x_in_webgl, y_in_webgl)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BIT);
        objects.forEach(v => {
            // gl.useProgram(v.program);
            // const u_Click = gl.getUniformLocation(v.program, "u_Clicked");
            // gl.uniform1i(u_Click, true);
            // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BIT);
            v.draw(0, 1, 15);

            // gl.readPixels(x_in_webgl, y_in_webgl, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, arr);
            // console.log(arr);
            // // gl.uniform1i(u_Click, false);
            // // gl.useProgram(v.program);
            // objects[0].draw(0, 1, 15);
        });

        gl.readPixels(x_in_webgl, y_in_webgl, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, arr);
        
        if(arr[0] === 255) {
            objects[0].speed = 0.5;
        } else if (arr[1] === 255) {
            objects[1].speed = 0.5;
        } else {
            console.log("canvas")
        }


        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        objects.some(v => {
            // gl.useProgram(v.program);
            // const u_Click = gl.getUniformLocation(v.program, "u_Clicked");
            // gl.uniform1i(u_Click, false);
            v.draw(0, 0, 15);
        });


    }, false);
}

function check(gl, x, y, target, u_Click, arr) {
    let t = null;
    gl.uniform1i(u_Click, 1);
    target.draw(0, 1, 15);
    if (arr[0] === 255) {
        t = 'cube';
    }
    if(arr[1] === 255) {
        t = 'sphere'
    }
    gl.uniform1i(u_Click, 0);
    target.draw(0, 0, 15);
    return t;
}