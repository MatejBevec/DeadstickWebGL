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

	this.doTranslate([1.0,0,0]);
	console.log(this);
}
ExampleObject.prototype = Object.create(VisibleObject.prototype);
ExampleObject.prototype.onTick = function(){
	VisibleObject.prototype.onTick.call(this);

	//object behavior every tick goes here
	this.doRotate(0.03, [0.5,1.0,0.3]);

}

function FlyingBoi(label){
	VisibleObject.call(this, label);

	mExample = new Model("mExample");
	mExample.openUrl('./assets/human.obj', 'obj');
	//mExample.center();
	this.model = mExample;
	this.texture = makeTextureFromColor(gl,[255,0,0,255]);

	this.direction = [1.0,1.0,1.0];

	this.doRotate(-90*Math.PI/180, [1,0,0]);
	this.doRotate(Math.PI, [0,1,0]);
}
FlyingBoi.prototype = Object.create(VisibleObject.prototype);
FlyingBoi.prototype.onTick = function(){
	VisibleObject.prototype.onTick.call(this);

	//object behavior every tick goes here
	if(Input[65]){
		this.doRotate(-0.04, [0,1,0]);
	}
	if(Input[68]){
		this.doRotate(0.04, [0,1,0]);
	}
	if(Input[87]){
		this.doRotate(0.04, [1,0,0]);
	}
	if(Input[83]){
		this.doRotate(-0.04, [1,0,0]);
	}
	if(Input[81]){
		this.doRotate(-0.02, [0,0,1]);
	}
	if(Input[69]){
		this.doRotate(0.02, [0,0,1]);
	}

	var dir = vec3.fromValues(0,0.1,0);
	vec3.transformMat4(dir,dir,this.rotate);

	if(Input[32]){
		this.doTranslate(dir);
	}
}