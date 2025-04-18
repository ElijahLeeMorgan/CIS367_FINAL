//////////////////////////////////////////////////////////////////
//
//   3D environment cube mapped teapot
//
//   Han-Wei Shen (shen.94@osu.edu)
//
//   Edited by: Haoyu Li (lihao@gvsu.edu), Elijah Morgan (@ElijahLeeMorgan), and Dillon Moesch (@ddog2810)

var gl1, gl2;
var shaderProgram;
var draw_type=2;
var use_texture = 0; 
let texture_loaded = 0, num_cubemap_loaded = 0, json_loaded = 0;


// set up the parameters for lighting 
var light_ambient = [0,0,0,1]; 
var light_diffuse = [.8,.8,.8,1];
var light_specular = [1,1,1,1]; 
var light_pos = [0,0,0,1];   // eye space position 

var mat_ambient = [0, 0, 0, 1]; 
var mat_diffuse= [1, 1, 0, 1]; 
var mat_specular = [.9, .9, .9,1]; 
var mat_shine = [50]; 

//////////// Init OpenGL Context etc. ///////////////

function initGL(gl, canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}


///////////////////////////////////////////////////////////////

function initCubeMap(gl, cubemapTexture) {
    console.log("loading cubemap texture....")
    // the dimension of pictures should be consistent.
    cubemapTexture = gl.createTexture();
    cubemapTexture.px = new Image();
    cubemapTexture.px.onload = function() { handleCubemapTextureLoaded(cubemapTexture,'px'); }
    cubemapTexture.px.src = "cube_map/posx.jpg";
    cubemapTexture.pxx = gl.createTexture();
    cubemapTexture.pxx.image = cubemapTexture.px;

    cubemapTexture.nx = new Image();
    cubemapTexture.nx.onload = function() { handleCubemapTextureLoaded(cubemapTexture,'nx'); }
    cubemapTexture.nx.src = "cube_map/negx.jpg";
    cubemapTexture.nxx = gl.createTexture();
    cubemapTexture.nxx.image = cubemapTexture.nx;

    cubemapTexture.py = new Image();
    cubemapTexture.py.onload = function() { handleCubemapTextureLoaded(cubemapTexture,'py'); }
    cubemapTexture.py.src = "cube_map/posy.jpg"; 
    cubemapTexture.pyy = gl.createTexture();
    cubemapTexture.pyy.image = cubemapTexture.py;

    cubemapTexture.ny = new Image();
    cubemapTexture.ny.onload = function() { handleCubemapTextureLoaded(cubemapTexture,'ny'); }
    cubemapTexture.ny.src = "cube_map/negy.jpg"; 
    cubemapTexture.nyy = gl.createTexture();
    cubemapTexture.nyy.image = cubemapTexture.ny;

    cubemapTexture.pz = new Image();
    cubemapTexture.pz.onload = function() { handleCubemapTextureLoaded(cubemapTexture,'pz'); }
    cubemapTexture.pz.src = "cube_map/posz.jpg"; 
    cubemapTexture.pzz = gl.createTexture();
    cubemapTexture.pzz.image = cubemapTexture.pz;
    cubemapTexture.nz = new Image();
    cubemapTexture.nz.onload = function() { handleCubemapTextureLoaded(cubemapTexture,'nz'); }
    cubemapTexture.nz.src = "cube_map/negz.jpg"; 
    cubemapTexture.nzz = gl.createTexture();
    cubemapTexture.nzz.image = cubemapTexture.nz;
} 

function handleCubemapTextureLoaded(texture,type) {
    console.log("handle cubemap texture....")
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    switch (type){
        case 'px':
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE, texture.px);
        break;
        case 'nx':
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE, texture.nx);
        break;
        case 'py':
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE, texture.py);
        break;
        case 'ny':
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE, texture.ny);
        break;
        case 'pz':
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE, texture.pz);
        break;
        case 'nz':
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE, texture.nz);
        break;
    }
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR); 
    num_cubemap_loaded ++;
    drawScene();
}


///////////////////////////////////////////////////////////////

var sampleTexture; 

function initTextures(gl) {
    sampleTexture = gl.createTexture();
    sampleTexture.image = new Image();
    sampleTexture.image.onload = function() { handleTextureLoaded(sampleTexture); }
    sampleTexture.image.src = "brick.png";    
    console.log("loading texture....") 
}

function handleTextureLoaded(texture) {
    console.log("handle texture....")
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);

    // Check if the image has power-of-2 dimensions
    if (isPowerOf2(texture.image.width) && isPowerOf2(texture.image.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
    } else {
        // Set texture parameters for non-power-of-2 textures
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    console.log("Texture loaded:", sampleTexture.image.src);
    texture_loaded = 1;
    drawScene();
}
function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}
///////////////////////////////////////////////////////////

var teapotVertexPositionBuffer;
var teapotVertexNormalBuffer; 
var teapotVertexTextureCoordBuffer; 
var teapotVertexIndexBuffer;

