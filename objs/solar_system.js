const radius_number = 55;
// the radain of earth
const RADIUS = .4;
// the radain of moon
const mRADIUS = .2;
// the radain of sun
const sRADIUS = 3;

const RESOLUTION = 50;
const sunOrbitRadius = 10;

const color_moon = translateToWebglColor('#89908f');
const color_earth = translateToWebglColor('#FFFFFF');
const color_sun = translateToWebglColor('#ff5722');
// the origainal light position of sorlar system;
var u_eartch = vec3.fromValues(-50.0, 10.0, 0.0);
var u_moon = vec3.fromValues(-50.0, 10.0, 0.0);


// 旋转因子
const ROTATE_FATOR = 1; // 一天 == 1s
// 地球公转
const earth_revolution = 365 * ROTATE_FATOR;
//地球自转
const earth_self_rotation = 1 * ROTATE_FATOR;
// 月球公转
const moon_revolution = 27.32 * ROTATE_FATOR;

const vertex_earth = `#version 300 es
    in vec4 a_Position;
    uniform mat4 u_WorldMatrix;

    // light
    in vec4 u_Normals;
    uniform mat4 u_NormalMatrix;

    out vec4 v_WorldPosition;
    out vec3 v_Normal; 

    in vec2 a_TextCoord;
    out vec2 v_TextCoord;
    void main() {

        gl_Position = u_WorldMatrix * a_Position;
        // light setting;
        v_Normal = normalize(vec3(u_NormalMatrix * u_Normals));
        v_WorldPosition = u_NormalMatrix * a_Position;
        v_TextCoord = a_TextCoord;
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

    in vec2 v_TextCoord;
    uniform sampler2D u_Sampler;
    void main() {

        vec3 lightDirection = normalize(u_LightPosition - v_WorldPosition.xyz);
        float nDot = max(dot(v_Normal, lightDirection), 0.0);
        vec4 texture_color = texture(u_Sampler, v_TextCoord);
        vec4 base_Color = vec4(${color_earth});
        vec3 diffuse = base_Color.rgb * u_LightColor * nDot;
        vec3 env = u_EnvColor * base_Color.rgb;
        
        vec3 light_effection = diffuse + env;

        outColor = vec4(texture_color.rgb * light_effection, 1.0);
    }
`;

const vertex_moon = `#version 300 es
    in vec4 a_Position;
    uniform mat4 u_WorldMatrix;
    uniform mat4 u_NormalMatrix;
    in vec4 a_Normal;

    out vec3 v_Normal;
    out vec4 v_WorldPosition;
    
    in vec2 a_TexCoord;
    out vec2 v_TexCoord;

    void main() {
        gl_Position = u_WorldMatrix * a_Position;
        v_WorldPosition = u_NormalMatrix * a_Position;
        v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
        v_TexCoord = a_TexCoord;
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

    uniform sampler2D u_Sampler;
    in vec2 v_TexCoord;

    void main() {
        vec4 tex = texture(u_Sampler, v_TexCoord);
        vec3 u_LightDirection = normalize(u_LightPosition - v_WorldPosition.xyz);
        float nDot = max(dot(u_LightDirection, v_Normal), 0.0);
        vec3 diffuse = u_LightColor * tex.rgb * nDot;
        vec3 env = u_Env * tex.rgb;

        outColor = vec4(diffuse + env, 1.0);
    }
`;

const vertex_sun = `#version 300 es
    in vec4 a_Position;
    uniform mat4 u_WorldMatrix;
    in vec2 a_TextCood;
    out vec2 v_TextCood;
    void main() {
        gl_Position = u_WorldMatrix * a_Position;
        v_TextCood = a_TextCood;
    }
`;

