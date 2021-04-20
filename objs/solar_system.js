const radius_number = 55;
// the radain of earth
const RADIUS = .4;
// the radain of moon
const mRADIUS = .2;
// the radain of sun
const sRADIUS = 3;

function translate16ColorToRGBA(f){
	const sColor = f.toLowerCase();
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
	if(sColor && reg.test(sColor)){
		if(sColor.length === 4){
			var sColorNew = "#";
			for(var i=1; i<4; i+=1){
				sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));	
			}
			sColor = sColorNew;
		}
		//处理六位的颜色值
		var sColorChange = [];
		for(var i=1; i<7; i+=2){
			sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));	
		}
		return sColorChange.concat(1);
	}else{
		return sColor;	
	}
}
function translateToWebglColor(color) { // #19a397
    color = translate16ColorToRGBA(color);
    console.log(color)
    const r = [color[0] / 255, color[1] / 255, color[2] / 255, color[3]];
    return r.join(',')
}

const color_moon = translateToWebglColor('#89908f');
const color_earth = translateToWebglColor('#3f51b5');
const color_sun = translateToWebglColor('#ff5722');
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
        outColor = vec4(${color_earth});
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
        outColor = vec4(${color_moon});
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


function main() {
    const canvas = document.getElementById("cube");
    const webgl2 = canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    const program_earth = myInitShader(webgl2, vertex_earth, frag_earth);
    const program_moon = myInitShader(webgl2, vertex_moon, frag_moon);
    const program_sun = myInitShader(webgl2, vertex_sun, frag_sun);

    const {vertexPositionData, textureCoordData, normalData} = initBuffers(radius_number, radius_number, RADIUS);
    const point = new Uint16Array(createPointer(radius_number, radius_number));
    const vertex = new Float32Array(vertexPositionData);

    const {vertexPositionData: mv, textureCoordData: mt, normalData: mn} = initBuffers(radius_number, radius_number, mRADIUS);
    const mPoint = new Uint16Array(createPointer(radius_number, radius_number));
    const mVertex = new Float32Array(mv);

    const {vertexPositionData: sv, textureCoordData: st, normalData: sn} = initBuffers(radius_number, radius_number, sRADIUS);
    const sPoint = new Uint16Array(createPointer(radius_number, radius_number));
    const sVertex = new Float32Array(sv);
    
    // webgl2.useProgram(program_earth);
    
    // webgl2.useProgram(program_moon);
    // myInitBuffer(webgl2, program_moon, mVertex, 'a_Position', 3);
    // myInitBuffer(webgl2, program_moon, mPoint, undefined, undefined, webgl2.ELEMENT_ARRAY_BUFFER);

    

    webgl2.enable(webgl2.DEPTH_TEST);
    webgl2.clearColor(0.0, 0.0, 0.0, 1.0);
    let _position = 0;
    const tick = () => {
        let _angle = calculateAngle();
        let _angle_fast = calculateAngle(120);
        // console.log(_angle)
        // _position = calculatePosition(_position);
        webgl2.clear(webgl2.COLOR_BUFFER_BIT | webgl2.DEPTH_BUFFER_BIT);
        
        var sun_matrix = createSun(webgl2, program_sun, sVertex, sPoint, _angle, sPoint.length);
        var translation_earth = moveTheEarth(webgl2, program_earth, vertex, point, _angle, point.length, sun_matrix);
        moveTheMoon(webgl2, program_moon, mVertex, mPoint, _angle_fast, mPoint.length, translation_earth);
        
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

function initMateix(gl, program, r, sun_matrix) {
    const world = mat4.create();
    // mat4.identity(world);
    // mat4.perspective(world, glMatrix.toRadian(60), 1, 1, 200);
    
    // const eyes = [0, 0, 5],
    // target = [0,0,0],
    // up = [0, 1, 0];
    // const view = mat4.lookAt(mat4.create(), eyes, target, up);
    // mat4.identity(view);
    const translation = mat4.create();
    mat4.identity(translation)
    mat4.translate(translation, translation, [10, 0, 0]);

    
    const rotate = mat4.create();
    mat4.identity(rotate)
    mat4.rotateY(rotate, rotate, glMatrix.toRadian(r));

    
    mat4.mul(sun_matrix, sun_matrix, translation);
    mat4.mul(sun_matrix, sun_matrix, rotate)
    // mat4.mul(world, world, rotate);

    // mat4.mul(world, world, rotae);

    const worldMateixLocation = gl.getUniformLocation(program, "u_WorldMatrix");
    gl.uniformMatrix4fv(worldMateixLocation, false, sun_matrix);
    return sun_matrix;
}

function mMatrix(gl, program, angle, translation_earth) {
    // const world = mat4.create();
    // mat4.identity(world);
    // mat4.perspective(world, glMatrix.toRadian(60), 1, 1, 200);
    
    // const eyes = [0, 0, 4],
    // target = [0,0,0],
    // up = [0, 1, 0];
    // const view = mat4.lookAt(mat4.create(), eyes, target, up);
    // mat4.identity(view);

    const rotate = mat4.create();
    mat4.identity(rotate)
    mat4.rotateY(rotate, rotate, glMatrix.toRadian(angle));

    const translation = mat4.create();
    mat4.identity(translation)
    mat4.translate(translation, translation, [1, 0, 0]);

    
    mat4.mul(translation_earth, translation_earth, rotate);
    mat4.mul(translation_earth, translation_earth, translation);
    // mat4.mul(world, world, rotate);

    const worldMateixLocation = gl.getUniformLocation(program, "u_WorldMatrix");
    gl.uniformMatrix4fv(worldMateixLocation, false, translation_earth);
}

function sMatrix(gl, program, angle){
    const world = mat4.create();
    mat4.identity(world);
    mat4.perspective(world, glMatrix.toRadian(60), 2, 1, 2000);
    
    const eyes = [0, 0, 15],
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

function moveTheEarth(gl, program, vertex, point, _angle, len, sun_matrix){
    gl.useProgram(program);
    myInitBuffer(gl, program, vertex, 'a_Position', 3);
    myInitBuffer(gl, program, point, undefined, undefined, gl.ELEMENT_ARRAY_BUFFER);
    var translation = initMateix(gl, program, _angle, sun_matrix);
    gl.drawElements(gl.TRIANGLES, len, gl.UNSIGNED_SHORT, 0);
    return translation;
}

function moveTheMoon(gl, program, mVertex, mPoint, _angle, len, translation_earth) {
    gl.useProgram(program);
    myInitBuffer(gl, program, mVertex, 'a_Position', 3);
    myInitBuffer(gl, program, mPoint, undefined, undefined, gl.ELEMENT_ARRAY_BUFFER);
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