const RADIUS = .4;
const radius_number = 150;
const SPEED = .5;

const mRADIUS = .15;
const m_radius_number = 150;
const mSPEED = .5;

const vertex_earth = `#version 300 es
    in vec4 a_Position;
    uniform mat4 u_WorldMatrix;

    void main() {
        gl_Position = u_WorldMatrix * a_Position;
    }
`;

const frag_earth = `#version 300 es
    precision mediump float;
    out vec4 outColor;
    void main() {
        outColor = vec4(0.0, 1.0, 1.0, 1.0);
    }
`;

const vertex_moon = `#version 300 es
    in vec4 a_Position;
    uniform mat4 u_WorldMatrix;
    void main() {
        gl_Position = u_WorldMatrix * a_Position;
    }
`;


const frag_moon = `#version 300 es
    precision mediump float;
    out vec4 outColor;
    void main() {
        outColor = vec4(0.0, 0.0, 1.0, 1.0);
    }
`;


function main() {
    const canvas = document.getElementById("cube");
    const webgl2 = canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    const program_earth = myInitShader(webgl2, vertex_earth, frag_earth);
    const program_moon = myInitShader(webgl2, vertex_moon, frag_moon);

    const {vertexPositionData, textureCoordData, normalData} = initBuffers(radius_number, radius_number, RADIUS);
    const point = new Uint16Array(createPointer(radius_number, radius_number));
    const vertex = new Float32Array(vertexPositionData);

    const {vertexPositionData: mv, textureCoordData: mt, normalData: mn} = initBuffers(m_radius_number, m_radius_number, mRADIUS);
    const mPoint = new Uint16Array(createPointer(m_radius_number, m_radius_number));
    const mVertex = new Float32Array(mv);
    
    // webgl2.useProgram(program_earth);
    
    // webgl2.useProgram(program_moon);
    // myInitBuffer(webgl2, program_moon, mVertex, 'a_Position', 3);
    // myInitBuffer(webgl2, program_moon, mPoint, undefined, undefined, webgl2.ELEMENT_ARRAY_BUFFER);

    

    webgl2.enable(webgl2.DEPTH_TEST);
    webgl2.clearColor(0.0, 0.0, 0.0, 1.0);

    let _angle = 0;
    let _position = 0;
    const tick = () => {
        _angle = calculateAngle(_angle);
        _position = calculatePosition(_position);
        webgl2.clear(webgl2.COLOR_BUFFER_BIT | webgl2.DEPTH_BUFFER_BIT);
       
        moveTheEarth(webgl2, program_earth, vertex, point, _angle, point.length);
        moveTheMoon(webgl2, program_moon, mVertex, mPoint, _position, mPoint.length);
        // requestAnimationFrame(tick);
    }

    tick();

  
    // start draw


}

function initBuffers(latitudeBands, longitudeBands, radius)
{
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

function createPointer(latitudeBands, longitudeBands) {
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

function initMateix(gl, program, angle) {
    const world = mat4.create();
    mat4.identity(world);
    mat4.perspective(world, glMatrix.toRadian(60), 1, 1, 200);
    
    const eyes = [0, 0, 3],
    target = [0,0,0],
    up = [0, 1, 0];
    const view = mat4.lookAt(mat4.create(), eyes, target, up);
    // mat4.identity(view);

    const rotate = mat4.create();
    mat4.identity(rotate)
    mat4.rotateZ(rotate, rotate, glMatrix.toRadian(angle));

    mat4.mul(world, world, view);
    mat4.mul(world, world, rotate);

    // mat4.mul(world, world, rotae);

    const worldMateixLocation = gl.getUniformLocation(program, "u_WorldMatrix");
    gl.uniformMatrix4fv(worldMateixLocation, false, world);
}

function mMatrix(gl, program, _position) {
    console.log(_position)
    const world = mat4.create();
    mat4.identity(world);
    mat4.perspective(world, glMatrix.toRadian(60), 1, 1, 200);
    
    const eyes = [0, 0, 3],
    target = [0,0,0],
    up = [0, 1, 0];
    const view = mat4.lookAt(mat4.create(), eyes, target, up);
    // mat4.identity(view);

    const translation = mat4.create();
    mat4.identity(translation)
    mat4.translate(translation, translation, [_position, 0, 1]);

    const rotate = mat4.create();
    mat4.identity(rotate)
    mat4.rotateZ(rotate, rotate, glMatrix.toRadian(0));

    mat4.mul(world, world, view);
    mat4.mul(world, world, translation);
    mat4.mul(world, world, rotate);

    // mat4.mul(world, world, rotae);

    const worldMateixLocation = gl.getUniformLocation(program, "u_WorldMatrix");
    gl.uniformMatrix4fv(worldMateixLocation, false, world);
}

let perAngle = 45.0, now = Date.now();
let perPo = 1;
function calculateAngle(angle = 0) {
    const then = Date.now();
    const delta = then - now;
    now = then;
    let ang = angle + (perAngle * delta) / 1000;
    return ang %= 360;
}

function calculatePosition(perPo = 0) {
    const then = Date.now();
    const delta = then - now;
    now = then;
    let ang = perPo + (Math.cos(perPo * Math.PI / 180) * delta) / 1000;
    return ang %= 1;
}

function moveTheEarth(gl, program, vertex, point, _angle, len){
    gl.useProgram(program);
    myInitBuffer(gl, program, vertex, 'a_Position', 3);
    myInitBuffer(gl, program, point, undefined, undefined, gl.ELEMENT_ARRAY_BUFFER);
    initMateix(gl, program, _angle);
    gl.drawElements(gl.TRIANGLES, len, gl.UNSIGNED_SHORT, 0);
}

function moveTheMoon(gl, program, mVertex, mPoint, _angle, len) {
    gl.useProgram(program);
    myInitBuffer(gl, program, mVertex, 'a_Position', 3);
    myInitBuffer(gl, program, mPoint, undefined, undefined, gl.ELEMENT_ARRAY_BUFFER);
    mMatrix(gl, program, _angle);
    gl.drawElements(gl.TRIANGLES, len, gl.UNSIGNED_SHORT, 0);
}