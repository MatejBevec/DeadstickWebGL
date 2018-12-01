//runtime
var canvas;
var UIcanvas;
var gl;
var ctx;
var canvasRatio;

//declare game objects
var oSurface;

function start(){

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
	

	const programInfo = initShaderProgram(gl, shader1.v, shader1.f, shader1.info);

	//INITIALIZING GAME OBJECTS

	oSurface = new VisibleObject("oSurface");
	var mSurface = new Model("mSurface");
	mSurface.openUrl('./assets/terrain1.obj', 'obj');
	oSurface.model = mSurface;
	oSurface.texture = initTexture(gl, './assets/sand.jpg');
	//oSurface.doScale([0.5,0.5,0.5]);
	oSurface.doTranslate([0,-10,0]);
	oSurface.doScale([10,10,10]);

	var exampleObject = new ExampleObject("exampleObject");
	oSurface.texture = exampleObject.texture;

	oBoi = new FlyingBoi("oBoi");

	//INTIALIZING THE SCENE
	//add objects to scene
	var scene = new Scene();
	var objectRoot = new GameObject("ringRoot");
	var objectTransforms = [];
	var currentObject = new RingObject("oRing0");
	var placer = new GameObject("placer");
	currentObject.index = 0;
	var index = 0;

	scene.root.attach(oSurface);
	scene.root.attach(objectRoot);
	scene.root.attach(currentObject);
	scene.root.attach(placer);
	//placer.attach(currentObject);
	placer.attach(camera);
	camera.doTranslate([0,3,10]);

	//GAME LOOP
	var then;
	function render(now) {
		//get time
	    now *= 0.001;  // convert to seconds
	    const deltaTime = now - then;
	    then = now;


	 	
	    //extra game logic
	    if(Input[65]){
	    	placer.doTranslate([-0.5,0,0]);
	    }
	    if(Input[68]){
	    	placer.doTranslate([0.5,0,0]);
	    }
	   	if(Input[87]){
	    	placer.doTranslate([0,0,-0.5]);
	    }
	    if(Input[83]){
	    	placer.doTranslate([0,0,0.5]);
	    }
	    if(Input[32]){
	    	placer.doTranslate([0,0.3,0]);
	    }
	    if(Input[16]){
	    	placer.doTranslate([0,-0.3,0]);
	    }
	    currentObject.translate = placer.translate;
	    if(Input[13]){
	    	scene.attach(currentObject);
	    	objectTransforms.push(currentObject.translate);
	    	objectTransforms.push(currentObject.rotate);
	    	objectTransforms.push(currentObject.scale);
	    	currentObject = new RingObject("oRing"+ index);
	    	currentObject.index = index;
	    }
	   	//loop tagging

	    //game logic in onTick method of scene objects
	   	var mat = mat4.create();
	    scene.animate(scene.root, mat);
	    scene.updateGlobalMat(scene.root, mat);



	    //refresh frame
	    refreshFrame(gl);
	    //render frame
	    scene.draw(scene.root, gl, programInfo, camera);


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

