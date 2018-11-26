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

	gl.clearColor(0.0,0.0,0.0,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	canvasRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;

	//END OF GL INITIALIZATION

	//initializing the camera and the shader
	const camera = new CameraObject("cam1", 45, CameraObject.prototype.glRatio(gl), 0.01, 1000.0);
	const programInfo = initShaderProgram(gl, shader1.v, shader1.f, shader1.info);

	//initializing game objects
	var model1 = new Model("mKocka");
	model1.openUrl('./assets/kocka.obj', 'obj');
	var obj2 = new VisibleObject("obj2");
	obj2.model = model1;
	obj2.texture = initTexture(gl, './assets/kocka.png');

	var exampleObject = new ExampleObject("exampleObject");
	//var exampleObject2 = clone(exampleObject);
	var exampleObject2 = new ExampleObject("example2");
	
	exampleObject2.doTranslate([-2,0,0]);
	obj2.doScale([0.5,0.5,0.5]);

	//add objects to scene
	var scene = new Scene();
	scene.root.attach(obj2);
	scene.root.attach(exampleObject);
	scene.root.attach(exampleObject2);
	console.log(exampleObject === exampleObject2);
	//console.log(scene);

	//GAME LOOP
	var then;
	function render(now) {
		//get time
	    now *= 0.001;  // convert to seconds
	    const deltaTime = now - then;
	    then = now;

	    //extra game logic
	   	obj2.doRotate(0.02, [0,1,0.5]);
	    //game logic in onTick method of scene objects
	    scene.animate(scene.root);


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

