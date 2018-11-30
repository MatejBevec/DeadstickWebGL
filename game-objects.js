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

	var dir = vec3.fromValues(0,0.2,0);
	vec3.transformMat4(dir,dir,this.rotate);

	if(Input[32]){
		this.doTranslate(dir);
	}
}

//write new game objects here

//to copy an object call clone(src), don't use new ...
function Avioncl(label){
	VisibleObject.call(this, label);

	//write any initialization code here, or do it in main.js
	//a global gl context object "gl" is taken for granted - bad practice
	mExample = new Model("mExample");
	mExample.openUrl('./assets/avioncl.obj', 'obj');
	//mExample.center();
	this.model = mExample;
	//this.texture = initTexture(gl, './assets/kocka.png');
	this.doRotate(Math.PI,[0,1,0]);
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
		/*
		if(this.hitrost<this.minHitrost){
			if(this.normala[1]>0){
				this.doRotate(0.06-(this.hitrost*0.03),[1,0,0]);
			}
			else{
				this.doRotate(0.06-(this.hitrost*0.03),[-1,0,0]);
			}
		}*/

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