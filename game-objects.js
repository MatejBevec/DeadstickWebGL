//write new game objects here

//to copy an object call clone(src), don't use new ...
function ExampleObject(label){
	VisibleObject.call(this, label);

	//write any initialization code here, or do it in main.js
	//a global gl context object "gl" is taken for granted - bad practice
	mExample = new Model("mExample");
	mExample.openUrl('./assets/human.obj', 'obj');
	//mExample.center();
	this.model = mExample;
	this.texture = initTexture(gl, './assets/sand.jpg');

	//collider
	this.aabb.minInit = [-1,-1,-1];
	this.aabb.maxInit = [1,1,1];

	this.doTranslate([1.0,0,0]);
}
ExampleObject.prototype = Object.create(VisibleObject.prototype);
ExampleObject.prototype.onTick = function(){
	VisibleObject.prototype.onTick.call(this);
	this.updateAABB();

	//object behavior every tick goes here
	this.doRotate(0.03, [0.5,1.0,0.3]);

}

function RingObject(label){
	VisibleObject.call(this, label);
	mRing = new Model("mExample");
	mRing.openUrl('./assets/ring.obj', 'obj');
	this.model = mRing;
	this.green = makeTextureFromColor(gl, [50,255,50,255]);
	this.yellow = makeTextureFromColor(gl, [255,255,50,255]);
	this.texture = this.yellow;

	this.doScale([0.3,0.3,0.3]);

	this.aabb.minInit = [-3,-3, -2];
	this.aabb.maxInit = [3,3,2];

	this.tagged = false;
	this.prev = null;
	this.index = 0;

	this.step; //the race step at which the ring was tagged
}
RingObject.prototype = Object.create(VisibleObject.prototype);
RingObject.prototype.onTick = function(){
	VisibleObject.prototype.onTick.call(this);
	this.updateAABB();

	/*if(this.collidesWith(oBoi)){
		this.tagged = true;
	}*/

	if(this.tagged){
		this.texture = this.green;
	}
	if(!this.tagged){
		this.texture = this.yellow;
	}

	//object behavior every tick goes here
	

}

function FlyingBoi(label){
	VisibleObject.call(this, label);

	mExample = new Model("mExample");
	mExample.openUrl('./assets/human.obj', 'obj');
	//mExample.center();
	this.model = mExample;
	this.texture = makeTextureFromColor(gl,[255,0,0,255]);

	//this.direction = [1.0,1.0,1.0];

	this.aabb = new BoxCollider([0,0,0],[0,0,0]);
	this.aabb.minInit = [-1.3,-1.3,-1.3];
	this.aabb.maxInit = [1.3,1.3,1.3];

	this.doRotate(-90*Math.PI/180, [1,0,0]);
	this.doRotate(Math.PI, [0,1,0]);

	this.rotRateX = 0;
	this.rotRateY = 0;
	this.rotRateZ = 0;
	this.spd = 0.1;

	this.history = [];
}
FlyingBoi.prototype = Object.create(VisibleObject.prototype);
//implement in game object class !!!
FlyingBoi.prototype.onStart = function(){
	this.rotate = mat4.create();
	this.doRotate(-90*Math.PI/180, [1,0,0]);
	this.doRotate(Math.PI, [0,1,0]);

	this.rotRateX = 0;
	this.rotRateY = 0;
	this.rotRateZ = 0;
	this.spd = 0.1;

	this.history = [];
}
FlyingBoi.prototype.onTick = function(){
	VisibleObject.prototype.onTick.call(this);
	this.updateAABB();

	if(Input[65] || Input[68]){
		if(Input[65] && this.rotRateZ > -0.05){
			this.rotRateZ -= 0.003;
		}
		if(Input[68] && this.rotRateZ < 0.05){
			this.rotRateZ += 0.003;
		}
	}
	else{
		this.rotRateZ -= Math.sign(this.rotRateZ)*0.003;
		if(Math.abs(this.rotRateZ) < 0.003){
			this.rotRateZ = 0;
		}
	}
	this.doRotate(this.rotRateZ, [0,1,0]);

	if(Input[83] || Input[87]){
		if(Input[83] && this.rotRateX > -0.05){
			this.rotRateX -= 0.003;
		}
		if(Input[87] && this.rotRateX < 0.02){
			this.rotRateX += 0.002;
		}
	}
	else{
		this.rotRateX -= Math.sign(this.rotRateX)*0.003;
		if(Math.abs(this.rotRateX) < 0.003){
			this.rotRateX = 0;
		}
	}
	this.doRotate(this.rotRateX, [1,0,0]);



	//object behavior every tick goes here


	if(Input[81]){
		this.doRotate(-0.02, [0,0,1]);
	}
	if(Input[69]){
		this.doRotate(0.02, [0,0,1]);
	}

	var dir = vec3.fromValues(0,0.2,0);
	vec3.transformMat4(dir,dir,this.rotate);

	if(Input[32]){
		if(this.spd < 1.1){
			this.spd += 0.02;
		}
	}
	else{
		this.spd -= Math.sign(this.spd)*0.005;
	}
	vec3.scale(dir,dir,this.spd);
	this.doTranslate(dir);

	this.history.push(this.getMatrixGlobal());
}


