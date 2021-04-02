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
            v_Color = vec4(1.0, 0.0, 0.0, 1.0);
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
    selectedColor = 255;
    constructor(webgl) {
        this.webgl = webgl;
        this.program = getProgram(webgl, VERTEX_SHADER_CUBE, FRAG_SHADER_CUBE);
        
        
    }

    draw(angle, y = 0, size) {
        this.webgl.useProgram(this.program); 
        const u_Click = this.webgl.getUniformLocation(this.program, "u_Clicked");
        this.webgl.uniform1i(u_Click, y);
        this.number =  createCubeVertexBuffer(this.webgl, this.program);
        createProjectionView(this.webgl, this.program, 0, angle, size);
        this.webgl.clear(this.webgl.COLOR_BUFFER_BIT | this.webgl.DEPTH_BUFFER_BIT);
        this.webgl.drawElements(this.webgl.TRIANGLES, this.number, this.webgl.UNSIGNED_BYTE, 0);
    }

    click() {
        this.webgl.clear(this.webgl.COLOR_BUFFER_BIT | this.webgl.DEPTH_BIT);
        this.webgl.drawElements(this.webgl.TRIANGLES, this.number, this.webgl.UNSIGNED_BYTE, 0);
    }
}

class Sphere {
    name = "sphere";
    selectedColor = 226;
    constructor(webgl) {
        this.webgl = webgl;
        this.program = getProgram(webgl, VERTEX_SHADER_SPHERE, FRAG_SHADER_CUBE);
        
    }

    draw(angle) {
        this.webgl.useProgram(this.program);
        this.number = createCubeVertexBuffer(this.webgl, this.program);
        createProjectionView(this.webgl, this.program, 1, angle);
        this.webgl.drawElements(this.webgl.TRIANGLES, this.number, this.webgl.UNSIGNED_BYTE, 0);
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

    const cube = new Cube(webgl);
    const sphere = new Sphere(webgl);
    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl.enable(webgl.DEPTH_TEST);

    eventInitialion(canvas, webgl,  cube);
    let angle = 0, size = 15;
    var tick = () => {
        angle += animationParameters.speed;
        size += animationParameters.vsize;
        // console.log(size);
        // animationParameters.size += animationParameters.v_size
        // webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BIT);
        cube.draw(angle, 0, size);
        requestAnimationFrame(tick)
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

    const pointer = new Uint8Array([
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
// create vertes for sphere
function createSphereVertexBuffer(gl, program) {
    const RADIUS = 1.5, LAT = 50, LNG = 50;
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
    
    vM.setPerspective(30.0, 1.0, 1.0, 100.0).lookAt(1, 3, size, 0, 0, 0, 0, 1, 0);
    // vM.setPerspective(60, 1, 1, 100).lookAt(1, 3, 10, 0, 0, 0, 0, 1, 0);
    rM.setTranslate(0, 0, 0).rotate(angle, 1.0, 1.0, 0);
    vM.multiply(rM);
    const a_ProjectionViewMatrix = gl.getUniformLocation(program, "a_ProjectionViewMatrix");
    gl.uniformMatrix4fv(a_ProjectionViewMatrix, false, vM.elements);
}


function eventInitialion(canvas, gl, objects) {
    canvas.addEventListener("mousemove", ev => {
        // console.log(ev.clientX, ev.clientY);
        const canvasRect = ev.target.getBoundingClientRect();
        // console.log("ll")
        const x_in_webgl = ev.clientX - canvasRect.left;
        const y_in_webgl = ev.clientY - canvasRect.top;
        // console.log(x_in_webgl, y_in_webgl)
        // objects.forEach(v => {
        // gl.useProgram(objects.program);
            const u_Click = gl.getUniformLocation(objects.program, "u_Clicked");
            gl.uniform1i(u_Click, 0);
            const result =  check(gl, x_in_webgl, y_in_webgl, objects, u_Click);
            if(result === "cube" ) {
                // console.log("selected")
                animationParameters.vsize = 0.05;
            } else {
                animationParameters.vsize = -0.05;
            }


    }, false);
}

function check(gl, x, y, target, u_Click) {
    let t = null;
    target.click(0, 1, 5);
    let arr = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, arr);
    if (arr[0] === 255) {
        t = target.name;
    }
    target.click(0, 0, 5);
    return t;
}