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
	this.texture = initTexture(gl, './assets/kocka.png');

	this.doTranslate([1.0,0,0]);
	console.log(this);
}
ExampleObject.prototype = Object.create(VisibleObject.prototype);
ExampleObject.prototype.onTick = function(){
	VisibleObject.prototype.onTick.call(this);

	//object behavior every tick goes here
	this.doRotate(0.03, [0.5,1.0,0.3]);
	if(Input[65]){
		this.doTranslate([-0.05,0,0]);
	}
	if(Input[68]){
		this.doTranslate([0.05,0,0]);
	}
	if(Input[87]){
		this.doTranslate([0,0.05,0]);
	}
	if(Input[83]){
		this.doTranslate([0,-0.05,0]);
	}
}