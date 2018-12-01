//runtime
var canvas;
var UIcanvas;
var gl;
var ctx;
var canvasRatio;

//declare game objects
var oBoi;
var oAvioncl;
var oSurface;
var exampleObject;
var oRing;
var rings = []; //array holding all rings

var scene;

function start(){

	//some testing
	var mat = mat4.create();
	mat4.translate(mat, mat, [-1,-2,-3]);
	mat4.rotate(mat, mat, 1, [0,1,0]);
	mat4.scale(mat, mat, [2,2,2]);
	
	
	var mat2 = mat4.create();
	//mat4.fromRotationTranslationScale(mat2, q, v, s);
	console.log(isolateTranslation(mat), isolateRotation(mat), isolateScaling(mat));

	//GL INITIALIZATION

	canvas = document.getElementById("canvas");
	UIcanvas = document.getElementById("UIcanvas");
	gl = canvas.getContext("webgl");
	ctx = UIcanvas.getContext("2d");

	if (gl === null){
		alert("Unable to initialize WebGL");
		return;
	}

	gl.clearColor(0.3,0.6,1.0,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	canvasRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;

	//END OF GL INITIALIZATION

	//initializing the camera and the shader
	const camera = new CameraObject("cam1", 55, CameraObject.prototype.glRatio(gl), 0.01, 10000.0);
	//for avioncl
	//camera.doTranslate([0,3,-15]);
	camera.doRotate(Math.PI, [0,1,0]);
	//for flyboi
	camera.doTranslate([0,-4,-1]);
	camera.doRotate(Math.PI/2 - 0.1, [1,0,0]);
	//camera 2
	const camera2 = new CameraObject("cam2", 55, CameraObject.prototype.glRatio(gl), 0.01, 10000.0);
	camera2.doTranslate([0,1,-10]);
	camera2.doRotate(Math.PI, [0,1,0]);
	//camera.doTranslate([0,0,10]);
	const programInfo = initShaderProgram(gl, shader1.v, shader1.f, shader1.info);

	//INITIALIZING GAME OBJECTS

	oSurface = new VisibleObject("oSurface");
	var mSurface = new Model("mSurface");
	mSurface.openUrl('./assets/terrain1.obj', 'obj');
	oSurface.model = mSurface;
	oSurface.texture = initTexture(gl, './assets/sand.jpg');
	console.log(oSurface.texture);
	//oSurface.doScale([0.5,0.5,0.5]);
	oSurface.doTranslate([0,-10,-120]);
	oSurface.doScale([10,10,10]);

	oAvioncl = new Avioncl("oAvioncl");

	

	exampleObject = new ExampleObject("exampleObject");
	oSurface.texture = exampleObject.texture;

	oBoi = new FlyingBoi("oBoi");

	//create some rings
	var numRings = 10;
	for(var i = 0; i < numRings; i++){
		var ring = new RingObject("ring" + i);
		ring.index = i;
		ring.doTranslate([Math.random()*16-8,Math.random()*16-8,-30*(i+1)]);
		rings[i] = ring;
	}
	var currentRing = 0;
	console.log(rings[currentRing]);


	//INTIALIZING THE SCENE
	//add objects to scene
	scene = new Scene();
	oBoi.attach(camera);
	oAvioncl.attach(camera2);
	//scene.root.attach(oAvioncl);
	scene.root.attach(exampleObject);
	scene.root.attach(oSurface);
	scene.root.attach(oBoi);
	scene.attachGroup(rings);

	//extra variables

	//GAME LOOP
	var d = new Date();
	var startTime = d.getTime();
	var then;
	function render(now) {
		//get time
	    now *= 0.001;  // convert to seconds
	    const deltaTime = now - then;
	    then = now;

	 	
	    //extra game logic
	   	if(Input[13]){
	   		var oGhost = new Ghost("oGhost", oBoi.history);
	   		//oGhost.path = oBoi.history();
	   		scene.root.attach(oGhost);
	   	}
	   	if(Input[16]){
	   		console.log();
	   	}


	    //game logic in onTick method of scene objects
	   	var mat = mat4.create();
	    scene.animate(scene.root, mat);
	    scene.updateGlobalMat(scene.root, mat);

	    //rings
	   	if(oBoi.collidesWith(rings[currentRing]) && !rings[currentRing].tagged){
	   		rings[currentRing].tagged = true;
	   		currentRing++;
	   		if(currentRing == numRings){
	   			var oGhost = new Ghost("oGhost", oBoi.history);
	   			scene.root.attach(oGhost);
	   			oBoi.translate = mat4.create();
	   			currentRing = 0;
	   			for(i in rings){
	   				rings[i].tagged = false;
	   			}

	   		}
	   	}


	    //refresh frame
	    refreshFrame(gl);
	    //render frame
	    scene.draw(scene.root, gl, programInfo, camera);

	    //DRAW GUI
	    ctx.fillStyle = "rgba(255,255,255,255)"
	    ctx.clearRect(0,0,UIcanvas.width,UIcanvas.height);
		ctx.font="20px Verdana";
		var oBoiPos = oBoi.getTranslation();
		//ctx.fillText("x: " + oBoiPos[0].toFixed(1) + "  y: " + oBoiPos[1].toFixed(1) + "  z: " + oBoiPos[2].toFixed(1), 20,30);
		ctx.fillText("progress: " + currentRing + "/" + numRings,20,30)
		//ctx.fillText("oBoi box: " + oBoi.aabb.min.toString()
		//	+ " | " +  oBoi.aabb.max.toString(),20,70);
		ctx.fillText(oBoi.collidesWith(rings[currentRing]),20,90);
		ctx.fillText("DEADSTICK", UIcanvas.width-135, 30);



	    requestAnimationFrame(render);
 	}
  	requestAnimationFrame(render);
	//END OF LOOP
	
}

function refreshFrame(gl){
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

}

