var fieldOfViewRadians = degToRad(60);
var modelXRotationRadians = degToRad(0);
var modelYRotationRadians = degToRad(0);
var then = 0;
let start = 0, speed = 0.1;

function degToRad(d) {
    return d * Math.PI / 180;
}

const VERTEX_SHADER1 = `
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

const FRAGMENT_SHADER1 = `
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

const VERTEX_SHADER2 = `
    attribute vec4 a_Position;
    varying vec4 v_Position;
    void main() {
        v_Position = a_Position;
        gl_Position = vec4(a_Position.xy, 1, 1);
    }
`;

const FRAGMENT_SHADER2 = `
    precision mediump float;
    varying vec4 v_Position;

    uniform samplerCube u_Skybox;
    uniform mat4 u_SkyboxProjection;
    void main() {
        vec4 t = u_SkyboxProjection * v_Position;
        gl_FragColor = textureCube(u_Skybox, normalize(t.xyz / t.w));
    }
`;

// 加载纹理图案
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

function create_matrix(gl, program, time = 1) {
    // convert to seconds
    time *= 0.01;
    // Subtract the previous time from the current time
    var deltaTime = time - then;
    // console.log(time, then, deltaTime)
    // Remember the current time for the next frame.
    then = time;

     // Animate the rotation
     modelYRotationRadians += -0.7 * deltaTime;
     modelXRotationRadians += -0.4 * deltaTime;

    const ProjectionMatrix = gl.getUniformLocation(program, "u_ProjectionMatrix");
    const CameraMatrixLocation = gl.getUniformLocation(program, "u_cameraPosition");
    const WorldMatrix = gl.getUniformLocation(program, "u_WorldMatrix");
    const ViewMatrix = gl.getUniformLocation(program, "u_ViewMatrix");

    const projection = mat4.create();
    mat4.identity(projection)
    mat4.perspective(projection, glMatrix.toRadian(60), 1.0, 1.0, 100.0);

    var cameraPosition = [0, 0, 5];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    // Compute the camera's matrix using look at.
    var cameraMatrix = mat4.create();
    mat4.identity(cameraMatrix);
    mat4.lookAt(cameraMatrix, cameraPosition, target, up);

    const wM = mat4.create();
    mat4.identity(wM);

    mat4.rotateX(wM, wM, modelXRotationRadians);
    mat4.rotateY(wM, wM, modelYRotationRadians);


    const vM = mat4.create();
    mat4.identity(vM);
    mat4.lookAt(vM, cameraPosition, target, up);

    gl.uniformMatrix4fv(ProjectionMatrix, false, projection);
    gl.uniformMatrix4fv(WorldMatrix, false, wM);
    gl.uniformMatrix4fv(ViewMatrix, false, vM);
    gl.uniform3fv(CameraMatrixLocation, cameraPosition);
}

function create_matrix2(gl, program, time) {
    gl.useProgram(program);
    const skyboxLocation = gl.getUniformLocation(program, "u_Skybox");
    const viewDirectionProjectionInverseLocation = gl.getUniformLocation(program, "u_SkyboxProjection");
    // convert to seconds
    time *= 0.1;
    // Subtract the previous time from the current time
    // var deltaTime = time - then;
    // Remember the current time for the next frame.
    // then = time;
    // Compute the projection matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    // const projection_matrix = mat4.create();
    // const sky_box_matrix = mat4.create();
    // const camera_matrix = mat4.create();
    // mat4.identity(projection_matrix);
    // mat4.identity(sky_box_matrix);
    // mat4.identity(camera_matrix);

    // mat4.perspective(projection_matrix, glMatrix.toRadian(60), aspect, 1, 2000);
    
    // camera going in circle 2 units from origin looking at origin
    var cameraPosition = [Math.cos(time * .1) * 2, 0, Math.sin(time * .1) * 2];
    var target = [0, 0, 0];
    var up = [0, 1, 0];

    // Compute the camera's matrix using look at.
    mat4.lookAt(camera_matrix, cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = mat4.invert(mat4.create(), camera_matrix);

    // We only care about direciton so remove the translation
    viewMatrix[12] = 0;
    viewMatrix[13] = 0;
    viewMatrix[14] = 0;

    // mat4.multiply(projection_matrix, projection_matrix, viewMatrix);

    // mat4.invert(projection_matrix, projection_matrix);

    // Set the uniforms
    gl.uniformMatrix4fv(
        viewDirectionProjectionInverseLocation, false,
        projection_matrix);

    // Tell the shader to use texture unit 0 for u_skybox
    gl.uniform1i(skyboxLocation, 0);

    // let our quad pass the depth test at 1.0
    gl.depthFunc(gl.LEQUAL);

    return;
    
}

function main() {
    const canvas = document.getElementById("cube");
    const webgl = canvas.getContext("webgl");

    webgl.clearColor(0.75, 0.85, 0.8, 0.9);
    webgl.enable(webgl.DEPTH_TEST);

    //initialize the shaders
    const program_flect = myInitShader(webgl, VERTEX_SHADER1, FRAGMENT_SHADER1);
    const program_sky = myInitShader(webgl, VERTEX_SHADER2, FRAGMENT_SHADER2);
    create_cube_map(webgl);
    var tick = () => {
        start += speed;
        //initialize matrix;
        webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
        // switchToSkyBoxProgram(webgl, program_sky, start);
        // switchToReflectProgram(webgl, program_flect, start);
        drawSence(webgl, program_flect, program_sky, start);
        requestAnimationFrame(tick)
    }
    
     tick();

}

// 反射纹理程序1
function switchToReflectProgram(webgl, program1, program2, start) {
    webgl.useProgram(program);
    const verticesAndIndices = cubeVertex();
    // initialize buffers;
    myInitBuffer(webgl, program, verticesAndIndices.vertices, 'a_Position', 3);
    myInitBuffer(webgl, program, verticesAndIndices.normals, 'a_Normal', 3);
    myInitBuffer(webgl, program, verticesAndIndices.triangleIndices, undefined, undefined, true);

    //draw sence
    create_matrix1(webgl, program, start);

    webgl.drawElements(webgl.TRIANGLES, verticesAndIndices.len, webgl.UNSIGNED_SHORT, 0);
}

// 环境纹理程序
function switchToSkyBoxProgram(webgl, program, start) {
    webgl.useProgram(program);
    //create vertices and indices;
    // const verticesAndIndices = cubeVertex();
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ])
    // initialize buffers;
    myInitBuffer(webgl, program, vertices, 'a_Position', 2);

    // draw sence
    create_matrix2(webgl, program, start);

    webgl.drawArrays(webgl.TRIANGLES, 0, 6);






}

