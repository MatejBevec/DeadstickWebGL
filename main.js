//runtime
var canvas;
var UIcanvas;
var gl;
var ctx;
var canvasRatio;
var fullscreen;
var sWidth;
var sHeight;

//other
var paused;

//declare game objects
var oBoi;
var oAvioncl;
var oSurface;
var exampleObject;
var oRing;
var rings = []; //array holding all rings

var scene;

function start(){

	//GL INITIALIZATION

	canvas = document.getElementById("canvas");
	UIcanvas = document.getElementById("UIcanvas");
	gl = canvas.getContext("webgl");
	ctx = UIcanvas.getContext("2d");

	sWidth = window.screen.width;
	sHeight = window.screen.height;
	fullscreen = false;

	paused = false;

	if (gl === null){
		alert("Unable to initialize WebGL");
		return;
	}

	gl.clearColor(0.3,0.6,1.0,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	canvasRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;

	//END OF GL INITIALIZATION

	//initializing the camera and the shader
	const camera = new CameraObject("cam1", 60, CameraObject.prototype.glRatio(gl), 0.01, 10000.0);
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

	oSurface = new TerrainObject("oSurface");
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
	var started = false;
	var raceTime = 0;
	var startTime = 0;
	var oGhost = null;
	//reseting
	var rTime = 0;
	//storing runs in array of objects of type {time(num), ghost(Ghost)}
	var runs = [];
	//compare func for sorting runs
	function compareRuns(a,b){
		if(a.time < b.time){return -1;}
		if(a.time > b.time){return 1;}
		return 0;
	}
	function initGhosts(r){
		for(var i in r){
	    	r[i].ghost.step = 0;
	    	scene.root.attach(r[i].ghost);
	    }
	}
	function dettachGhosts(r){
		for(var i in r){
			scene.root.dettach(r[i].ghost);
		}
	}
	var prevRun = null;


	//INTIALIZING THE SCENE
	//add objects to scene
	scene = new Scene("scene1");
	oBoi.attach(camera);
	oAvioncl.attach(camera2);
	//scene.root.attach(oAvioncl);
	scene.root.attach(oSurface);
	scene.root.attach(oBoi);
	scene.attachGroup(rings);

	//extra variables

	//GAME LOOP
	var then;
	function render(now) {
		//get time
	    now *= 0.001;  // convert to seconds
	    const deltaTime = now - then;
	    then = now;
	    //the time during the current frame
	    const frameTime = (new Date()).getTime();

	 	
	    //extra game logic


	    //game logic in onTick method of scene objects
	   	var mat = mat4.create();
	    scene.animate(scene.root);
	    scene.updateGlobalMat(scene.root, mat);

	    //ring object logic
	    if(Input[32] && !started){
	    	//temporary
	    	oSurface.verts = oSurface.getVertices();
	    	console.log(oSurface.verts);
	    	//end of temporary
	    	started = true;
	    	startTime = frameTime;
	    	oBoi.history = [];
	    	console.log("HELLO");
	    	//attach ghosts of all previous runs to the scene
	    	initGhosts(runs);
	    	/*if(oGhost){
	    		scene.root.attach(oGhost);
	    	}*/
	    	raceTime = 0;
	    }
	    if(started){
	    	//raceTime = frameTime - startTime;
	    	raceTime = frameTime - startTime;
	    }
	    //finishing the race
	   	if(oBoi.collidesWith(rings[currentRing]) && !rings[currentRing].tagged){
	   		rings[currentRing].tagged = true;
	   		currentRing++;
	   		if(currentRing == numRings){
	   			//create new ghost object for the current run
	   			dettachGhosts(runs);
	   			/*if(oGhost){
	   				scene.root.dettach(oGhost);
	   			}*/
	   			oGhost = new Ghost("oGhost", oBoi.history.slice());
	   			//store this run with previous runs
	   			prevRun = {
	   				time: raceTime,
	   				ghost: oGhost
	   			}
	   			runs.push(prevRun);
	   			//sort runs from fastest to slowest time
	   			runs.sort(compareRuns);
	   			//reset the race
	   			oBoi.translate = mat4.create();
	   			oBoi.onStart();
	   			currentRing = 0;
	   			for(i in rings){
	   				rings[i].tagged = false;
	   			}
	   			started = false;
	   			raceTime = 0;
	   			Input[32] = false;

	   		}
	   	}
	   	//reset the race from user input
	   	if(Input[82]){
	   		rTime += deltaTime;
	   	}
	   	else{
	   		rTime = 0;
	   	}
	   	//reset if r is held long enough or player hits the ground
	   	if(rTime >= 3 || oBoi.aabb.collidesWithVerts(oSurface.verts)){
	   			dettachGhosts(runs);
	   			oBoi.translate = mat4.create();
	   			oBoi.onStart();
	   			currentRing = 0;
	   			for(i in rings){
	   				rings[i].tagged = false;
	   			}
	   			started = false;
	   			raceTime = 0;
	   			Input[32] = false;
	   			rTime = 0;
	   	}

	   	//toggle fullscreen
	   	//70 = 'f' 122 = 'f11'
	   	if((Input[122] || Input[70]) && !fullscreen){
	   		canvas.height = sHeight;
			canvas.width = sWidth;
			UIcanvas.height = sHeight;
			UIcanvas.width = sWidth;
			gl.viewport(0,0, sWidth, sHeight);
			fullscreen = true;
			Input[122] = false;
			Input[70] = false;
	   	}

	   	if((Input[122] || Input[70]) && fullscreen){
	   		canvas.height = 480;
			canvas.width = 640;
			UIcanvas.height = 480;
			UIcanvas.width = 640;
			gl.viewport(0,0, 640, 480);
			fullscreen = false;
			Input[122] = false;
			Input[70] = false;
	   	}

	   	

	    //refresh frame
	    refreshFrame(gl);
	    //render frame
	    scene.draw(scene.root, gl, programInfo, camera);

	    //DRAW GUI
	    ctx.textAlign = "left";
	    ctx.fillStyle = "rgba(255,255,255,255)"
	    ctx.clearRect(0,0,UIcanvas.width,UIcanvas.height);
		ctx.font="20px Verdana";
		var oBoiPos = oBoi.getTranslation();
		//ctx.fillText("x: " + oBoiPos[0].toFixed(1) + "  y: " + oBoiPos[1].toFixed(1) + "  z: " + oBoiPos[2].toFixed(1), 20,30);
		ctx.fillText("progress: " + currentRing + "/" + numRings,20,30)
		ctx.fillText("time: " + (raceTime/1000).toFixed(1), 20, 55)
		//ctx.fillText("oBoi box: " + oBoi.aabb.min.toString()
		//	+ " | " +  oBoi.aabb.max.toString(),20,70);
		//ctx.fillText(oBoi.collidesWith(rings[currentRing]),20,90);
		ctx.fillText("DEADSTICK", UIcanvas.width-135, 30);
		//ctx.fillText(oBoi.aabb.collidesWithVerts(oSurface.verts), UIcanvas.width-135, 60);

		//start screen
		if(!started){
			ctx.textAlign = "center";
			var offX = UIcanvas.width/2;
			ctx.fillText("Press SPACE to start.", offX, UIcanvas.height-30);
			//results
			var offY = 50;
			ctx.fillText("BEST RUNS", offX, offY);
			if(runs.length > 0){
				//note new record
				if(prevRun == runs[0] && runs.length > 1){
					offY += 25;
					ctx.fillText("New best time !", offX, offY);
				}
				//display the best 10 times
				var l = Math.min(runs.length, 10);
				for(var i = 0; i < l; i++){
					offY += 25;
					var str = ((i+1) + " ~ " + (runs[i].time/1000).toFixed(2) + "s");
					if(prevRun == runs[i]){
						str = ("> " + str + " <");
					}
					ctx.fillText(str, offX, offY);
				}
			}
			else{
				ctx.fillText("No results yet.", offX, offY+25);
			}
		}

	    requestAnimationFrame(render);
 	}
  	requestAnimationFrame(render);
	//END OF LOOP
}



//refresh gl frame
function refreshFrame(gl){
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

}