function Ghost(label, path){
	VisibleObject.call(this, label);

	mExample = new Model("mExample");
	mExample.openUrl('./assets/human.obj', 'obj');
	//mExample.center();
	this.model = mExample;
	this.texture = makeTextureFromColor(gl,[0,0,255,255]);

	//this.direction = [1.0,1.0,1.0];

	this.aabb.minInit = [-1,1,-1];
	this.aabb.maxInit = [1,1,1];

	this.doRotate(-90*Math.PI/180, [1,0,0]);
	this.doRotate(Math.PI, [0,1,0]);

	this.matrix = mat4.create();
	//mat4.identity(this.matrix);

	this.path = path;
	console.log(this.path);
	this.step = 0;
}
Ghost.prototype = Object.create(VisibleObject.prototype);
Ghost.prototype.onTick = function(){
	VisibleObject.prototype.onTick.call(this);
		if(this.path[this.step]){
			//mat4.mul(this.matrix, this.path[this.step], this.matrix);
			this.matrix = this.path[this.step];
			this.step++;
		}

}
Ghost.prototype.getMatrixGlobal = function(){
	return this.matrix;
}

function Avioncl(label){
	VisibleObject.call(this, label);

	//write any initialization code here, or do it in main.js
	//a global gl context object "gl" is taken for granted - bad practice
	mExample = new Model("mExample");
	mExample.openUrl('./assets/avioncl.obj', 'obj');
	//mExample.center();
	this.model = mExample;
	//this.texture = initTexture(gl, './assets/kocka.png');
	//this.doRotate(Math.PI,[0,1,0]);
	this.doScale([0.2,0.2,0.2]);
	console.log(this);


	this.minHitrost = 1;
	this.maxHitrost = 7;
	this.hitrost = this.minHitrost;
	this.krila = [-1,0,0];
	this.trup = [0,0,-1];
	this.normala = [0,1,0];

}

Avioncl.prototype = Object.create(VisibleObject.prototype);
Avioncl.prototype.onTick = function(){
	VisibleObject.prototype.onTick.call(this);

	//object behavior every tick goes here

		//PREMALO SPEEDA
		
		if(this.hitrost<this.minHitrost/1.2){
			if(this.normala[1]>0){
				this.doRotate(this.minHitrost*0.03-(this.hitrost*0.03*(this.normala[1])),[1,0,0]);
			}
			else{
				this.doRotate(this.minHitrost*0.03-(this.hitrost*0.03*(Math.abs(this.normala[1]))),[-1,0,0]);
			}
		}

		//POGON
		if(Input[32]&&this.hitrost<this.maxHitrost){  //space
			this.hitrost*=1.01;
		}
		else if(this.hitrost>this.minHitrost){
			this.hitrost/=1.01;
		}

		// OBNAŠANJE AVIONCLA ZARADI TEŽE
		if(this.trup[1]>0){
			this.hitrost*=1+(this.trup[1]*0.03);
		}
		if(this.trup[1]<0&&this.hitrost>this.minHitrost-1){
			this.hitrost/=1+Math.abs(this.trup[1])*0.01;
		}

		//OBAŠANJE AVIONCLA ZARADI VZGONA
		if(this.krila[1]>0){
			this.doRotate(0.01*this.krila[1],[0,1,0]);
			this.doRotate(0.01*this.krila[1],[-1,0,0]);
		}
		if(this.krila[1]<0){
			this.doRotate(0.01*this.krila[1],[0,1,0]);
			this.doRotate(0.01*this.krila[1],[1,0,0]);
		}

		/*TALE JE KR UREDU. tu je tud OBNAŠANJE ZARAD VZGONA avioncl ne gre tuk dol
		if(this.krila[1]>0){
			this.doRotate(0.02*(1-this.krila[1]),[0,1,0]);
			this.doRotate(0.01*this.krila[1],[-1,0,0]);
		}
		if(this.krila[1]<0){
			this.doRotate(0.02*(-1-this.krila[1]),[0,1,0]);
			this.doRotate(0.01*this.krila[1],[1,0,0]);
		}
		*/

		if(Input[87]){ //W
			this.doRotate(0.02,[1,0,0]);
		}
		if(Input[83]){  //S
			this.doRotate(0.02,[-1,0,0]);
		}
		if(Input[65]){  //A
			this.doRotate(0.03,[0,0,-1]);
		}
		if(Input[68]){   //D
			this.doRotate(0.03,[0,0,1]);
		}

		this.krila = [-1,0,0];
		this.trup = [0,0,-1];
		this.normala = [0,1,0];
		var pogon = vec3.fromValues(0,0,0.1);
		vec3.transformMat4(pogon,pogon,this.rotate);
		vec3.transformMat4(this.krila,this.krila,this.rotate);
		vec3.transformMat4(this.trup,this.trup,this.rotate);
		vec3.transformMat4(this.normala,this.normala,this.rotate);
		vec3.scale(pogon,pogon,this.hitrost);
		this.doTranslate(pogon);
	
}


function TerrainObject(label){
	VisibleObject.call(this, label);

	mTerrain = new Model("mTerrain");
	mTerrain.openUrl('./assets/terrain1.obj', 'obj');
	this.model = mTerrain;

	this.texture = initTexture(gl, './assets/sand.jpg');

	this.verts = null;
}
TerrainObject.prototype = Object.create(VisibleObject.prototype);
TerrainObject.prototype.generateHeightMap = function(){
	
}