//deadstick game framework - Matej Bevec

//game object definiton
function GameObject(label){
	this.label = label;

	this.translate = mat4.create();
	this.rotate = mat4.create();
	this.scale = mat4.create();

	this.parentMatrix = mat4.create();
	this.children = [];

	//time elapsed, since the previous frame was rendered
	this.deltaTime = 1;

	//physics (maybe) - or maybe move it to VisibleObject or new subclass
	this.pSpeed = [0.0,0.0,0.0];
	this.pAcceleration = [0.0,0.0,0.0];
	this.pMass = 0;
	this.pForces = {};

}
GameObject.prototype.onStart = function(){
	//to be called in the constructor
	//initializes non constant properties of a GameObject
}
GameObject.prototype.onTick = function(){
	//...
	//console.log("onTick: " + this.label);
	//do physics calculations and translate accordingly
	//this.doPhysics();
}
GameObject.prototype.attach = function(object){
	this.children.push(object);
}
GameObject.prototype.dettach = function(object){
	var i = this.children.indexOf(object);
	this.children.splice(i,1);
}
//return the translation matrix for the game object
GameObject.prototype.getMatrixLocal = function(){
	var mat = mat4.create();
	mat4.mul(mat, this.scale, mat);
	mat4.mul(mat, this.rotate, mat);
	mat4.mul(mat, this.translate, mat);
	return mat;
}
GameObject.prototype.getMatrixGlobal = function(){
	var mat = mat4.create();
	mat4.mul(mat,this. parentMatrix, this.getMatrixLocal());
	return mat;
}
//setters
GameObject.prototype.setTranslation = function(translateVector){mat4.fromTranslation(this.rotate, translateVector);}
GameObject.prototype.setRotation = function(angle, axis){mat4.fromRotation(this.rotate, angle, axis);}
GameObject.prototype.setScaling = function(scaleVector){mat4.fromScaling(this.scale, scaleVector);}
//getters
GameObject.prototype.getTranslation = function(){
	var vec = vec3.create();
	mat4.getTranslation(vec,this.translate);
	return vec;
}
GameObject.prototype.getRotation = function(){
	var q = quat.create();
	mat4.getRotation(q,this.rotate);
	return quat
}
GameObject.prototype.getScaling = function(){
	var vec = vec3.create();
	mat4.getScaling(vec,this.scale);
	return vec;
}
//transformations
GameObject.prototype.doTranslate = function(translateVector){
	mat4.translate(this.translate, this.translate, translateVector);
}
GameObject.prototype.doRotate = function(angle, axis){
	mat4.rotate(this.rotate, this.rotate, angle, axis);
}
GameObject.prototype.rotateEulers = function(eulersVector){
	mat4.rotateX(this.rotate, this.rotate, eulersVector[0]);
	mat4.rotateY(this.rotate, this.rotate, eulersVector[1]);
	mat4.rotateZ(this.rotate, this.rotate, eulersVector[2]);
}
GameObject.prototype.doScale = function(scaleVector){
	mat4.scale(this.scale, this.scale, scaleVector);
}
//physics calculations (maybe move it to VisibleObject or new subclass)
GameObject.prototype.doPhysics = function(){
	//calculate the acceleration vector from forces
	if(this.pForces){
		this.pAcceleration = [0.0,0.0,0.0];
		for(var key in this.pForces){
			var acc = vec4.clone(this.pForces[key]);
			acc.map(x => x/this.pMass);
			vec3.add(this.pAcceleration, this.pAcceleration, acc);
		}
	}
	//update the object's speed
	vec3.add(this.pSpeed, this.pSpeed, this.pAcceleration);
	//move the object
	this.doTranslate(this.pSpeed);
}


