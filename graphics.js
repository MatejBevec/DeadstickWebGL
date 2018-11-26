//WebGL component of Deadstick's game engine - Matej Bevec

//initializing shaders

//creates, compiles and returns the shader program as an object
function loadShader(gl, type, source){
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	//log errors
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
		}

		return shader;
}

//merges vs and fs into a shader program and attaches it to GPU + returns it
function initShaderProgram(gl, vsSrc, fsSrc, infoSrc){
	const vs = loadShader(gl, gl.VERTEX_SHADER, vsSrc);
	const fs = loadShader(gl, gl.FRAGMENT_SHADER, fsSrc);

	const sProgram = gl.createProgram(	);
	gl.attachShader(sProgram, vs);
	gl.attachShader(sProgram, fs);
	gl.linkProgram(sProgram); //store program in GPU for use

	//log errors
	if (!gl.getProgramParameter(sProgram, gl.LINK_STATUS)) {
		console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
		}

		//create a programInfo obj, holding the program and shader variable pointer,
		//fetch the object from shaders.js file
		const programInfo = infoSrc(gl, sProgram);
		/*
		const programInfo = {
	program: sProgram,
	attLocations: {
		vertexPos: gl.getAttribLocation(sProgram, 'aVertexPos'),
		vertexNorm: gl.getAttribLocation(sProgram, 'aVertexNorm'),
		uvCoord: gl.getAttribLocation(sProgram, 'aUVCoord'),
	},
	uniLocations: {
		projectionMat: gl.getUniformLocation(sProgram, 'uProjectionMat'),
		modelViewMat: gl.getUniformLocation(sProgram, 'uModelViewMat'),
		normalMat: gl.getUniformLocation(sProgram, 'uNormalMat'),
		uSampler: gl.getUniformLocation(sProgram, 'uSampler'),
	},
};*/

		return programInfo;
}


//initializing buffers - where attributes that are sent to shades are stored
//buffers contain vertex positions, faces, uv maps...
function initBuffer(gl, modelObj){

	console.log("Creating WebGL buffers ...");

	//VERTICES

	const posBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

	//vertex position of the object to be drawn
	const positions = modelObj.vert.flat();

 	//put the positions into the binded buffer
 	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
 	posBuffer.itemSize = 3; //one vertex has 3 coordinates
 	posBuffer.numItems = positions.length/3; //24 vertices

 	//NORMALS

 	const normBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);

	//vertex normals of the object to be drawn
	const normals = modelObj.norm.flat();

 	//put the normals into the binded buffer
 	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
 	normBuffer.itemSize = 3; //one normals has 3 coordinates
 	normBuffer.numItems = normals.length/3; //24 vertices

  	//FACES / ELEMENT ARRAY

  	const indexBuffer = gl.createBuffer();
  	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  	const faces = modelObj.face.flat();

  	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(faces), gl.STATIC_DRAW);
  	indexBuffer.itemSize = 3; //triangles
  	indexBuffer.numItems = faces.length/3; //a cube consists of 12 triangles

  	//TEXTURE COORDINATES / UV

	const uvBuffer = gl.createBuffer();
	var uvCoordinates;

	if(modelObj.uv.length > 0){
	  	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

	  	uvCoordinates = modelObj.uv.flat();
	}
  	else{ //if uv coordinates are not provided, create them (temporary bodge - I guess?)
  		const uv = new Array(posBuffer.numItems);
  		uv.fill(0,uv.length,[0.0,0.0, 1.0,0.0, 0.0,1.0]);
  		uvCoordinates = uv.flat();
  	}
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvCoordinates), gl.STATIC_DRAW);
  	uvBuffer.itemSize = 2;
  	uvBuffer.numItems = uvCoordinates.length/2;


 	//return the object holding the buffers (position, normals, uv, faces)
 	return {
 		position: posBuffer,
 		normals: normBuffer,
 		uvCoordinates: uvBuffer,
 		faces: indexBuffer,
 	}
}

//load texture
function initTexture(gl, url){

	//until the texture from the spec. url is loaded, use backup texture
	texture = makeBackupTexture(gl);

	//load image from url
	texture.image = new Image();
	texture.image.src = url;
	texture.image.onload = function(){
		//bind the provided texture
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
			gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.bindTexture(gl.TEXTURE_2D, null);
		console.log(url, ": Texture loaded.");
	}
	return texture;
}

function makeTextureFromColor(gl, color){
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	const pixel = new Uint8Array(color);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

	return texture;
}

function makeBackupTexture(gl){
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	//backup texture - red, green, blue, and white pixel
	const placeholder = new Uint8Array([0,0,255,255, 0,255,0,255, 255,0,0,255, 255,255,255,255]);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                placeholder);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	return texture;
}

