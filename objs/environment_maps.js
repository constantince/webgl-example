const VERTEX_SHADER = `
    attribute vec4 a_Position;
    attribute vec3 a_Normal;
    uniform mat4 u_ProjectionMatrix;
    uniform mat4 u_WorldMatrix;
    uniform mat4 u_ViewMatrix;

    varying vec3 m_WorldPosition;
    varying vec3 m_WorldNormal;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_WorldMatrix * a_Position;
        m_WorldPosition = (u_WorldMatrix * a_Position).xyz;
        m_WorldNormal = mat3(u_WorldMatrix) * a_Normal; 
    }
`;

const FRAGMENT_SHADER = `
    precision highp float;
    varying vec3 m_WorldPosition;
    varying vec3 m_WorldNormal;

    uniform samplerCube u_texture;
    uniform vec3 u_cameraPosition;
    void main() {
        vec3 worldNormal = normalize(m_WorldNormal);
        vec3 eyeToSurfaceDir = normalize(m_WorldPosition - u_cameraPosition);
        vec3 direction = reflect(eyeToSurfaceDir, worldNormal);

        gl_FragColor = textureCube(u_texture, direction);
    }
`;

function main() {
    const canvas = document.getElementById("cube");
    const webgl = canvas.getContext("webgl");

    webgl.clearColor(0.75, 0.85, 0.8, 0.9);
    webgl.enable(webgl.DEPTH_TEST);

    //initialize the shaders
    const program = myInitShader(webgl, VERTEX_SHADER, FRAGMENT_SHADER);
    webgl.useProgram(program);
    

    //create vertices and indices;
    const verticesAndIndices = cubeVertex();

    // initialize buffers;

    myInitBuffer(webgl, program, verticesAndIndices.vertices, 'a_Position', 3);
    myInitBuffer(webgl, program, verticesAndIndices.normals, 'a_Normal', 3);
    myInitBuffer(webgl, program, verticesAndIndices.triangleIndices, undefined, undefined, true);

    //create cube_map

    create_cube_map(webgl);
    let start = 0, speed = 0.5;
    var tick = () => {
        start += speed;
        //initialize matrix;
        create_matrix(webgl, program, start);
        webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
        webgl.drawElements(webgl.TRIANGLES, verticesAndIndices.len, webgl.UNSIGNED_SHORT, 0);
        requestAnimationFrame(tick)
    }
    
     tick();

}

function create_cube_map(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    const faceInfos = [
        {
          target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
          url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/pos-x.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
          url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/neg-x.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
          url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/pos-y.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
          url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/neg-y.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
          url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/pos-z.jpg',
        },
        {
          target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
          url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/neg-z.jpg',
        },
    ];

    faceInfos.forEach(v => {
        const {target, url} = v;
        const image = new Image();
        image.crossOrigin = "";
        const LEVEL = 0,
        FORMAT = gl.RGBA, width = 512,
        height = 512, type = gl.UNSIGNED_BYTE;
        gl.texImage2D(target, LEVEL, FORMAT, width, height, 0, FORMAT, type, null);
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(target, LEVEL, FORMAT, FORMAT, type, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        }
        image.src = url;
    });

    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

}
function degToRad(d) {
  return d * Math.PI / 180;
}
var fieldOfViewRadians = degToRad(60);
var modelXRotationRadians = degToRad(0);
var modelYRotationRadians = degToRad(0);
var then = 0;

function create_matrix(gl, program, time) {

   // convert to seconds
   time *= 0.1;
   // Subtract the previous time from the current time
   var deltaTime = time - then;
   // Remember the current time for the next frame.
   then = time;

    const ProjectionMatrix = gl.getUniformLocation(program, "u_ProjectionMatrix");
    const CameraMatrixLocation = gl.getUniformLocation(program, "u_cameraPosition");
    const WorldMatrix = gl.getUniformLocation(program, "u_WorldMatrix");
    const ViewMatrix = gl.getUniformLocation(program, "u_ViewMatrix");
    // Animate the rotation
    modelYRotationRadians += -0.7 * deltaTime;
    modelXRotationRadians += -0.4 * deltaTime;

    const projection = mat4.create();
    mat4.identity(projection)
    mat4.perspective(projection, glMatrix.toRadian(60), 1.0, 1.0, 100.0);
    gl.uniformMatrix4fv(ProjectionMatrix, false, projection);


    // var cameraPosition = [0, 0, 5];
    var cameraPosition = [Math.cos(time * .1) * 5, 0, Math.sin(time * .1) * 5];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    // Compute the camera's matrix using look at.
    var cameraMatrix = mat4.create();
    mat4.identity(cameraMatrix);
    mat4.lookAt(cameraMatrix, cameraPosition, target, up);

    const worldMatrix = mat4.create();
    mat4.identity(worldMatrix);
    mat4.rotateX(worldMatrix, worldMatrix, modelYRotationRadians);

    var viewMatrix = mat4.create();
    mat4.identity(viewMatrix);
    mat4.invert(viewMatrix, cameraMatrix);
    // console.log(viewMatrix)


    //--------------------------------

    // var projection =
    //     m4.perspective(glMatrix.toRadian(30), 1, 1, 200);
    // gl.uniformMatrix4fv(ProjectionMatrix, false, projection);

    // var cameraPosition = [0, 0, 5];
    // var target = [0, 0, 0];
    // var up = [0, 1, 0];
    // // Compute the camera's matrix using look at.
    // var cameraMatrix = m4.lookAt(cameraPosition, target, up);
    // console.log(cameraMatrix)
    // // Make a view matrix from the camera matrix.
    // var viewMatrix = m4.inverse(cameraMatrix);
    

    // var worldMatrix = m4.xRotation(modelXRotationRadians);
    // worldMatrix = m4.yRotate(worldMatrix, modelYRotationRadians);

    gl.uniformMatrix4fv(ProjectionMatrix, false, projection);
    gl.uniformMatrix4fv(WorldMatrix, false, worldMatrix);
    gl.uniformMatrix4fv(ViewMatrix, false, cameraMatrix);
    gl.uniform3fv(CameraMatrixLocation, cameraPosition);
}