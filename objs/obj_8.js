const VERTEX_SHADER = `
    attribute vec4 a_Position;
    uniform mat4 u_ViewMatrixModel;
    attribute vec4 a_Color;
    varying vec4 v_Color;

    attribute vec2 a_TexCoord;
    varying vec2 v_TexCoord;
    void main() {
        gl_Position = u_ViewMatrixModel * a_Position;
        v_Color = a_Color;
        v_TexCoord = a_TexCoord;
    }
`;

const FRAGMENT_SHADER = `
    precision mediump float;
    varying vec4 v_Color;
    varying vec2 v_TexCoord;
    uniform sampler2D u_Sampler;
    void main() {
        gl_FragColor = texture2D(u_Sampler, v_TexCoord);
    }
`;

function _initShaders(gl, v_shader, f_shader) {
    const vshader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vshader, v_shader);
    gl.compileShader(vshader);

    if(!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(vshader);
        console.warn(info);
        return false;
    }

    const fshader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fshader, f_shader);
    gl.compileShader(fshader);

    if(!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(fshader);
        console.warn(info);
        return false;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vshader);
    gl.attachShader(program, fshader);
    gl.linkProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const infoProgram = gl.getProgramInfoLog(program);
        console.warn(infoProgram);
        return false;
    }
    
    gl.deleteShader(vshader);
    gl.deleteShader(fshader);

    gl.useProgram(program);
    gl.program = program;

    return true;

}

function _createBuffer(gl, index, name, size) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, index, gl.STATIC_DRAW);
    const variable = gl.getAttribLocation(gl.program, name);
    gl.vertexAttribPointer(variable, size, gl.FLOAT,  false, 0, 0);
    gl.enableVertexAttribArray(variable);
}
const radius_number = 10;
//创建球形
function createSphereVertext(lat = radius_number, lng = radius_number) {
    let R = .5, vertexs = [];
    for (let index = 0; index <= lat; index++) {
        let zita = index * (Math.PI / lat);
        let dibian = R * Math.sin(index * zita); // M axiox
        let y = R * Math.cos(index * zita); // y axiox
        for (let index1 = 0; index1 <= lng; index1++) {
            let gama = index1 * 2 * (Math.PI / lng)
            let x = Math.cos(index1 * gama) * dibian;
            let z = Math.sin(index1 * gama) * dibian;
            vertexs.push(x);
            vertexs.push(y);
            vertexs.push(z);
        }
    }
    return vertexs;
}

function initBuffers()
{
    var latitudeBands = radius_number;
    var longitudeBands = radius_number;
    var radius = 2;
    var vertexPositionData = [];
    var normalData = [];
    var textureCoordData = [];
    for(var latNumber = 0; latNumber <= latitudeBands; latNumber ++)
    {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        for(var longNumber = 0; longNumber <= longitudeBands; longNumber ++)
        {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);
            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longNumber / longitudeBands);
            var v = 1 - (latNumber / latitudeBands);

            normalData.push(x);
            normalData.push(y);
            normalData.push(z);
            textureCoordData.push(u);
            textureCoordData.push(v);
            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * y);
            vertexPositionData.push(radius * z);
        }
    }
    return {vertexPositionData, textureCoordData, normalData};
}

function createPointer(latitudeBands = radius_number, longitudeBands = radius_number) {
    var indexData = [];
    for(var latNumber = 0; latNumber < latitudeBands; latNumber ++)
    {
        for(var longNumber = 0; longNumber < longitudeBands; longNumber ++)
        {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);
            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }
    return indexData;
}

function createTexture(gl, src) {
    console.log('textued...')
    const image = new Image();
    const textute = gl.createTexture();
    const sampler = gl.getUniformLocation(gl.program, "u_Sampler");
    image.onload = function() {
        loadTexture(gl, sampler, image, textute);
    }
    image.src = src;

}

function loadTexture(gl, sampler, image, texture) {
    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // gl.activeTexture(gl.TEXTURE0);
    // gl.bindTexture(gl.TEXTURE_2D, texture);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    // gl.generateMipmap(gl.TEXTURE_2D);

    // gl.bindTexture(gl.TEXTURE_2D, null);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // gl.uniform1i(sampler, 0); 
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);    
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    

    gl.generateMipmap(gl.TEXTURE_2D);

    // gl.bindTexture(gl.TEXTURE_2D, null);
    gl.uniform1i(sampler, 0); 
}

// const pointer = createPointer();
// const len = pointer.length;


function _initBuffer(gl) {
    const {vertexPositionData, textureCoordData} = initBuffers();
    const vertexs = new Float32Array(vertexPositionData);
    // console.log(textureCoordData);
    const textures = new Float32Array(textureCoordData);

    const pointer = new Uint16Array(createPointer());

    _createBuffer(gl, vertexs, 'a_Position', 3);
    _createBuffer(gl, textures, 'a_TexCoord', 2);
    
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, pointer, gl.STATIC_DRAW);
    return pointer.length;

}



 function _initMatrixModel(gl, vM, rM, angle) {
    rM.setRotate(angle, 0.0, 1.0, 0.0);
    vM.multiply(rM);
    const u_ViewMatrixModel = gl.getUniformLocation(gl.program, 'u_ViewMatrixModel');
    gl.uniformMatrix4fv(u_ViewMatrixModel, false, vM.elements); 
}


function main() {
    const canvas = document.getElementById("cube");
    const webgl = canvas.getContext("webgl");
    if(!_initShaders(webgl, VERTEX_SHADER, FRAGMENT_SHADER)) {
        return false;
    }

    var rotateMatrix = new Matrix4();
    var M = new Matrix4();
    M.setPerspective(30, 1, 1, 100).lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
    let speed = 1, start = 0;

    // _initMatrixModel(webgl, canvas.widht, canvas.height);

    const number = _initBuffer(webgl);
    // webgl.viewport(0, 0, webgl.viewportWidth, webgl.viewportHeight);
    webgl.clearColor(0.75, 0.85, 0.8, 1.0);
    webgl.enable(webgl.DEPTH_TEST);
    createTexture(webgl, './assets/brick1.png');
    function move() {
        const ang = start + speed;
        _initMatrixModel(webgl, M, rotateMatrix, ang);
        webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
        webgl.drawElements(webgl.TRIANGLES, number, webgl.UNSIGNED_SHORT, 0);
        // requestAnimationFrame(move)
    }
    setTimeout(function(){
        move();
    }, 1000);
   
    
    
    

    console.log("hello webgl");
}