var xmin, xmax, ymin, ymax, zmin, zmax;


////////////////    Initialize JSON geometry file ///////////
/*
function initJSON()
{
    var request = new XMLHttpRequest();

    request.open("GET", "teapot.json");
    request.onreadystatechange =
      function () {
          if (request.readyState == 4) {
	      console.log("state ="+request.readyState); 
              handleLoadedTeapot(JSON.parse(request.responseText));
        }
      }
    request.send();
}


function handleLoadedTeapot(gl, teapotData)
{
    console.log("Loaded Teapot"); 
    teapotVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(teapotData.vertexPositions),gl.STATIC_DRAW);
    teapotVertexPositionBuffer.itemSize=3;
    teapotVertexPositionBuffer.numItems=teapotData.vertexPositions.length/3; 
    
    teapotVertexNormalBuffer =  gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,  teapotVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapotData.vertexNormals), gl.STATIC_DRAW);
    teapotVertexNormalBuffer.itemSize=3;
    teapotVertexNormalBuffer.numItems= teapotData.vertexNormals.length/3;

    teapotVertexTextureCoordBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(teapotData.vertexTextureCoords),gl.STATIC_DRAW);
    teapotVertexTextureCoordBuffer.itemSize=2;
    teapotVertexTextureCoordBuffer.numItems=teapotData.vertexTextureCoords.length/2;

    teapotVertexIndexBuffer= gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(teapotData.indices), gl.STATIC_DRAW);
    teapotVertexIndexBuffer.itemSize=1;
    teapotVertexIndexBuffer.numItems=teapotData.indices.length;
    
    teapotVertexColorBuffer = teapotVertexNormalBuffer;

    json_loaded = 1;
    drawScene();

}
*/
///////////////////////////////////////////////////////////////

var mMatrix = mat4.create();    // model matrix
var vMatrix = mat4.create();    // view matrix
var pMatrix = mat4.create();    // projection matrix
var nMatrix = mat4.create();    // normal matrix
var v2wMatrix = mat4.create();  // eye space to world space matrix 
var X_angle = 0.0;
var Y_angle = 0.0;

function setMatrixUniforms(shaderProgram) {
    gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
    gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, nMatrix);	
    gl.uniformMatrix4fv(shaderProgram.v2wMatrixUniform, false, v2wMatrix);		
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

///////////////////////////////////////////////////////////////