// draw sense
function drawSence(gl, program1, program2, time) {

    var webgl = gl;

    webgl.useProgram(program1);

    // draw cube
    const verticesAndIndices = cubeVertex();
    // initialize buffers;
    myInitBuffer(webgl, program1, verticesAndIndices.vertices, 'a_Position', 3);
    myInitBuffer(webgl, program1, verticesAndIndices.normals, 'a_Normal', 3);
    myInitBuffer(webgl, program1, verticesAndIndices.triangleIndices, undefined, undefined, true);

    // convert to seconds
    time *= 1;
    // Subtract the previous time from the current time
    var deltaTime = time - then;
    // console.log(time, then, deltaTime)
    // Remember the current time for the next frame.
    then = time;
    // console.log(time)
     // Animate the rotation
     modelYRotationRadians += -0.7 * deltaTime;
     modelXRotationRadians += -0.4 * deltaTime;

    const ProjectionMatrix = gl.getUniformLocation(program1, "u_ProjectionMatrix");
    const CameraMatrixLocation = gl.getUniformLocation(program1, "u_cameraPosition");
    const WorldMatrix = gl.getUniformLocation(program1, "u_WorldMatrix");
    const ViewMatrix = gl.getUniformLocation(program1, "u_ViewMatrix");

    const projection = mat4.create();
    mat4.identity(projection)
    mat4.perspective(projection, glMatrix.toRadian(60), 1.0, 1.0, 100.0);

    var cameraPosition = [Math.cos(time * .1) * 5, 0, Math.sin(time * .1) * 5];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    // Compute the camera's matrix using look at.
    var cameraMatrix = mat4.create();
    mat4.identity(cameraMatrix);
    mat4.lookAt(cameraMatrix, cameraPosition, target, up);

    const wM = mat4.create();
    mat4.identity(wM);

    mat4.rotateX(wM, wM, modelXRotationRadians);
    mat4.rotateY(wM, wM, modelYRotationRadians);


    const vM = mat4.create();
    mat4.identity(vM);
    mat4.lookAt(vM, cameraPosition, target, up);

    gl.uniformMatrix4fv(ProjectionMatrix, false, projection);
    gl.uniformMatrix4fv(WorldMatrix, false, wM);
    gl.uniformMatrix4fv(ViewMatrix, false, vM);
    gl.uniform3fv(CameraMatrixLocation, cameraPosition);

    webgl.drawElements(gl.TRIANGLES, verticesAndIndices.len, gl.UNSIGNED_SHORT, 0);

    //-------------

    // draw sky
    webgl.useProgram(program2);
    const skyboxLocation = gl.getUniformLocation(program2, "u_Skybox");
    const viewDirectionProjectionInverseLocation = gl.getUniformLocation(program2, "u_SkyboxProjection");

    const vertices = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
    ]);
      // initialize buffers;
    myInitBuffer(webgl, program2, vertices, 'a_Position', 2);
  
    var viewDirectionMatrix = mat4.create();
    mat4.identity(viewDirectionMatrix);
    mat4.copy(viewDirectionMatrix, vM);
    // console.log(vM);
    viewDirectionMatrix[12] = 0;
    viewDirectionMatrix[13] = 0;
    viewDirectionMatrix[14] = 0;

    var viewDirectionProjectionMatrix = mat4.create();
    // mat4.identity(viewDirectionProjectionMatrix);
    mat4.multiply(viewDirectionProjectionMatrix, projection, vM);
    mat4.invert(viewDirectionProjectionMatrix, viewDirectionProjectionMatrix);
     // Set the uniforms
     gl.uniformMatrix4fv(
        viewDirectionProjectionInverseLocation, false,
        viewDirectionProjectionMatrix);

    // Tell the shader to use texture unit 0 for u_skybox
    gl.uniform1i(skyboxLocation, 0);

    // let our quad pass the depth test at 1.0
    gl.depthFunc(gl.LEQUAL);

    webgl.drawArrays(gl.TRIANGLES, 0, 6);
    
}

