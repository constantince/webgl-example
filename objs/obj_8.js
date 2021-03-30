const RADIUS = 1;
const radius_number = 164;
const SPEED = .1;
const VERTEX_SHADER = `
    attribute vec4 a_Position;
    uniform mat4 u_ViewMatrixModel;
    uniform mat4 u_ReverseMatrixModel;
    attribute vec4 a_Color;
    varying vec4 v_Color;

    attribute vec2 a_TexCoord;
    varying vec2 v_TexCoord;

    attribute vec4 a_Normal;
    varying vec3 v_Normal;

    void main() {
        gl_Position = u_ViewMatrixModel * a_Position;
        v_Normal = normalize(vec3(u_ReverseMatrixModel * a_Normal));
        v_TexCoord = a_TexCoord;
    }
`;

const FRAGMENT_SHADER = `
    precision mediump float;
    varying vec4 v_Color;
    varying vec2 v_TexCoord;
    uniform sampler2D u_Sampler;

    varying vec3 v_Normal;
    uniform vec3 u_LightColor;
    uniform vec3 u_LightDirection;
    uniform vec3 u_EnvLight;

    void main() {
        vec3 normal = normalize(v_Normal);
        vec4 texture = texture2D(u_Sampler, v_TexCoord);
        float dot = max(dot(u_LightDirection, normal), 0.0);
        vec3 difuse = u_LightColor * dot;
        vec4 color = vec4(difuse + u_EnvLight, 1.0);
        gl_FragColor = vec4(texture.rgb * color.rgb, texture.a);
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
    var radius = RADIUS;
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
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); 
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);    
    gl.texParameteri(gl.TEXTURE_2D, gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR);
    

    gl.generateMipmap(gl.TEXTURE_2D);

    // gl.bindTexture(gl.TEXTURE_2D, null);
    gl.uniform1i(sampler, 0); 
}

// const pointer = createPointer();
// const len = pointer.length;


function _initBuffer(gl) {
    const {vertexPositionData, textureCoordData, normalData} = initBuffers();
    const vertexs = new Float32Array(vertexPositionData);
    // console.log(textureCoordData);
    const textures = new Float32Array(textureCoordData);

    const normal = new Float32Array(normalData);

    const pointer = new Uint16Array(createPointer());

    _createBuffer(gl, vertexs, 'a_Position', 3);
    _createBuffer(gl, textures, 'a_TexCoord', 2);
    _createBuffer(gl, normal, 'a_Normal', 3);
    
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, pointer, gl.STATIC_DRAW);

    const u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");
    const u_LightDirection = gl.getUniformLocation(gl.program, "u_LightDirection");
    const u_EnvLight = gl.getUniformLocation(gl.program, "u_EnvLight");

    const envLightColorVector = new Vector3([0.1, 0.1, 0.1]);
    gl.uniform3fv(u_EnvLight, envLightColorVector.elements);
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    const direction = new Vector3([-30.0, 0, 0]);
    gl.uniform3fv(u_LightDirection, direction.elements);

    return pointer.length;

}


const RotateMatrix = new Matrix4();
const ReverseMatrix = new Matrix4();
 function _initMatrixModel(gl, vM, angle, u_ViewMatrixModel, u_ReverseMatrixModel) {
    RotateMatrix.setRotate(angle, 0.0, 1.0, 0.0);
    // RotateMatrix.setRotate(20, 0.0, 1.0, 0.0);
    vM.multiply(RotateMatrix);
    gl.uniformMatrix4fv(u_ViewMatrixModel, false, vM.elements); 
    ReverseMatrix.setInverseOf(vM);
    ReverseMatrix.transpose();
    // console.log(ReverseMatrix)
    gl.uniformMatrix4fv(u_ReverseMatrixModel, false, ReverseMatrix.elements);

}


function main() {
    const canvas = document.getElementById("cube");
    const webgl = canvas.getContext("webgl");
    if(!_initShaders(webgl, VERTEX_SHADER, FRAGMENT_SHADER)) {
        return false;
    }

    var M = new Matrix4();
    M.setPerspective(30, 1, 1, 100).lookAt(10, 3, 7, 0, 0, 0, 0, 1, 0);
    const u_ViewMatrixModel = webgl.getUniformLocation(webgl.program, 'u_ViewMatrixModel');
    const u_ReverseMatrixModel = webgl.getUniformLocation(webgl.program, "u_ReverseMatrixModel");
    let speed = SPEED, start = 0;

    // _initMatrixModel(webgl, canvas.widht, canvas.height);

    const number = _initBuffer(webgl);
    // webgl.viewport(0, 0, webgl.viewportWidth, webgl.viewportHeight);
    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl.enable(webgl.DEPTH_TEST);
    createTexture(webgl, './assets/test.png');
    function move() {
        const ang = start + speed;
        _initMatrixModel(webgl, M, ang, u_ViewMatrixModel, u_ReverseMatrixModel);
        webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
        webgl.drawElements(webgl.TRIANGLES, number, webgl.UNSIGNED_SHORT, 0);
        requestAnimationFrame(move)
    }
    setTimeout(function(){
        move();
    }, 1000);
   
    
    
    

    console.log("hello webgl");
}