function drawScene(gl, shaderProgram) {

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (json_loaded == 0 || texture_loaded == 0 || num_cubemap_loaded < 6) {
        return;
    }
    if (teapotVertexPositionBuffer == null || teapotVertexNormalBuffer == null || teapotVertexIndexBuffer == null) {
        return;
    }

    // set up VP matrices
    mat4.perspective(pMatrix, glMatrix.toRadian(60), 1.0, 0.1, 500);  // set up the projection matrix 

    mat4.identity(vMatrix);

    mat4.translate(vMatrix, vMatrix,[0,0,-5]);
    mat4.rotate(vMatrix,vMatrix, degToRad(Y_angle),[1,0,0]);
    mat4.rotate(vMatrix,vMatrix, degToRad(X_angle),[0,1,0]);

    // v2wMatrix is the transpose of vMatrix 
    // mat4.invert(v2wMatrix, vMatrix);
    mat4.transpose(v2wMatrix, vMatrix);

    // draw teapot
    mat4.identity(mMatrix);
    mat4.scale(mMatrix, mMatrix, [1/10, 1/10, 1/10]); 

    // v2w and normal matrices
    mat4.multiply(nMatrix, vMatrix,mMatrix);
    mat4.invert(nMatrix, nMatrix);
    mat4.transpose(nMatrix, nMatrix); 


    // lighting coefficients
    shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");

	gl.uniform4f(shaderProgram.light_posUniform,light_pos[0], light_pos[1], light_pos[2], light_pos[3]); 	
	gl.uniform4f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], 1.0); 
	gl.uniform4f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], 1.0); 
	gl.uniform4f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2],1.0); 
	gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]); 

	gl.uniform4f(shaderProgram.light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2], 1.0); 
	gl.uniform4f(shaderProgram.light_diffuseUniform, light_diffuse[0], light_diffuse[1], light_diffuse[2], 1.0); 
	gl.uniform4f(shaderProgram.light_specularUniform, light_specular[0], light_specular[1], light_specular[2],1.0); 

    // set up the vertex attributes
	gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, teapotVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, teapotVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexTextureCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, teapotVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotVertexIndexBuffer);

    // pass the modelview mattrix and projection matrix to the shader
    setMatrixUniforms();   
    // shading mode
	gl.uniform1i(shaderProgram.use_textureUniform, use_texture);     

    gl.activeTexture(gl.TEXTURE1);   // set texture unit 1 to use 
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);    // bind the texture object to the texture unit 
    gl.uniform1i(shaderProgram.cube_map_textureUniform, 1);   // pass the texture unit to the shader
    
    gl.activeTexture(gl.TEXTURE0);   // set texture unit 0 to use 
	gl.bindTexture(gl.TEXTURE_2D, sampleTexture);    // bind the texture object to the texture unit 
    gl.uniform1i(shaderProgram.textureUniform, 0);   // pass the texture unit to the shader

	if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, teapotVertexPositionBuffer.numItems);	
    else if (draw_type ==0) gl.drawArrays(gl.POINTS, 0, teapotVertexPositionBuffer.numItems);
	else if (draw_type==2) gl.drawElements(gl.TRIANGLES, teapotVertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0);	

    // draw skybox
    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    var vertices = [
         0.5,  0.5,  -.5,
        -0.5,  0.5,  -.5, 
        -0.5, -0.5,  -.5,
         0.5, -0.5,  -.5,
         0.5,  0.5,  .5,
        -0.5,  0.5,  .5, 
        -0.5, -0.5,  .5,
         0.5, -0.5,  .5
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 8;

    var indices = [0,1,2, 0,2,3, 0,3,7, 0,7,4, 6,2,3,6,3,7,5,1,2,5,2,6,5,1,0,5,0,4,5,6,7,5,7,4];
    squareVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    squareVertexIndexBuffer.itemSize = 1;
    squareVertexIndexBuffer.numItems = 36;

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // draw elementary arrays - triangle indices 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);

    mat4.identity(mMatrix);
    mat4.scale(mMatrix, mMatrix, [50, 50, 50]); 

    setMatrixUniforms();   // pass the modelview mattrix and projection matrix to the shader
	gl.uniform1i(shaderProgram.use_textureUniform, 3);    

    gl.drawElements(gl.TRIANGLES, squareVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}


///////////////////////////////////////////////////////////////

let mouseState = { lastMouseX: 0, lastMouseY: 0 };

///////////////////////////////////////////////////////////////

function onDocumentMouseDown( event ) {
    event.preventDefault();
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    document.addEventListener( 'mouseout', onDocumentMouseOut, false );
    var mouseX = event.clientX;
    var mouseY = event.clientY;

    mouseState.lastMouseX = mouseX;
    mouseState.lastMouseY = mouseY; 

}

function onDocumentMouseMove( event ) {
    var mouseX = event.clientX;
    var mouseY = event.clientY; 

    var diffX = mouseX - mouseState.lastMouseX;
    var diffY = mouseY - mouseState.lastMouseY;

    X_angle = X_angle + diffX/5;
    Y_angle = Y_angle + diffY/5;

    mouseState.lastMouseX = mouseX;
    mouseState.lastMouseY = mouseY;

    drawScene();
}

function onDocumentMouseUp() {
    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);
}

function onDocumentMouseOut() {
    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);
}

///////////////////////////////////////////////////////////////

function webGLStart(gl, canvasID, shaderProgram) {
    var canvas = document.getElementById(canvasID);
    initGL(gl, canvas);
    initShaders();

    gl.enable(gl.DEPTH_TEST); 

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.vertexTexCoordsAttribute = gl.getAttribLocation(shaderProgram, "aVertexTexCoords");
    gl.enableVertexAttribArray(shaderProgram.vertexTexCoordsAttribute);	

    shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.v2wMatrixUniform = gl.getUniformLocation(shaderProgram, "uV2WMatrix");		

    shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");
    shaderProgram.ambient_coefUniform = gl.getUniformLocation(shaderProgram, "ambient_coef");	
    shaderProgram.diffuse_coefUniform = gl.getUniformLocation(shaderProgram, "diffuse_coef");
    shaderProgram.specular_coefUniform = gl.getUniformLocation(shaderProgram, "specular_coef");
    shaderProgram.shininess_coefUniform = gl.getUniformLocation(shaderProgram, "mat_shininess");

    shaderProgram.light_ambientUniform = gl.getUniformLocation(shaderProgram, "light_ambient");	
    shaderProgram.light_diffuseUniform = gl.getUniformLocation(shaderProgram, "light_diffuse");
    shaderProgram.light_specularUniform = gl.getUniformLocation(shaderProgram, "light_specular");	

    shaderProgram.textureUniform = gl.getUniformLocation(shaderProgram, "myTexture");
    shaderProgram.cube_map_textureUniform = gl.getUniformLocation(shaderProgram, "cubeMap");	
    shaderProgram.use_textureUniform = gl.getUniformLocation(shaderProgram, "use_texture");

    initJSON();

    initTextures(gl);

    initCubeMap(gl); 

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    console.log('start! ');

    document.addEventListener('mousedown', onDocumentMouseDown,false); 
}

function BG(gl, red, green, blue) {

    gl.clearColor(red, green, blue, 1.0);
    drawScene(); 

} 

function redraw() {
    X_angle = 0; 
    Y_angle = 0;
    drawScene();
}
    

function geometry(type) {

    draw_type = type;
    drawScene();

}

function texture(value) {

    use_texture = value;
    drawScene();

} 