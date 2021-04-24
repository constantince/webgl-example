const radius_number = 55;
// the radain of earth
const RADIUS = .4;
// the radain of moon
const mRADIUS = .2;
// the radain of sun
const sRADIUS = 2;

const RESOLUTION = 50;
const sunOrbitRadius = 10;

const color_moon = translateToWebglColor('#89908f');
const color_earth = translateToWebglColor('#3f51b5');
const color_sun = translateToWebglColor('#ff5722');
// the origainal light position of sorlar system;
var u_eartch = vec3.fromValues(-50.0, 10.0, 0.0);
var u_moon = vec3.fromValues(-50.0, 10.0, 0.0);
const vertex_earth = `#version 300 es
    in vec4 a_Position;
    uniform mat4 u_WorldMatrix;

    // light
    in vec4 u_Normals;
    uniform mat4 u_NormalMatrix;

    out vec4 v_WorldPosition;
    out vec3 v_Normal; 
    void main() {

        gl_Position = u_WorldMatrix * a_Position;
        // light setting;
        v_Normal = normalize(vec3(u_NormalMatrix * u_Normals));
        v_WorldPosition = u_NormalMatrix * a_Position;
    }
`;

const frag_earth = `#version 300 es
    precision mediump float;
    in vec3 v_Normal;
    in vec4 v_WorldPosition;

    uniform vec3 u_EnvColor;
    uniform vec3 u_LightColor;
    uniform vec3 u_LightPosition;

    out vec4 outColor;
    void main() {

        vec3 lightDirection = normalize(u_LightPosition - v_WorldPosition.xyz);
        float nDot = max(dot(v_Normal, lightDirection), 0.0);
        vec4 base_Color = vec4(${color_earth});
        vec3 diffuse = base_Color.rgb * u_LightColor * nDot;
        vec3 env = u_EnvColor * base_Color.rgb;
        outColor = vec4(diffuse + env, 1.0);
    }
`;

const vertex_moon = `#version 300 es
    in vec4 a_Position;
    uniform mat4 u_WorldMatrix;
    uniform mat4 u_NormalMatrix;
    in vec4 a_Normal;

    out vec3 v_Normal;
    out vec4 v_WorldPosition;
    
    void main() {
        gl_Position = u_WorldMatrix * a_Position;
        v_WorldPosition = u_NormalMatrix * a_Position;
        v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));

    }
`;

const frag_moon = `#version 300 es
    precision mediump float;
    out vec4 outColor;

    in vec4 v_WorldPosition;
    in vec3 v_Normal;

    uniform vec3 u_LightPosition;
    uniform vec3 u_LightColor;
    uniform vec3 u_Env;

    void main() {
        vec4 base = vec4(${color_moon});
        vec3 u_LightDirection = normalize(u_LightPosition - v_WorldPosition.xyz);
        float nDot = max(dot(u_LightDirection, v_Normal), 0.0);
        vec3 diffuse = u_LightColor * base.rgb * nDot;
        vec3 env = u_Env * base.rgb;
        outColor = vec4(diffuse + env, 1.0);
    }
`;

const vertex_sun = `#version 300 es
    in vec4 a_Position;
    uniform mat4 u_WorldMatrix;
    void main() {
        gl_Position = u_WorldMatrix * a_Position;
    }
`;

const frag_sun = `#version 300 es
    precision mediump float;
    out vec4 outColor;
    void main() {
        outColor = vec4(${color_sun});
    }
`;

const orbit_vertex = `#version 300 es
    in vec4 a_Position;
    uniform mat4 u_WorldMatrix;
    void main() {
        gl_Position = u_WorldMatrix * a_Position;
    }
`;

const orbit_frag = `#version 300 es
    precision mediump float;
    out vec4 outColor;
    void main() {
        outColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`