//inherets GameObject; VisibleObject is an object with a renderable 3D model
function VisibleObject(label){
	GameObject.call(this, label);
	this.model = null;
	this.texture = null;
	this.visible = true;

	//collider / bounding box
	/*this.aabb = {
		minInit: [0,0,0],
		maxInit: [0,0,0],
		min: [0,0,0],
		max: [0,0,0],
	}*/
	this.aabb = new BoxCollider([0,0,0],[0,0,0]);
	
}
VisibleObject.prototype = Object.create(GameObject.prototype);
VisibleObject.prototype.onTick = function(){
	GameObject.prototype.onTick.call(this);

}
//draw the object through the lens of the specified camera
VisibleObject.prototype.draw = function(gl, programInfo, camera, lights){
	//only draw object if object is "visible"
	//console.log("at function draw:",this);
	if(this.visible && this.model.buffers){
		//console.log("hello", this.model.buffers);
		//call the graphics.js function to draw the object
		//possibly slow to calculate matrices every frame
		drawBuffers(gl, programInfo, this.model.buffers, this.texture, this.getMatrixGlobal(), camera, lights, this.rotate);
	}
}
//returns the model's vertices, transformed by the objects transformation martices
VisibleObject.prototype.getVertices = function(){
	var vertsFlat = this.model.mesh.vertices;
	var mat = this.getMatrixGlobal();
	var verts = [];
	for(var i = 0; i < vertsFlat.length; i += 3){
		var v = [vertsFlat[i], vertsFlat[i+1], vertsFlat[i+2]];
		vec3.transformMat4(v,v,mat);
		verts.push(v);
	}
	return verts;
}
//checks whether this object collides with the given object at the moment
//(not sure where to call it)
VisibleObject.prototype.collidesWithPoint = function(point){
	var check = (point[0] >= this.aabb.min[0] && point[0] <= this.aabb.max[0]) &&
				(point[1] >= this.aabb.min[1] && point[1] <= this.aabb.max[1]) &&
				(point[2] >= this.aabb.min[2] && point[2] <= this.aabb.max[2]);
	return check;
}
VisibleObject.prototype.collidesWith = function(obj){
	if(obj && obj.aabb){
	var check = (obj.aabb.min[0] <= this.aabb.max[0] && this.aabb.min[0] <= obj.aabb.max[0]) &&
				(obj.aabb.min[1] <= this.aabb.max[1] && this.aabb.min[1] <= obj.aabb.max[1]) &&
				(obj.aabb.min[2] <= this.aabb.max[2] && this.aabb.min[2] <= obj.aabb.max[2]);
	return check;
	}
	else{
		return false;
	}
}
VisibleObject.prototype.updateAABB = function(){
	vec3.transformMat4(this.aabb.min, this.aabb.minInit, this.translate);
	vec3.transformMat4(this.aabb.max, this.aabb.maxInit, this.translate);
}

//inherets GameObject; a camera object renders a view into the 3D world
function CameraObject(label, fieldOfView, aspect, clipNear, clipFar){
	GameObject.call(this,label);
	this.fieldOfView = fieldOfView;
	this.aspect = aspect;
	this.CANVAS_RATIO = gl.canvas.clientWidth / gl.canvas.clientHeight;
	this.clipNear = clipNear;
	this.clipFar = clipFar;
}
CameraObject.prototype = Object.create(GameObject.prototype);
CameraObject.prototype.glRatio = function(gl){
	//return (gl.canvas.clientWidth / gl.canvas.clientHeight);
	vp = gl.getParameter(gl.VIEWPORT);
	return vp[2]/vp[3];
}
CameraObject.prototype.onTick = function(){
	GameObject.prototype.onTick.call(this);
	//camera stuff
}
CameraObject.prototype.getProjectionMatrix = function(){
	var matrix = mat4.create();
	mat4.perspective(matrix, this.fieldOfView, this.aspectRatio, this.clipNear, this.clipFar);
	return matrix;
}
CameraObject.prototype.lookAt = function(gameObject, up){
	var mat = mat4.create();
	mat4.lookAt(mat, this.getTranslation(), gameObject.getTranslation(), up);
	var q = quat.create();
	mat4.getRotation(q, mat);
	mat4.fromQuat(mat, q);

	this.rotate = mat;
}



//inherets GameObject; this object represents a light in the scene and is called when rendering
function LightObject(label, lightType){
	GameObject.call(this,label);
	this.lightType = lightType;
	//how do I implement constants here ?
	//spot light properties
	this.spotAngle;
	this.falloffRate;

}
LightObject.prototype.DIRECTIONAL = 0; LightObject.prototype.POINT = 1; LightObject.prototype.SPOT = 2;
LightObject.prototype.onTick = function(){
	GameObject.prototype.onTick.call(this);
	//light stuff
}


//model obj test
function loadFile(){
	var input = document.getElementById("input");
	var modelObj = new Model();
	const reader = new FileReader();
	reader.readAsText(input.files[0]);
	reader.onload = function (){
		//console.log(reader.result);
		modelObj.loadObj(reader.result);
		//console.log(modelObj);
	}
	//testing the visible obj
	var vObj = new VisibleObject("vObj");
	vObj.model = modelObj;
	vObj.doTranslate([2.0,1.0,-5.0]);
	//console.log(vObj);
	console.log(vObj, vObj.getVertices());
}

//scene object experimentation