//drawing the object in the buffers
function drawBuffers(gl, programInfo, buffers, texture, transformMat, camera, lights){

	//make placeholder texture if texture is not provided
	if(!texture){
		texture = makeBackupTexture(gl);
	}

	//INITALIZING THE FRAME
	//moved to game loop
	/*
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	*/

	//CALCULATING THE PROJECTION MATRIX

	//set to given camera's attribute values in the future
	const fieldOfView = camera.fieldOfView * Math.PI/180;
	const aspect = camera.aspect;
	const clipNear = camera.clipNear;
	const clipFar = camera.clipFar;
	
	//make projection matrix from camera properties
	const projectionMat = mat4.create();
	mat4.perspective(projectionMat, fieldOfView, aspect, clipNear, clipFar);

	//CALCULATING THE MODEL VIEW MATRIX

	//modelViewMatrix - calculated from obj and camera position in the future
	const modelViewMat = mat4.create();
	mat4.translate(modelViewMat, modelViewMat, [-0.0,0.0,-6.0]);
	mat4.mul(modelViewMat, modelViewMat, transformMat);
	//mat4.rotate(modelViewMat, modelViewMat, angle, [0,0,1]);
	//mat4.rotate(modelViewMat, modelViewMat, angle*0.6, [0,1,0]);

	//BINDING BUFFERS
	//bind position, normals, uv, and texture buffers to the GPU and connect them with shaders

	//bind vertex positions
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
	gl.vertexAttribPointer(programInfo.attLocations.vertexPos,
		buffers.position.itemSize, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(programInfo.attLocations.vertexPos);

	//bind normals
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
	gl.vertexAttribPointer(programInfo.attLocations.vertexNorm,
		buffers.normals.itemSize, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(programInfo.attLocations.vertexNorm);

	//create normal transformation matrix
	const normalMat = mat4.create();
	mat4.invert(normalMat, modelViewMat);
	mat4.transpose(normalMat, normalMat);

	//bind texture coordinates and texture file
	if(buffers.uvCoordinates && texture){ //check if buffer is full and texture is provided ?!?!

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uvCoordinates);
		gl.vertexAttribPointer(programInfo.attLocations.uvCoord,
			buffers.uvCoordinates.itemSize, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(programInfo.attLocations.uvCoord);

		//send textures to shader
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
	}

	//bind face element array
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.faces);

	//LOADING UNIFORMS INTO SHADERS

	gl.useProgram(programInfo.program);
	//projection and model view matrices
	gl.uniformMatrix4fv(programInfo.uniLocations.projectionMat, false, projectionMat);
	gl.uniformMatrix4fv(programInfo.uniLocations.modelViewMat, false, modelViewMat);
	//normal transf. matrix
	gl.uniformMatrix4fv(programInfo.uniLocations.normalMat, false, normalMat);
	//uSampler - which of the available textures should be used
	gl.uniform1i(programInfo.uniLocations.uSampler, 0);

	//DRAWING BUFFERS

	const off = 0;
	const vertexCount = buffers.faces.itemSize * buffers.faces.numItems;
	type = gl.UNSIGNED_SHORT;
	gl.drawElements(gl.TRIANGLES, vertexCount, type, off);

}


//MODEL OBJECT
//model object holds the data that describes a 3D object
function Model(label){
	this.vert = [];
	this.face = [];
	this.norm = [];
	this.uv = [];

	this.label = label;
	this.loaded = false;
	this.text;
	this.buffers = null;
}
Model.prototype.loadObj = function(obj){
	console.log(this.label + ": Parsing obj file ...");
	var lines = obj.split('\n');
	for(var i = 0; i < lines.length; i++){
		var line = lines[i].split(/\s+/);

		var vec = vec3.fromValues(parseFloat(line[1]),
									parseFloat(line[2]),
									parseFloat(line[3])); //extra coordinate or not?

		//vertexes
		if(line[0] == "v"){
			this.vert.push([vec[0],vec[1],vec[2]]); //not adding the extra coordinate
		}
		//normals
		else if(line[0] == "vn"){
			this.norm.push([vec[0],vec[1],vec[2]]); //not adding the extra coordinates
		}
		//texture coordinates
		else if(line[0] == "vt"){
			this.uv.push([vec[0],vec[1]]);
		}
		//faces
		else if(line[0] == 'f'){
			vec = [parseInt(line[1])-1, parseInt(line[2])-1, parseInt(line[3])-1]
			this.face.push(vec);
			if(line[4]){
				var vec2 = [parseInt(line[1])-1, parseInt(line[3])-1, parseInt(line[4])-1];
				this.face.push(vec2);
			}
		}
	}

	this.center();
	this.buffers = initBuffer(gl, this);
	this.loaded = true;
	console.log(this.label + ": Model loaded.");
}
Model.prototype.center = function(){
		var x = 0; var y = 0; var z = 0;
		var l = this.vert.length;
		//console.log(l);
		for(var i = 0; i<l; i++){
			x = (x+this.vert[i][0]);
			y = (y+this.vert[i][1]);
			z = (z+this.vert[i][2]);
		}
		//console.log(x + "|" + y + "|" + z);
		var t = [0,0,0];
		var v = vec3.fromValues(-x/l,-y/l,-z/l);
		//console.log(v);
		mat4.fromTranslation(t,v);
		for(var i = 0; i<l; i++){
			vec3.transformMat4(this.vert[i],this.vert[i],t);
		}
		//this.buffers = initBuffer(gl,this);
}
Model.prototype.openUrl = function(url, filetype){
	this.loaded = false;
	var request = new XMLHttpRequest();
	request.open('GET', url);
	request.send();
	var thisObject = this;
	console.log(this.label + ": Opening url ...");
	request.onreadystatechange = function(){
		if(request.readyState == 4){
			if(filetype == "obj" || filetype == ".obj"){
				thisObject.loadObj(request.responseText);
			}
		}
	}

}