const frag_sun = `#version 300 es
    precision mediump float;
    out vec4 outColor;

    uniform sampler2D u_Sampler;
    in vec2 v_TextCood;
    void main() {
        vec4 ambient = vec4(1.0, 1.0, 1.0, 1.0);
        vec4 texColor = texture(u_Sampler, v_TextCood);
        outColor = vec4(ambient.rgb * texColor.rgb, texColor.a);
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
    const texture_earth = new Float32Array(textureCoordData);

    const {vertexPositionData: mv, textureCoordData: mt, normalData: mn} = initBuffers(radius_number, radius_number, mRADIUS);
    const mPoint = new Uint16Array(createPointer(radius_number, radius_number));
    const mVertex = new Float32Array(mv);
    const moonNormals = new Float32Array(mn);
    const mTexture = new Float32Array(mt);


    const {vertexPositionData: sv, textureCoordData: st, normalData: sn} = initBuffers(radius_number, radius_number, sRADIUS);
    const sPoint = new Uint16Array(createPointer(radius_number, radius_number));
    const sVertex = new Float32Array(sv);
    const sTexture = new Float32Array(st);
   


    const {vertex: sun_orbit_vertex, pointer: sun_orbit_pointer} = createOrbit(RESOLUTION, sunOrbitRadius);
    const sunOrbitPoint = new Uint16Array(sun_orbit_pointer);
    const sunOrbitVertex = new Float32Array(sun_orbit_vertex);
    // console.log(sunOrbitPoint, sunOrbitVertex);
    // webgl2.useProgram(program_earth);
    
    // webgl2.useProgram(program_moon);
    // myInitBuffer(webgl2, program_moon, mVertex, 'a_Position', 3);
    // myInitBuffer(webgl2, program_moon, mPoint, undefined, undefined, webgl2.ELEMENT_ARRAY_BUFFER);

    // texure
    var sun_texture = null;
    var earth_texture = null;
    var moon_texture = null;
    Promise.all([
        initTexture("./assets/sun.jpeg"),
        initTexture("./assets/earth.jpeg"),
        initTexture("./assets/moon.jpg")
    ]).then(([sun, earth, moon]) => {
        earth_texture = loadTexture(webgl2, program_earth, earth, webgl2.TEXTURE0);
        sun_texture = loadTexture(webgl2, program_sun, sun, webgl2.TEXTURE0);
        moon_texture = loadTexture(webgl2, program_moon, moon, webgl2.TEXTURE0);
        
        tick();
    })
    
    


    webgl2.enable(webgl2.DEPTH_TEST);
    webgl2.clearColor(0.0, 0.0, 0.0, 1.0);
    // 地球绕太阳旋转一周365s 每秒旋转 365 / 360
    const a1 = 360 / 100;
    // 地球自转一周 需要1s 每秒旋转 1 / 360
    const a2 = 360 / 3;
    // 月球自转一周 27.32 / 360
    const a3 = 270

    const tick = () => {
        let diqiugongzhuan = calculateAngle(a1);
        let ziqiuzizhuan = calculateAngle(a2);
        let _earth_self_rotate = calculateAngle(24);
        // console.log(_angle)
        // _position = calculatePosition(_position);
        webgl2.clear(webgl2.COLOR_BUFFER_BIT | webgl2.DEPTH_BUFFER_BIT);
        
        var sun_matrix = createSun(webgl2, program_sun, sVertex, sPoint, sTexture, diqiugongzhuan, sPoint.length, sun_texture);
        createSunOrbit(webgl2, program_oribit, sunOrbitVertex, sunOrbitPoint, sunOrbitPoint.length, sun_matrix);
        var translation_earth = moveTheEarth(webgl2, program_earth, vertex, point, normals, texture_earth, diqiugongzhuan, ziqiuzizhuan, point.length, sun_matrix, earth_texture);
        moveTheMoon(webgl2, program_moon, mVertex, mPoint, moonNormals, mTexture, a3, mPoint.length, translation_earth, moon_texture);
        
        requestAnimationFrame(tick);
    }

    

  
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
function initMateix(gl, program, gz, zz, sun_matrix) {
    const translation = mat4.create();
    mat4.identity(translation)
    mat4.translate(translation, translation, [10, 0, 0]);
    
    const rotate = mat4.create();
    mat4.identity(rotate)
    mat4.rotateY(rotate, rotate, glMatrix.toRadian(gz));
    // mat4.rotateZ(rotate, rotate, glMatrix.toRadian(r));
    // mat4.rotateX(rotate, rotate, glMatrix.toRadian(r));

    //公转
    const gongzhuan = mat4.mul(mat4.create(), rotate, translation);

    const rotate1 = mat4.create();
    mat4.identity(rotate1)
    mat4.rotateY(rotate1, rotate1, glMatrix.toRadian(zz));

    // 自转
    // const zizhuan = mat4.mul(mat4.create(), rotate1);
    
    // mat4.mul(sun_matrix, sun_matrix, translation);
    mat4.mul(sun_matrix, sun_matrix, gongzhuan);
    mat4.mul(sun_matrix, sun_matrix, rotate1);


    // const u  = mat4.copy(mat4.create(), sun_matrix);
    // mat4.mul(world, world, rotate);

    // mat4.mul(world, world, rotae);

    // create normal matrix
    const normal = mat4.create();
    mat4.identity(normal);
    mat4.mul(normal, normal, rotate1);


    const worldMateixLocation = gl.getUniformLocation(program, "u_WorldMatrix");
    const normalMatrixLocation = gl.getUniformLocation(program, "u_NormalMatrix");
    gl.uniformMatrix4fv(worldMateixLocation, false, sun_matrix);
    gl.uniformMatrix4fv(normalMatrixLocation, false, normal);

    // sun_matrix = u;
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
    mat4.rotateY(rotate, rotate, glMatrix.toRadian(0));

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
var ear_t = null;
function moveTheEarth(gl, program, vertex, point, normals, texture, _angle, _angle_zz, len, sun_matrix, earth_texture){
    gl.useProgram(program);
    myInitBuffer(gl, program, vertex, 'a_Position', 3);
    myInitBuffer(gl, program, normals, 'u_Normals', 3);
    myInitBuffer(gl, program, texture, 'a_TextCoord', 2);
    myInitBuffer(gl, program, point, undefined, undefined, gl.ELEMENT_ARRAY_BUFFER);
    
    // if(ear_t === null) { // save
    //     loadTexture(gl, program, earth_image);
    //     ear_t = 1;
    // }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, earth_texture);

    createLightToEarth(gl, program);
    var translation = initMateix(gl, program, _angle, _angle_zz, sun_matrix);
    gl.drawElements(gl.TRIANGLES, len, gl.UNSIGNED_SHORT, 0);
    return translation;
}

function moveTheMoon(gl, program, mVertex, mPoint, normals, texture, _angle, len, translation_earth, moon_texture) {
    gl.useProgram(program);
    myInitBuffer(gl, program, mVertex, 'a_Position', 3);
    myInitBuffer(gl, program, mPoint, undefined, undefined, gl.ELEMENT_ARRAY_BUFFER);
    myInitBuffer(gl, program, normals, 'a_Normal', 3);
    myInitBuffer(gl, program, texture, 'a_TexCoord', 2);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, moon_texture);

    createLightToMoon(gl, program)
    mMatrix(gl, program, _angle, translation_earth);
    gl.drawElements(gl.TRIANGLES, len, gl.UNSIGNED_SHORT, 0);
}
var sun_t = null;
function createSun(gl, program, vertex, point, sTexture, _angle, len, sun_texture) {
    gl.useProgram(program);
    myInitBuffer(gl, program, vertex, 'a_Position', 3);
    myInitBuffer(gl, program, sTexture, 'a_TextCood', 2);
    myInitBuffer(gl, program, point, undefined, undefined, gl.ELEMENT_ARRAY_BUFFER);
    // if( sun_t === null) {
    //     loadTexture(gl, program, image);
    //     sun_t = 1;
    // }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sun_texture);
    
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


function initTexture(src) {
    return new Promise((reslove, reject) => {
        const image = new Image();
        image.onload = function() {
            reslove(image);
        }
        image.src = src;
    })
    
}

function loadTexture(gl, program, image, type) {
    gl.useProgram(program);
    const texture = gl.createTexture();

    gl.activeTexture(type);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const samplerLocation = gl.getUniformLocation(program, "u_Sampler");
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); 
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);    
    // gl.texParameteri(gl.TEXTURE_2D, gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR);

    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null); // Unbind texture

    
    gl.uniform1i(samplerLocation, 0);

    return texture;
}