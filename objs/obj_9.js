const SHADER_VERTEX = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    varying vec4 v_Color;

    uniform mat4 u_ViewProjectionMatrix;
    void main() {
        gl_Position = u_ViewProjectionMatrix * a_Position;
        v_Color = a_Color;
    }
`;

const SHADER_FRAGMENT = `
    #ifdef GL_ES
    precision mediump float;
    #endif
    varying vec4 v_Color;
    void main() {
        gl_FragColor = v_Color;
    }
`;

const GEO_SHADER_FRAGMENT = `
    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5);
    }
`;

const SPHERE_SHADER_FRAGMENT = `
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 0.0, 0.8);
    }
`;
// initialize shader
const _initShader = (gl, vertex, fragment) => {
    const vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, vertex);
    gl.compileShader(vShader);

    if(!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(vShader);
        console.warn(info);
        return false;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, fragment);
    gl.compileShader(fShader);

    if(!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(fShader);
        console.warn(info);
        return false;
    }
    const program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const pInfo = gl.getProgramInfoLog(program);
        console.warn(pInfo);
        return false;
    }

   

    // gl.deleteShader(vShader);
    // gl.deleteShader(fShader);

    // gl.useProgram(program);

    // gl.program = program;
    return program;

}
const canvas = document.getElementById("cube");
const webgl = canvas.getContext("webgl");
// const program = _initShader(webgl, SHADER_VERTEX, SHADER_FRAGMENT);


var coneGeo = function(radius, height, segment){
    //锥顶
    var top = [0, height, 0];
    //锥底，锥底半径radius
    //根据segment来切割锥底圆
    var sliceNum = segment || 3;
    var rad = Math.PI * 2 / sliceNum;
    var bottom = [];
    for(var i=0; i<sliceNum; i++){
        bottom[i*3] = radius*Math.cos(rad*i);
        bottom[i*3 + 1] = 0;
        bottom[i*3 + 2] = radius*Math.sin(rad*i);
    }
    //圆锥的顶点
    let vertices = [];
    //顶点法向
    let normals = [];
    //锥顶
    for(var i=0; i<sliceNum; i++){
        vertices[i*3] = top[0];
        vertices[i*3+1] = top[1];
        vertices[i*3+2] = top[2];
    }
    //锥面圆环
    for(var i=0; i<bottom.length; i++){
        vertices[3*sliceNum+i] = bottom[i];
    }
    //锥底圆环
    for(var i=0; i<bottom.length; i++){
        vertices[2*3*sliceNum+i] = bottom[i];
    }
    //锥底圆心
    vertices.push(0, 0, 0);
    //圆锥面索引
    let faces = [];
    for(var i=sliceNum; i<2*sliceNum-1; i++){
        //圆锥侧面
        faces.push(i, i-sliceNum, i+1);
        //圆锥底面
        faces.push(3*sliceNum, sliceNum+i, sliceNum+i+1);
    }
    //补侧面
    faces.push(2*sliceNum-1, sliceNum-1, sliceNum);
    //补底面
    faces.push(3*sliceNum, 3*sliceNum-1, 2*sliceNum);
    //计算所有顶点法向
   return {faces, vertices};
};

const createCone = (gl, program) => {
    // const program = _initShader(gl, SHADER_VERTEX, GEO_SHADER_FRAGMENT);
    const { faces, vertices} =  coneGeo(1, 2, 4);
    _createBuffer(gl, new Float32Array(vertices), "a_Position", 3, program);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(faces), gl.STATIC_DRAW);

    return {
        num: faces.length,
        position: 4,
        byte: gl.UNSIGNED_SHORT,
        program
    }
}

const createSphereVertext = (gl, program) => {
    // const program = _initShader(gl, SHADER_VERTEX, SPHERE_SHADER_FRAGMENT);
    const RADIUS = 1.5, LAT = 5, LNG = 5;
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

    // console.log(indexData);

    _createBuffer(gl, new Float32Array(vertex), "a_Position", 3, program);

    // const Color = new Vector4([1.0, 0.0, 0.0, 1.0]);
    // // console.log(Color);
    // const c = gl.getUniformLocation(program, "a_Color");
    // gl.uniform4fv(c, Color.elements);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);

    
    return {
        num: indexData.length,
        program, 
        byte: gl.UNSIGNED_SHORT,
        position: -4
    };
}

const createCubeVertext = (gl, program) => {
    const vertexs = new Float32Array([
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

    // _initMatrix(gl, 0, 0);
    _createBuffer(gl, vertexs, "a_Position", 3, program);
    _createBuffer(gl, color, "a_Color", 3, program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, pointer, gl.STATIC_DRAW);

    return {
        num: pointer.length,
        position: 0,
        byte: gl.UNSIGNED_BYTE
    }

}
let speed = .7, r = 0;
const main = () => {
    
    webgl.clearColor(0.75, 0.85, 0.8, 0.9);
    webgl.enable(webgl.DEPTH_TEST);

   
      // initialize the shaders
    // if(!_initShader(webgl, SHADER_VERTEX, SHADER_FRAGMENT)) {
    //     return false;
    // }
    // let sphere_num = createSphereVertext(webgl);
    // _initMatrix(webgl, 0, r);
    // go(webgl, 4, 0, sphere_num, webgl.UNSIGNED_SHORT);
    // webgl.drawElements(webgl.TRIANGLES, sphere_num, webgl.UNSIGNED_SHORT, 0);

    // _initMatrix(webgl, 4, r);

    

    


    

   


    // let cone_num = createCone(webgl);
    // go(webgl, 0, 0, cone_num);
    // webgl.drawElements(webgl.TRIANGLES, cone_num, webgl.UNSIGNED_SHORT, 0);
    

    // let cube_num = createCubeVertext(webgl);
    // go(webgl, -4, 0, cube_num);
    // webgl.drawElements(webgl.TRIANGLES, num, webgl.UNSIGNED_BYTE, 0);
    // console.log(allGeo);
    const allGeo = {
        cube:  _initShader(webgl, SHADER_VERTEX, SHADER_FRAGMENT),
        sphere: _initShader(webgl, SHADER_VERTEX, SPHERE_SHADER_FRAGMENT),
        cone: _initShader(webgl, SHADER_VERTEX, GEO_SHADER_FRAGMENT),
    };
    webgl.useProgram(allGeo.cube);
    const tick = () => {
        
    r += speed;
    webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);

    // webgl.useProgram(allGeo.cone);

    // let item = createCone(webgl, allGeo.cone);
    
    // go(webgl, item.position, r, item.num, item.byte, allGeo.cone);

    // webgl.useProgram(allGeo.sphere);
    
    // item = createSphereVertext(webgl, allGeo.sphere);

    // go(webgl, item.position, r, item.num, item.byte, allGeo.sphere);

    

    item = createCubeVertext(webgl, allGeo.cube);
    
    go(webgl, item.position, r, item.num, item.byte, allGeo.cube);

    
        // webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
        // Object.keys(allGeo).forEach((v, i) => {
        //     const item = allGeo[v];
        //     go(webgl, item.position, 0, item.num, item.byte, item.program);
        // });
        // r += speed;
        // go(webgl, 4, r, cone_num, webgl.UNSIGNED_SHORT);
        // go(webgl, 4, 0, sphere_num, webgl.UNSIGNED_SHORT);
        // go(webgl, -4, r, cube_num, webgl.UNSIGNED_BYTE);
        // go(webgl, 4, r, cone_num, webgl.UNSIGNED_SHORT);
        // go(webgl, -4, r, sphere_num);
        // console.log(r);
        // _initMatrix(webgl, -5, r);
        // requestAnimationFrame(tick);
    }
    tick();
    // webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
    // webgl.drawArrays(webgl.TRIANGLES, 0, number);
    
}



const _initTexture = (gl) => {

}

const _createBuffer = (gl, vertex, name, len, program) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertex, gl.STATIC_DRAW);

    const variable = gl.getAttribLocation(program, name);
    gl.vertexAttribPointer(variable, len, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variable);
}

const _initBuffer = (gl) => {

}

function go (gl, offset, angle, num, type, program, vM) {
    // gl.useProgram(program);
    // console.log(angle)
    _initMatrix(gl, offset, angle, program, vM);
    gl.drawElements(gl.TRIANGLES, num, type, 0);
}

const transformMatrix = new Matrix4();
const _initMatrix = (gl, offset, angle, program) => {
    const OriginalMatrix = new Matrix4();
    OriginalMatrix.setPerspective(30, 1, 1, 100)
    .lookAt(3, 3, 30, 0, 0, 0, 0, 1, 0);
    transformMatrix.setTranslate(offset, 0.0, 0.0).rotate(angle, 1.0, 1.0, 1.0);
    OriginalMatrix.multiply(transformMatrix);
    const u_ViewProjectionMatrix = gl.getUniformLocation(program, "u_ViewProjectionMatrix");
    gl.uniformMatrix4fv(u_ViewProjectionMatrix, false, OriginalMatrix.elements);
}

const _initLight = (gl) => {

}