function Scene(name){
	this.root = new GameObject("objRoot");
	this.cameras = [];
	this.lights = [];
	this.setUp = function(){
		//set up the scene
	}
	this.sceneName = name;
}
Scene.prototype.attach = function(obj){
	this.root.attach(obj);
}
Scene.prototype.attachGroup = function(group){
	for(var i in group){
		this.root.attach(group[i]);
	}
}
//document.requestAnimationFrame(this.animate);
//draw the scene from all cameras
Scene.prototype.draw = function(obj, gl, programInfo, camera){
	//go recursively over all object for every camera and call draw(camera) on all of them
	if(obj.draw){
		obj.draw(gl, programInfo, camera, null);
	}
	for(var i = 0; i < obj.children.length; i++){
		//move this to seperate recursive function
		this.draw(obj.children[i], gl, programInfo, camera);
	}
}
//calls onTick on every object in the scene
//calculates parentMatrices
Scene.prototype.animate = function(obj){

	if(obj.onTick){
		obj.onTick();
	}
	//calculate the parent matrix for al the child objects

	for(var i = 0; i < obj.children.length; i++){
		this.animate(obj.children[i]);
	}
}
Scene.prototype.updateGlobalMat = function(obj, parentMat){
	obj.parentMatrix = parentMat;
	var childMat = mat4.create();
	mat4.mul(childMat, parentMat, obj.getMatrixLocal());

	//calculate the parent matrix for all the child objects

	for(var i = 0; i < obj.children.length; i++){
		this.updateGlobalMat(obj.children[i], childMat);
	}
}




//KEYBOARD INPUT HANDLING
var Input = {};
document.addEventListener("keydown", function(e){
	Input[e.keyCode] = true;
});
document.addEventListener("keyup", function(e){
	Input[e.keyCode] = false;
});

//CLONE A JS OBJECT
//!!doesn't work
function clone(src) {
  let target = {};
  for (let prop in src) {
    if (src.hasOwnProperty(prop)) {
      target[prop] = src[prop];
    }
  }
  //console.log();
  target.__proto__ = src.__proto__;
  return target;
}



//MATRIX DECOMPOSITION
function isolateTranslation(mat){
	var vec = mat4.create();
	mat4.getTranslation(vec, mat);
	var newMat = mat4.create();
	mat4.fromTranslation(newMat, vec)
	return newMat;
}
function isolateRotation(mat){
	var q = quat.create();
	mat4.getRotation(q, mat);
	var newMat = mat4.create();
	mat4.fromQuat(newMat, q);
	return newMat;
}
function isolateScaling(mat){
	var vec = mat4.create();
	mat4.getScaling(vec, mat);
	var newMat = mat4.create();
	mat4.fromScaling(newMat, vec);
	return newMat;
}



//GENEREAL COLLISION DETECTION
function BoxCollider(min,max){
	this.minInit = min;
	this.maxInit = max;
	this.min = min;
	this.max = max;
}
BoxCollider.prototype.collidesWithPoint = function(point){
		var check = (point[0] >= this.min[0] && point[0] <= this.max[0]) &&
				(point[1] >= this.min[1] && point[1] <= this.max[1]) &&
				(point[2] >= this.min[2] && point[2] <= this.max[2]);
	return check;
}
BoxCollider.prototype.collidesWithBox = function(aabb){
	if(obj && aabb){
		var check = (aabb.min[0] <= this.max[0] && this.min[0] <= aabb.max[0]) &&
				(aabb.min[1] <= this.max[1] && this.min[1] <= aabb.max[1]) &&
				(aabb.min[2] <= this.max[2] && this.min[2] <= aabb.max[2]);
		return check;
	}
	else{
		return false;
	}
}
//checks if this AABB collides with a point array (nested)
BoxCollider.prototype.collidesWithVerts = function(verts){

	min = this.min;
	max = this.max;

	if(verts != null && verts.length > 0){
		for(var i = 0; i < verts.length; i += 3){
			var point = verts[i];
			var check = (point[0] >= min[0] && point[0] <= max[0]) &&
					(point[1] >= min[1] && point[1] <= max[1]) &&
					(point[2] >= min[2] && point[2] <= max[2]);
				//check = point[2] < max[2] && point[2] > min[2] 
			if(check){
				return true;
			}
		}
		return false;
	}
	return false;
}
//update aabb
BoxCollider.prototype.update = function(mat){
	vec3.transformMat4(this.min, this.minInit, mat);
	vec3.transformMat4(this.max, this.maxInit, mat);
}


//NEST A FLAT ARRAY
function nestArray(a,size){
	var out = [];
	for(var i = 0; i < a.length; i += size){
		out[i] = [];
		for(var j = 0; j < size; j++){
			out[i][j] = a[i+j];
		}
	}
	return out;
}