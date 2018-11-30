//testing
var canvas;
var gl;
var canvasRatio;
function start(){

	//GL INITIALIZATION

	canvas = document.getElementById("canvas");
	gl = canvas.getContext("webgl");

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
	camera.doTranslate([0,3,-15]);
	camera.doRotate(Math.PI, [0,1,0]);
	//camera.doRotate(Math.PI/2 + 0.1, [1,0,0]);
	//camera.doRotate(Math.PI, [0,0,1]);
	//camera.doTranslate([0,0,10]);
	const programInfo = initShaderProgram(gl, shader1.v, shader1.f, shader1.info);

	//INITIALIZING GAME OBJECTS
	var model1 = new Model("mKocka");
	model1.openUrl('./assets/kocka.obj', 'obj');
	var obj2 = new VisibleObject("obj2");
	obj2.model = model1;
	obj2.texture = initTexture(gl, './assets/kocka.png');
	obj2.doScale([0.2,0.2,0.2]);
	obj2.doTranslate([0,-1,1]);

	var oSurface = new VisibleObject("oSurface");
	var mSurface = new Model("mSurface");
	mSurface.openUrl('./assets/terrain1.obj', 'obj');
	oSurface.model = mSurface;
	oSurface.texture = initTexture(gl, './assets/sand.jpg');
	console.log(oSurface.texture);
	//oSurface.doScale([0.5,0.5,0.5]);
	oSurface.doTranslate([0,-10,0]);
	oSurface.doScale([10,10,10]);

	var oAvioncl = new Avioncl("oAvioncl");
	oAvioncl.doScale([0.1,0.1,0.1]);
	oAvioncl.doRotate(Math.PI, [0,1,0]);
	//oAvioncl.doRotate();

	var exampleObject = new ExampleObject("exampleObject");
	oSurface.texture = exampleObject.texture;

	var oBoi = new FlyingBoi("oBoi");

	//INTIALIZING THE SCENE
	//add objects to scene
	var scene = new Scene();
	//exampleObject.attach(obj2);
	exampleObject.attach(obj2);
	oAvioncl.attach(camera);
	scene.root.attach(oAvioncl);
	scene.root.attach(exampleObject);
	scene.root.attach(oSurface);
	scene.root.attach(oBoi);
	//console.log(scene);

	//GAME LOOP
	var then;
	function render(now) {
		//get time
	    now *= 0.001;  // convert to seconds
	    const deltaTime = now - then;
	    then = now;

	    //extra game logic
	   	//obj2.doRotate(0.02, [0,1,0.5]);
	   	//camera.lookAt(oBoi, [0,1,0]);
	   	//camera.setRotation(1, [0,1,0]);
	   	var rot = mat4.create();
	   	mat4.fromRotation(rot,1,[0,1,0]);
	   	//camera.doTranslate([0,0.01,0]);
	   	//camera.rotate = rot
	   	//camera.doTranslate([0,0,0.1]);
	   	//console.log(obj2.parentMatrix);

	    //game logic in onTick method of scene objects
	    var mat = mat4.create();
	    scene.animate(scene.root, mat);


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