function main() {
    const canvas = document.getElementById("cube");
    const webgl2 = canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    const program_earth = myInitShader(webgl2, vertex_earth, frag_earth);
    const program_moon = myInitShader(webgl2, vertex_moon, frag_moon);
    const program_sun = myInitShader(webgl2, vertex_sun, frag_sun);

    const program_oribit = myInitShader(webgl2, orbit_vertex, orbit_frag);

    const {vertexPositionData, textureCoordData, normalData} = initBuffers(radius_number, radius_number, RADIUS);
    const point = new Uint16Array(createPointer(radius_number, radius_number));
    const vertex = new Float32Array(vertexPositionData);
    const normals = new Float32Array(normalData);

    const {vertexPositionData: mv, textureCoordData: mt, normalData: mn} = initBuffers(radius_number, radius_number, mRADIUS);
    const mPoint = new Uint16Array(createPointer(radius_number, radius_number));
    const mVertex = new Float32Array(mv);
    const moonNormals = new Float32Array(mn);

    const {vertexPositionData: sv, textureCoordData: st, normalData: sn} = initBuffers(radius_number, radius_number, sRADIUS);
    const sPoint = new Uint16Array(createPointer(radius_number, radius_number));
    const sVertex = new Float32Array(sv);
   


    const {vertex: sun_orbit_vertex, pointer: sun_orbit_pointer} = createOrbit(RESOLUTION, sunOrbitRadius);
    const sunOrbitPoint = new Uint16Array(sun_orbit_pointer);
    const sunOrbitVertex = new Float32Array(sun_orbit_vertex);
    // console.log(sunOrbitPoint, sunOrbitVertex);
    // webgl2.useProgram(program_earth);
    
    // webgl2.useProgram(program_moon);
    // myInitBuffer(webgl2, program_moon, mVertex, 'a_Position', 3);
    // myInitBuffer(webgl2, program_moon, mPoint, undefined, undefined, webgl2.ELEMENT_ARRAY_BUFFER);

    

    webgl2.enable(webgl2.DEPTH_TEST);
    webgl2.clearColor(0.0, 0.0, 0.0, 1.0);
    const tick = () => {
        let _angle = calculateAngle();
        let _angle_fast = calculateAngle(120);
        // console.log(_angle)
        // _position = calculatePosition(_position);
        webgl2.clear(webgl2.COLOR_BUFFER_BIT | webgl2.DEPTH_BUFFER_BIT);
        
        var sun_matrix = createSun(webgl2, program_sun, sVertex, sPoint, _angle, sPoint.length);
        createSunOrbit(webgl2, program_oribit, sunOrbitVertex, sunOrbitPoint, sunOrbitPoint.length, sun_matrix);
        var translation_earth = moveTheEarth(webgl2, program_earth, vertex, point, normals, _angle, point.length, sun_matrix);
        moveTheMoon(webgl2, program_moon, mVertex, mPoint, moonNormals, _angle_fast, mPoint.length, translation_earth);
        
        requestAnimationFrame(tick);
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
// 地球运动矩阵
function initMateix(gl, program, r, sun_matrix) {
    const translation = mat4.create();
    mat4.identity(translation)
    mat4.translate(translation, translation, [10, 0, 0]);

    
    const rotate = mat4.create();
    mat4.identity(rotate)
    mat4.rotateY(rotate, rotate, glMatrix.toRadian(r));
    // mat4.rotateZ(rotate, rotate, glMatrix.toRadian(r));
    // mat4.rotateX(rotate, rotate, glMatrix.toRadian(r));

    
    
    
    mat4.mul(sun_matrix, sun_matrix, translation);
    mat4.mul(sun_matrix, sun_matrix, rotate)
    // mat4.mul(world, world, rotate);

    // mat4.mul(world, world, rotae);

    // create normal matrix
    const normal = mat4.create();
    mat4.identity(normal);
    mat4.mul(normal, normal, rotate);


    const worldMateixLocation = gl.getUniformLocation(program, "u_WorldMatrix");
    const normalMatrixLocation = gl.getUniformLocation(program, "u_NormalMatrix");
    gl.uniformMatrix4fv(worldMateixLocation, false, sun_matrix);
    gl.uniformMatrix4fv(normalMatrixLocation, false, normal);
    return {sun_matrix, normal};
}

function mMatrix(gl, program, angle, translation_earth) {

    const rotate = mat4.create();
    mat4.identity(rotate)
    mat4.rotateY(rotate, rotate, glMatrix.toRadian(angle));

    

    const translation = mat4.create();
    mat4.identity(translation)
    mat4.translate(translation, translation, [1, 0, 0]);

    // create normal matrix
    const normal = mat4.create();
    mat4.identity(normal);
    mat4.mul(normal, rotate, translation_earth.normal);

    
    mat4.mul(translation_earth.sun_matrix, translation_earth.sun_matrix, rotate);
    mat4.mul(translation_earth.sun_matrix, translation_earth.sun_matrix, translation);
    // mat4.mul(world, world, rotate);

     
    //  mat4.mul(normal, normal, translation);
    //  mat4.invert(normal, normal);

    const worldMateixLocation = gl.getUniformLocation(program, "u_WorldMatrix");
    const normalMatrixLocation = gl.getUniformLocation(program, "u_NormalMatrix");
    gl.uniformMatrix4fv(normalMatrixLocation, false, normal);
    gl.uniformMatrix4fv(worldMateixLocation, false, translation_earth.sun_matrix);
}

function sMatrix(gl, program, angle){
    const world = mat4.create();
    mat4.identity(world);
    mat4.perspective(world, glMatrix.toRadian(60), 2, 1, 2000);
    
    const eyes = [0, 2, 15],
    target = [0,0,0],
    up = [0, 1, 0];
    const view = mat4.lookAt(mat4.create(), eyes, target, up);
    // mat4.identity(view);
    const translation = mat4.create();
    mat4.identity(translation)
    mat4.translate(translation, translation, [0, 0, 0]);

    const rotate = mat4.create();
    mat4.identity(rotate)
    mat4.rotateY(rotate, rotate, glMatrix.toRadian(angle));

    mat4.mul(world, world, view);
    mat4.mul(world, world, rotate);
    mat4.mul(world, world, translation);

    const worldMateixLocation = gl.getUniformLocation(program, "u_WorldMatrix");
    gl.uniformMatrix4fv(worldMateixLocation, false, world);
    return world;
}

let perPosition = .05, now = Date.now();
const STARTPOSITION = 0;
function calculatePosition(position) {
    const then = Date.now();
    const delta = then - now;
    now = then;
    let newPosition = position + (perPosition * delta) / 1000;
    return newPosition %= 1.2;
}


let perAngle = 10.0, nows = Date.now();
let STARTANGLE = 0;
function calculateAngle(perAngle = 10) {
    const then = Date.now();
    const delta = then - nows;
    // console.log(delta)
    now = then;
    let newAngle = STARTANGLE + (perAngle * delta) / 1000;
    return newAngle %= 360;
}

function moveTheEarth(gl, program, vertex, point, normals, _angle, len, sun_matrix){
    gl.useProgram(program);
    myInitBuffer(gl, program, vertex, 'a_Position', 3);
    myInitBuffer(gl, program, normals, 'u_Normals', 3);
    myInitBuffer(gl, program, point, undefined, undefined, gl.ELEMENT_ARRAY_BUFFER);
    createLightToEarth(gl, program);
    var translation = initMateix(gl, program, _angle, sun_matrix);
    gl.drawElements(gl.TRIANGLES, len, gl.UNSIGNED_SHORT, 0);
    return translation;
}

function moveTheMoon(gl, program, mVertex, mPoint, normals, _angle, len, translation_earth) {
    gl.useProgram(program);
    myInitBuffer(gl, program, mVertex, 'a_Position', 3);
    myInitBuffer(gl, program, mPoint, undefined, undefined, gl.ELEMENT_ARRAY_BUFFER);
    myInitBuffer(gl, program, normals, 'a_Normal', 3);
    createLightToMoon(gl, program)
    mMatrix(gl, program, _angle, translation_earth);
    gl.drawElements(gl.TRIANGLES, len, gl.UNSIGNED_SHORT, 0);
}

function createSun(gl, program, vertex, point, _angle, len) {
    gl.useProgram(program);
    myInitBuffer(gl, program, vertex, 'a_Position', 3);
    myInitBuffer(gl, program, point, undefined, undefined, gl.ELEMENT_ARRAY_BUFFER);
    var translation = sMatrix(gl, program, _angle);
    gl.drawElements(gl.TRIANGLES, len, gl.UNSIGNED_SHORT, 0);
    return translation;
}

function createSunOrbit(gl, program, vertex, point, len, sun_matrix) {
    gl.useProgram(program);
    myInitBuffer(gl, program, vertex, 'a_Position', 3);
    myInitBuffer(gl, program, point, undefined, undefined, gl.ELEMENT_ARRAY_BUFFER);
    sMatrix(gl, program, 0, sun_matrix);
    gl.drawElements(gl.LINE_LOOP, len, gl.UNSIGNED_SHORT, 0);
}

function createOrbit(resolution, radius) {
    let vertex = [], pointer = [],
    theta = (360 / resolution) * (Math.PI / 180);
    for (let index = 0; index < resolution; index++) {
        vertex.push(Math.sin(theta * index) * radius);
        vertex.push(0);
        vertex.push(Math.cos(theta * index) * radius);
        pointer.push(index);
        pointer.push((index + 1) % resolution);
    }
    return {vertex, pointer}
}

// give the earth sunshine
function createLightToEarth(gl, program) {
    const u_LightColor = gl.getUniformLocation(program, "u_LightColor");
    const u_LightPosition = gl.getUniformLocation(program, "u_LightPosition");
    const u_EnvColor = gl.getUniformLocation(program, 'u_EnvColor');

    // set light's color
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    gl.uniform3f(u_EnvColor, 0.1, 0.1, 0.1);
    // set point light direction;
    // const LP = vec3.create();
    // vec3.normalize(LP, [0.0, 0.0, 0.0]);
    gl.uniform3fv(u_LightPosition, u_eartch);

}

function createLightToMoon(gl, program) {
    const u_LightColor = gl.getUniformLocation(program, "u_LightColor");
    const u_LightPosition = gl.getUniformLocation(program, "u_LightPosition");
    const u_EnvColor = gl.getUniformLocation(program, 'u_Env');

    // set light's color
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    gl.uniform3f(u_EnvColor, 0.3, 0.3, 0.3);
    // set point light direction;
    // const LP = vec3.create();
    // vec3.normalize(LP, [0.0, 0.0, 0.0]);
    gl.uniform3fv(u_LightPosition, u_moon);

}