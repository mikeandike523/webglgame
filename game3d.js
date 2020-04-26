//https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix
const lightRes = 200;
var pXCell = 0;
var pZCell = 0;

function crossProduct(a, b) {
	return new vec3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
}

function dotProduct(a, b) {
	return a.x * b.x + a.y * b.y;
}

function transposed(m) {
	var result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 4; j++) {
			result[i * 4 + j] = m[j * 4 + i];
		}
	}
	return result;
}

function multMat4sAsArrays(mat1, mat2) {
	var result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	//assume row major for now
	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 4; j++) {
			var resIndex = i * 4 + j;
			var total = 0;
			for (var k = 0; k < 4; k++) {
				mat1Index = i * 4 + k;
				mat2Index = k * 4 + j;

				total = total + mat1[mat1Index] * mat2[mat2Index];
			}
			result[resIndex] = total;
		}
	}
	return result;
}
var keyArray = {};

const Keys = {
	'a': 65,
	's': 83,
	'w': 87,
	'd': 68,
	'left': 37,
	'right': 39,
	'down': 40,
	'up': 38,
	'escape': 27,
	'space': 32
};

function onKeyDown(event) {

	keyArray[event.keyCode] = true;

}

function onKeyUp(event) {

	keyArray[event.keyCode] = false;

}

function isKeyDown(key) {
	return keyArray[key] === true;
}

window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

class material3 {
	sourceCode = "\nfinalColor=vec3(0,0,0);\n";
	uniforms = []
	constructor(sourceCode, colorAssignment, uniforms) {
		this.sourceCode = sourceCode;
		this.colorAssignment = colorAssignment;
		if (uniforms !== undefined) {
			this.uniforms = uniforms;
		}
	}
	getFullSource() {

		return `if(vColor.x==${this.colorAssignment.x.toFixed(4)}&&vColor.y==${this.colorAssignment.y.toFixed(4)}&&vColor.z==${this.colorAssignment.z.toFixed(4)}){${this.sourceCode}}\n`;
	}

}
class mazeMesh { //square

	subunitScale = 5;
	lightsData = [];
	quads = []
	height = 5;
	constructor(size, maze, subunitScale, height) { //maze: row major, 1=open, 0=occupied
		this.size = size;
		this.maze = maze;

		if (typeof subunitScale === 'number')
			this.subunitScale = subunitScale;
		if (typeof height === 'number')
			this.height = height;
	}
	queryMaze(i, j, di, dj) {
		var size = this.size;
		if (typeof di !== 'number')
			di = 0;
		if (typeof dj !== 'number')
			dj = 0;

		if (i + di > size - 1 || i + di < 0)
			return 0;
		if (j + dj > size - 1 || j + dj < 0)
			return 0;

		return this.maze[(i + di) * size + (j + dj)];
	}
	build() {
		var size = this.size;
		var subunitScale = this.subunitScale;
		var floor = Math.floor;
		var height = this.height;
		while (this.quads.length > 0)
			this.quads.pop();
		while (this.lightsData.length > 0)
			this.lightsData.pop();
		for (var i = 0; i < size; i++) {
			for (var j = 0; j < size; j++) {


				if (this.queryMaze(i, j) == 0)
					continue;
				var worldOffset = new vec3((j - floor(size / 2)) * subunitScale * 2, 0, (floor(size / 2) - i) * subunitScale * 2);


				var worldXCell = j - floor(size / 2.0);

				var worldZCell = floor(size / 2.0) - i;

				if (Math.abs(worldXCell - pXCell) <= 3 && Math.abs(worldZCell - pZCell) <= 3) {
					if (this.queryMaze(i, j, -1, 0) == 0)
						this.quads.push(new quad3(new vec3(-subunitScale, height, subunitScale).translate(worldOffset), new vec3(subunitScale, height, subunitScale).translate(worldOffset), new vec3(subunitScale, 0, subunitScale).translate(worldOffset), new vec3(-subunitScale, 0, subunitScale).translate(worldOffset), new vec3(1, 0, 1)));

					if (this.queryMaze(i, j, 1, 0) == 0)
						this.quads.push(new quad3(new vec3(-subunitScale, height, -subunitScale).translate(worldOffset), new vec3(subunitScale, height, -subunitScale).translate(worldOffset), new vec3(subunitScale, 0, -subunitScale).translate(worldOffset), new vec3(-subunitScale, 0, -subunitScale).translate(worldOffset), new vec3(1, 0, 1)));

					if (this.queryMaze(i, j, 0, 1) == 0)
						this.quads.push(new quad3(new vec3(subunitScale, height, -subunitScale).translate(worldOffset), new vec3(subunitScale, height, subunitScale).translate(worldOffset), new vec3(subunitScale, 0, subunitScale).translate(worldOffset), new vec3(subunitScale, 0, -subunitScale).translate(worldOffset), new vec3(1, 0, 1)));

					if (this.queryMaze(i, j, 0, -1) == 0)
						this.quads.push(new quad3(new vec3(-subunitScale, height, -subunitScale).translate(worldOffset), new vec3(-subunitScale, height, subunitScale).translate(worldOffset), new vec3(-subunitScale, 0, subunitScale).translate(worldOffset), new vec3(-subunitScale, 0, -subunitScale).translate(worldOffset), new vec3(1, 0, 1)));


					this.quads.push(new quad3(new vec3(-subunitScale, 0, subunitScale).translate(worldOffset), new vec3(subunitScale, 0, subunitScale).translate(worldOffset), new vec3(subunitScale, 0, -subunitScale).translate(worldOffset), new vec3(-subunitScale, 0, -subunitScale).translate(worldOffset), new vec3(1, 0.5, 0.5)));

					//1,0.,0.5 
					//this.quads.push(new quad3(new vec3(-subunitScale,height,subunitScale).translate(worldOffset),new vec3(subunitScale,height,subunitScale).translate(worldOffset),new vec3(subunitScale,height,-subunitScale).translate(worldOffset),new vec3(-subunitScale,height,-subunitScale).translate(worldOffset),new vec3(1,0,0.5 )));

					this.lightsData.push(...new vec3(0, 2.5, 0).translate(worldOffset).toArray());
				} else if (Math.abs(worldXCell - pXCell) <= 7 && Math.abs(worldZCell - pZCell) <= 7) {
					this.lightsData.push(...new vec3(0, 2.5, 0).translate(worldOffset).toArray());
				}


			}
		}

		//1,0.5,0.5


	}
	addSelfToWorld(w) {
		this.quads.forEach((q) => w.addQuad(q))
	}
	lightSelf(lightsLocation, numLightsLocation) {
		gl.useProgram(shaderProgram)

		gl.uniform3fv(lightsLocation, new Float32Array(this.lightsData));
		gl.uniform1i(numLightsLocation, Math.floor(this.lightsData.length / 3.));
	}
}



function loadDebugQuad(gl, vertex_buffer, color_buffer, index_buffer) {


    

        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,0.001,1,1,0.001,1,-1,0.001,-1,-1,0.001]), gl.STATIC_DRAW);

        // Create and store data into color buffer

        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,0,0,0,0,0,0,0,0,0,0]), gl.STATIC_DRAW);

        // Create and store data into index buffer

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,2,3,0]), gl.STATIC_DRAW)

    
}
function drawDebugQuad(gl){
	gl.useProgram(debugProgram)
	gl.viewport(0.0, 0.0, canvas.width, canvas.height);
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}


 


class world {
    fragCode = ``;
	uniformSource = ''
	uniformsUsed = []
	materialSource = ""
	vertOrder = [0, 1, 2, 2, 3, 0]
	quads = []
	vertices = []
	colors = []
	indices = []
	materials = []
	shadowedlight = null;
	setShadowedLight(shadowedlight) {
		this.shadowedlight = shadowedlight;
	}
	reloadGeometry(gl, vertex_buffer, color_buffer, index_buffer) {


		this.buildGeometry();

		gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

		// Create and store data into color buffer

		gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);

		// Create and store data into index buffer

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
	}
	clearGeometry() {
		while (this.vertices.length > 0)
			this.vertices.pop();
		while (this.colors.length > 0)
			this.colors.pop();
		while (this.indices.length > 0)
			this.indices.pop();
		while (this.quads.length > 0)
			this.quads.pop();
	}
	clear() {
		while (this.vertices.length > 0)
			this.vertices.pop();
		while (this.colors.length > 0)
			this.colors.pop();
		while (this.indices.length > 0)
			this.indices.pop();
		while (this.uniformsUsed.length > 0)
			this.uniformsUsed.pop();
		while (this.quads.length > 0)
			this.quads.pop();
		this.fragCode = ``;
		this.materialSource = '';
		this.uniformSource = '';
	}
	addQuad(quad) {
		this.quads.push(quad);
	}
	addMaterial(material) {
		this.materials.push(material)
	}
	buildGeometry() {
		for (var i = 0; i < this.quads.length; i++) {
			var quad = this.quads[i];

			quad.a.insertSelf(this.vertices);
			quad.color.insertSelf(this.colors);

			quad.b.insertSelf(this.vertices);
			quad.color.insertSelf(this.colors);

			quad.c.insertSelf(this.vertices);
			quad.color.insertSelf(this.colors);

			quad.d.insertSelf(this.vertices);
			quad.color.insertSelf(this.colors);


		}

		for (var i = 0; i < this.quads.length; i++) {
			this.vertOrder.forEach((subIndex) => this.indices.push(i * 4 + subIndex))
		}
		if (this.shadowedlight !== null)
			this.shadowedlight.setNumIndicies(this.indices.length);
	}
	build() {
		while (this.vertices.length > 0)
			this.vertices.pop();
		while (this.colors.length > 0)
			this.colors.pop();
		while (this.indices.length > 0)
			this.indices.pop();
		while (this.uniformsUsed.length > 0)
			this.uniformsUsed.pop();
		this.fragCode = ``;
		this.materialSource = '';
		this.uniformSource = '';
		var uniformString = '';
		this.materials.forEach((material) => {

			material.uniforms.forEach((uniform) => {

				if (!this.uniformsUsed.includes(uniform.name)) {
					this.uniformSource += `\nuniform ${uniform.type} ${uniform.name};\n`;
					this.uniformsUsed.push(uniform.name)
				}
			})

		})

		this.materials.forEach((material) => {
			this.materialSource += material.getFullSource()
		})

		this.buildGeometry()
		this.fragCode = `precision mediump float;
            varying vec3 vColor;
			varying vec3 trueWorldPos;
		
			varying vec4 variedPosition;
            uniform sampler2D fbTex;
            uniform vec3 playerVec;
			uniform float gameTime;
			uniform float bias;
			uniform mat4 lightPmatrix;
			uniform mat4 lightVmatrix;

			${this.uniformSource}
            void main(void) {
				vec4 lightClipPos= lightPmatrix*lightVmatrix*vec4(trueWorldPos, 1.);
				vec3 lightTexPos=lightClipPos.xyz/lightClipPos.w;
	
			//	lightTexPos.z=lightTexPos.z;
			

				vec2 texVec=vec2(lightTexPos.x/2.+0.5,0.5+lightTexPos.y/2.);
				int isInLightFrustum =1;
				//for now, hard coded near plane of 1.
				if (length(lightTexPos.xy)>1.||lightTexPos.z>1.)
					isInLightFrustum=0;


                vec3 finalColor=vColor;
                ${this.materialSource}
               gl_FragColor = vec4(finalColor, 1.);
            }`;

	}
	getVertices() {
		return this.vertices;
	}
	getColors() {
		return this.colors;
	}
	getIndices() {
		return this.indices;
	}
	getFragCode() {
		return this.fragCode;
	}

}

class quad3 {

	a = new vec3();
	b = new vec3();
	c = new vec3();
	d = new vec3();
	color = new vec3(1, 0, 0);

	constructor(a, b, c, d, color) {
		if (a instanceof vec3)
			this.a = a;
		if (b instanceof vec3)
			this.b = b;
		if (c instanceof vec3)
			this.c = c;
		if (d instanceof vec3)
			this.d = d;
		if (color instanceof vec3)
			this.color = color;
	}

	copy() {
		return new quad3(this.a.copy(), this.b.copy(), this.c.copy(), this.d.copy());
	}

	getNormal() {
		return crossProduct(this.d.getDifference(this.a), this.b.getDifference(this.a)).getDirection();
	}

}

class vec3 {
	x = 0;
	y = 0;
	z = 0;
	constructor(x, y, z) {
		if (typeof x === 'number')
			this.x = x;
		if (typeof y === 'number')
			this.y = y;
		if (typeof z === 'number')
			this.z = z;
	}

	copy() {
		return new vec3(this.x, this.y, this.z);
	}
	translate(delta) {
		this.x += delta.x;
		this.y += delta.y;
		this.z += delta.z;
		return this;
	}
	scale(scaleFactor) {
		this.x *= scaleFactor;
		this.y *= scaleFactor;
		this.z *= scaleFactor;
		return this;
	}


	getMagnitude() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
	}

	getDifference(origin) {
		return new vec3(this.x - origin.x, this.y - origin.y, this.z - origin.z);
	}

	getDirection() {
		var magnitude = this.getMagnitude();
		return new vec3(this.x / magnitude, this.y / magnitude, this.z / magnitude);
	}

	getAngle(b) {
		return Math.acos(dotProduct(this, b) / (this.getMagnitude() * b.getMagnitude()));
	}

	insertSelf(arr) {
		arr.push(this.x);
		arr.push(this.y);
		arr.push(this.z);
	}
	ebem(v) {
		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;
		return this;
	}
	toArray() {
		return [this.x, this.y, this.z];
	}

	swizzle(seq) {
		var coords = [];
		for (var i = 0; i < 3; i++) {
			switch (seq[i]) {
				case 'x':
					coords.push(this.x);
					break;
				case 'y':
					coords.push(this.y);
					break;
				case 'z':
					coords.push(this.z);
					break;
			}
		}
		return new vec3().fromArray(coords);
	}
	fromArray(coords) {
		this.x = coords[0];
		this.y = coords[1];
		this.z = coords[2];
		return this;
	}
	getVectorProjection(base) {
		var baseDirection = base.getDirection();
		var comp = dotProduct(base, this) / base.getMagnitude();
		return baseDirection().copy().scale(comp);
	}
	

}

//use x and z from vec3
class segment2{
	constructor(a,b){
		this.a=a.copy();
		this.b=b.copy();
		this.length=b.getDifference(a).getMagnitude()
		this.tangential=b.getDifference(a).getDirection()
		this.normal=new vec3(this.tangential.z,-this.tangential.x)
	}
	copy(){
		return new segment3(this.a.copy(),this.b.copy());
	}
}

function intersectXZ(){

}

gameWorld = new world();
var sector1;

function loadGame() {

	//forgot the perspective divide!!!!!

	//for now, use a hardcoded subunit of 5
	var materialSource = `
   float lightScale=0.;
   for(int i=0;i<49;i++){
      if(i<numLights){
      vec3 lightPos = lights[i];
      lightScale=lightScale+0.8*clamp(1.-length(trueWorldPos-lightPos)/6.8,0.,1.);
      }
   }
   float tiling=2.;
   float squareVal=mod(floor(mod(trueWorldPos.x,1.)*tiling)+floor(mod(trueWorldPos.y,1.)*tiling)+floor(mod(trueWorldPos.z,1.)*tiling),2.)<0.001?1.:0.;

 
 
   float lightVal=1.-length(trueWorldPos-playerVec)/drawDistance;
   finalColor=squareVal*lightVal*lightScale*vec3(1.,0.,0.);


   if(isInLightFrustum==1)
  
	{
		
		float dVal=texture2D(fbTex,texVec).x;
		if(lightTexPos.z<dVal+bias){
			finalColor=finalColor+2.*(1.-lightTexPos.z)*vec3(1.,1.,1.);
		}
		
	}

	finalColor=lightVal*vec3(clamp(finalColor.x,0.,1.),clamp(finalColor.y,0.,1.),clamp(finalColor.z,0.,1.));



   `;


	var material = new material3(materialSource, new vec3(1, 0, 1), [{
		type: 'float',
		name: 'drawDistance'
	}, {
		type: "vec3",
		name: 'lights[49]'
	}, {
		type: 'int',
		name: 'numLights'
	}]);

	var material2 = new material3(materialSource, new vec3(1, 0, 0.5), [{
		type: 'float',
		name: 'drawDistance'
	}, {
		type: "vec3",
		name: 'lights[49]'
	}, {
		type: 'int',
		name: 'numLights'
	}]);

	var myMaterial3 = new material3(materialSource, new vec3(1, 0.5, 0.5), [{
		type: 'float',
		name: 'drawDistance'
	}, {
		type: "vec3",
		name: 'lights[49]'
	}, {
		type: 'int',
		name: 'numLights'
	}]);


	gameWorld.addMaterial(material);
	gameWorld.addMaterial(material2);
	gameWorld.addMaterial(myMaterial3);
	/*for(var i=-7;i<7;i++){
	   for(var j=-7;j<7;j++){
	      gameWorld.addQuad(new quad3(new vec3(i*2-1,0,j*2+1),new vec3(i*2+1,0,j*2+1),new vec3(i*2+1,0,j*2-1), new vec3(i*2-1,0,j*2-1),new vec3(1,0,1)));
	   }
	}
	gameWorld.addQuad(new quad3(new vec3(0,3,-5),new vec3(0,3,5),new vec3(0,0,5),new vec3(0,0,-5),new vec3(1,0,1)));
	gameWorld.addQuad(new quad3(new vec3(-5,3,0),new vec3(5,3,0),new vec3(5,0,0),new vec3(-5,0,0),new vec3(1,0,1)));*/
	sector1 = new mazeMesh(7, [

		1, 1, 1, 1, 1, 1, 0,
		1, 0, 1, 0, 1, 1, 1,
		1, 0, 1, 1, 0, 0, 1,
		0, 0, 1, 1, 1, 0, 0,
		1, 1, 1, 1, 0, 1, 0,
		1, 0, 1, 0, 1, 1, 1,
		1, 1, 1, 1, 1, 0, 0

	]);
	sector1.build();
	sector1.addSelfToWorld(gameWorld);
	gameWorld.build();
	document.getElementsByTagName("body")[0].innerHtml = "done loading.";
}
document.getElementsByTagName("body")[0].innerHtml = "loading...";
loadGame();


/*============= Creating a canvas =================*/
var canvas = document.getElementById('my_Canvas');
gl = canvas.getContext('experimental-webgl');


/*============ Defining and storing the geometry =========*/

var vertices = gameWorld.getVertices();

var colors = gameWorld.getColors();

var indices = gameWorld.getIndices();

// Create and store data into vertex buffer
var vertex_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

// Create and store data into color buffer
var color_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

// Create and store data into index buffer
var index_buffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

/*=================== Shaders =========================*/


function getProgram(vertCode,fragCode){

	var vertShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertShader, vertCode);
	gl.compileShader(vertShader);
	var message = gl.getShaderInfoLog(vertShader);
	if (message.length > 0) {
		/* message may be an error or a warning */
		throw message;
	}
	var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragShader, fragCode);
	gl.compileShader(fragShader);
	console.log("fslog")
	var message = gl.getShaderInfoLog(fragShader);
	if (message.length > 0) {
		/* message may be an error or a warning */
		throw message;
	}
	
	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertShader);
	gl.attachShader(shaderProgram, fragShader);
	gl.linkProgram(shaderProgram);
	return shaderProgram;
	
	
}


var vertCode = `attribute vec3 position;
            uniform mat4 Pmatrix;
            uniform mat4 Vmatrix;
            uniform mat4 Mmatrix;
		
          
            attribute vec3 color;
            varying vec3 vColor;
		
			varying vec3 trueWorldPos;
			varying vec4 variedPosition;

            void main(void) { 
               gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);
		
			   trueWorldPos=(Mmatrix*vec4(position, 1.)).xyz;
			   variedPosition=Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);
           

               vColor = color;
            }`;


var fragCode = gameWorld.getFragCode();
var lightingProgram = getProgram(vertCode,`
			precision highp float;
			varying vec4 variedPosition;
	void main(void){
				
				float theDepth=0.;
				theDepth=variedPosition.z/variedPosition.w;
				gl_FragColor=vec4(vec3(theDepth),1.);
			}
`);
var shaderProgram=getProgram(vertCode,fragCode);
var debugProgram=getProgram(`attribute vec3 position;attribute vec3 color;
void main(void){gl_Position=vec4(position,1.);}`,`uniform sampler2D fbTex; void main(void){gl_FragColor=texture2D(fbTex,vec2(gl_FragCoord.x/570.,gl_FragCoord.y/570.));}`)


gl.useProgram(lightingProgram);
var LPmatrix = gl.getUniformLocation(lightingProgram, "Pmatrix");
var LVmatrix = gl.getUniformLocation(lightingProgram, "Vmatrix");
var LMmatrix = gl.getUniformLocation(lightingProgram, "Mmatrix");
var LgameTime = gl.getUniformLocation(lightingProgram, "gameTime");


gl.useProgram(shaderProgram);
/* ====== Associating attributes to vertex shader =====*/
var Pmatrix = gl.getUniformLocation(shaderProgram, "Pmatrix");
var Vmatrix = gl.getUniformLocation(shaderProgram, "Vmatrix");
var Mmatrix = gl.getUniformLocation(shaderProgram, "Mmatrix");
var gameTime = gl.getUniformLocation(shaderProgram, "gameTime");
var bias = gl.getUniformLocation(shaderProgram,"bias");
var lightVmatrix = gl.getUniformLocation(shaderProgram,"lightVmatrix");
var lightPmatrix=gl.getUniformLocation(shaderProgram,"lightPmatrix")

//set the bias
gl.uniform1f(bias,0.005);


//  gl.uniform1i(unshaded,1);
var pVec = gl.getUniformLocation(shaderProgram, "playerVec");


var dD = gl.getUniformLocation(shaderProgram, 'drawDistance');
var lights = gl.getUniformLocation(shaderProgram, 'lights');
var numLights = gl.getUniformLocation(shaderProgram, 'numLights');

console.log(lights)


gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
var position = gl.getAttribLocation(shaderProgram, "position");
gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);

// Position
gl.enableVertexAttribArray(position);

gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
var color = gl.getAttribLocation(shaderProgram, "color");
gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);

// Color
gl.enableVertexAttribArray(color);

sector1.lightSelf(lights, numLights);

/*==================== MATRIX =====================*/

function get_projection(angle, a, zMin, zMax) {
	var ang = Math.tan((angle * .5) * Math.PI / 180); //angle*.5
	return [
		0.5 / ang, 0, 0, 0,
		0, 0.5 * a / ang, 0, 0,
		0, 0, -(zMax + zMin) / (zMax - zMin), -1,
		0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0
	];
}

var proj_matrix = get_projection(40, canvas.width / canvas.height, 1, 100);

var mov_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

var playerAngle = 0; // yaw angle made with z axis (xz plane), positive is towards the right


var playerPitch = 0; //pitch angle made with z axis (zy plane), positive is up
var playerVec = new vec3(0, 2, 0);


function cellChanged(newpXCell, newpZCell) {

	pXCell = newpXCell;
	pZCell = newpZCell;
	sector1.build();
	gameWorld.clearGeometry();
	sector1.addSelfToWorld(gameWorld);
	gameWorld.reloadGeometry(gl, vertex_buffer, color_buffer, index_buffer);
	sector1.lightSelf(lights, numLights);
}


/*==================== Rotation ====================*/


function scaled(m,s){
	var tMatrix = transposed([s.x, 0, 0,0, 0, s.y, 0,0, 0, 0, s.z, 0, 0, 0, 0, 1]);
	var result = multMat4sAsArrays(tMatrix, m);
	return result;
}
function translated(m, delta) {
	var tMatrix = transposed([1, 0, 0, delta.x, 0, 1, 0, delta.y, 0, 0, 1, delta.z, 0, 0, 0, 1]);
	var result = multMat4sAsArrays(tMatrix, m);
	return result;
}

function rotatedY(m, ang) {
	var tMatrix = transposed([
		Math.cos(ang), 0, Math.sin(ang), 0,
		0, 1, 0, 0,
		 -Math.sin(ang), 0, Math.cos(ang), 0,
		0, 0, 0, 1

	]);
	var result = multMat4sAsArrays(tMatrix, m);
	return result;
}

function rotatedX(m, ang) {
	var tMatrix = transposed([
		1, 0, 0, 0,
		0, Math.cos(ang), -Math.sin(ang), 0,
		0, Math.sin(ang), Math.cos(ang), 0,
		0, 0, 0, 1

	]);
	var result = multMat4sAsArrays(tMatrix, m);
	return result;
}


function lookMatrix(position, yaw, pitch) {
	var look_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

	look_matrix = rotatedX(look_matrix, -pitch)
	look_matrix = rotatedY(look_matrix, yaw); //due to way yaw is defined
	look_matrix=scaled(look_matrix,new vec3(1,1,-1))
	
	look_matrix = translated(look_matrix, new vec3(position.x, position.y, position.z).scale(-1));
	return look_matrix;
}

var axisI = new vec3(1, 0, 0);
var axisJ = new vec3(0, 1, 0);
var axisK = new vec3(0, 0, 1);

function lookAtAngles(position1, position2) {
	//function to return two angles based of lookAt point to position
	var delta = position2.getDifference(position1);
	//first, assume right yaw
	var yaw = new vec3(delta.x, 0, delta.z).getAngle(axisK);
	if (delta.x < 0)
		yaw = -yaw;
	//first, assume up pitch
	var pitch = new vec3(0, delta.y, delta.z).getAngle(axisK);
	if (delta.y < 0)
		pitch = -pitch;

	return [yaw, pitch];
}


class actor {
	//send in arguments as an object, can be initialized either with angles or with lookAt point
	yaw = 0;
	pitch = 0;
	constructor(position, yaw, pitch) {
		this.position = position;
		if (typeof yaw === 'number')
			this.yaw = yaw;
		if (typeof pitch === 'number')
			this.pitch = pitch;
	}
	lookAt(lookAtPoint) {
		var angles = lookAtAngles(this.position, lookAtPoint);
		this.yaw = angles[0];
		this.pitch = angles[1];
		return this;
	}
	setPosition(position) {
		this.position = position;
		return this;
	}
	setYaw(yaw) {
		this.yaw = yaw;
		return this;
	}
	setPitch(pitch) {
		this.pitch = pitch;
		return this;
	}
	addYaw(dyaw) {
		this.yaw += dyaw;
		return this;
	}
	addPitch(dpitch) {
		this.pitch += dpitch;
		return this;
	}
}


class shadowedLight extends actor {

	setNumIndicies(numIndices) {
		this.numIndices = numIndices;
	}
	constructor(position, yaw, pitch, resolution, openingAngle, bias) {
		/*
		     uniform mat4 lightVMatrix;
		uniform mat4 lightPMatrix;
		*/
		super(position, yaw, pitch);

		this.resolution = resolution;
		this.openingAngle = openingAngle;
		this.bias = bias;

		this.projectionMatrix=get_projection(this.openingAngle,1,1,100);



		this.targetTexture = gl.createTexture();
		
		gl.bindTexture(gl.TEXTURE_2D, this.targetTexture);

		{
			const targetTextureWidth = lightRes;
			const targetTextureHeight = lightRes;
			// define size and format of level 0
			const level = 0;
			const internalFormat = gl.RGBA;
			const border = 0;
			const format = gl.RGBA;
			const type = gl.UNSIGNED_BYTE;
			var theData = []
			for (var i = 0; i < lightRes*lightRes; i++) {
				theData.push(i % 2 == 0 ? 0 : 255);
				theData.push(i % 2 == 0 ? 0 : 255);
				theData.push(i % 2 == 0 ? 0 : 255);
				theData.push(255);
			}
			const data = new Uint8Array(theData);
			gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
				targetTextureWidth, targetTextureHeight, border,
				format, type, data);

			// set the filtering so we don't need mips
			//is nearest or linear better? dont know, for now use nearest
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
		




		// Create and bind the framebuffer
		this.fb = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
		// attach the texture as the first color attachment
		const attachmentPoint = gl.COLOR_ATTACHMENT0;
		const level = 0;
		gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, this.targetTexture, level);
	

		const targetTextureWidth = lightRes;
			const targetTextureHeight = lightRes;
		const depthBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

		// make a depth buffer and the same size as the targetTexture
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, targetTextureWidth, targetTextureHeight);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);



		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
			throw "framebuffer is not complete";
		}


		gl.bindFramebuffer(gl.FRAMEBUFFER, null);


	}

	bindSelf() {


		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);

	}
	freeSelf() {

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

}


var shadowedLight1 = new shadowedLight(new vec3(0,1,0), Math.PI/10, 0, 570, 30, 0.005)
gameWorld.setShadowedLight(shadowedLight1);
gameWorld.build();

/*================= Drawing ===========================*/
var time_old = 0;

var animate = function (time) {
	var newpXcell = Math.floor((playerVec.x + 5) / 10.0);
	var newpZcell = Math.floor((playerVec.z + 5) / 10.0);
	if (newpXcell != pXCell || newpZcell != pZCell) {
		cellChanged(newpXcell, newpZcell);
	}
	view_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	mov_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	var dt = time - time_old;
	// rotateZ(mov_matrix, dt*0.005);//time
	if (isKeyDown(Keys.left))
		playerAngle -= dt * 0.006;
	if (isKeyDown(Keys.right))
		playerAngle += dt * 0.006;


	if (isKeyDown(Keys.up))
		playerPitch += dt * 0.006;
	if (isKeyDown(Keys.down))
		playerPitch -= dt * 0.006;

	if (playerPitch > Math.PI / 6)
		playerPitch = Math.PI / 6

	if (playerPitch < -Math.PI / 6)
		playerPitch = -Math.PI / 6

	if (!(isKeyDown(Keys.down) || isKeyDown(Keys.up))) {

		if (playerPitch > Math.PI / 40) {
			playerPitch -= dt * 0.006;
			if (playerPitch < 0)
				playerPitch = 0;
		} else if (playerPitch < -Math.PI / 40) {
			playerPitch += dt * 0.006;
			if (playerPitch > 0)
				playerPitch = 0
		} else
			playerPitch = 0;
	}

	if (isKeyDown(Keys.w))
		playerVec.translate(new vec3(dt * 0.01 * Math.cos(-playerAngle+Math.PI/2), 0, dt * 0.01 * Math.sin(-playerAngle+Math.PI/2)))
	if (isKeyDown(Keys.a))
		playerVec.translate(new vec3(-dt * 0.01 * Math.sin(-playerAngle+Math.PI/2), 0, dt * 0.01 * Math.cos(-playerAngle+Math.PI/2)))
	if (isKeyDown(Keys.s))
		playerVec.translate(new vec3(dt * 0.01 * Math.cos(-playerAngle+Math.PI/2), 0, dt * 0.01 * Math.sin(-playerAngle+Math.PI/2)).scale(-1))
	if (isKeyDown(Keys.d))
		playerVec.translate(new vec3(-dt * 0.01 * Math.sin(-playerAngle+Math.PI/2), 0, dt * 0.01 * Math.cos(-playerAngle+Math.PI/2)).scale(-1))

	view_matrix = lookMatrix(playerVec, playerAngle, playerPitch);


	time_old = time;

	
	shadowedLight1.setPosition(playerVec)
	shadowedLight1.setYaw(playerAngle)
	shadowedLight1.setPitch(playerPitch)
	

	let primary_draw = (pass) => {
		if(pass==0){
			shadowedLight1.bindSelf();
			gl.useProgram(lightingProgram);
		}
		if(pass==1){
			gl.useProgram(shaderProgram);
		}
		
		if(pass==1)
		gl.bindTexture(gl.TEXTURE_2D, shadowedLight1.targetTexture);

		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		if(pass==0)
		gl.clearColor(1,1,1,1);
		if(pass==1)
		gl.clearColor(0, 0, 0, 1);
		gl.clearDepth(1.0);
		
		gl.uniformMatrix4fv(pass==1?Pmatrix:LPmatrix, false, pass==1?proj_matrix:shadowedLight1.projectionMatrix);
		gl.uniformMatrix4fv(pass==1?Vmatrix:LVmatrix, false, pass==1?view_matrix:lookMatrix(shadowedLight1.position,shadowedLight1.yaw,shadowedLight1.pitch));
		gl.uniformMatrix4fv(pass==1?Mmatrix:LMmatrix, false, mov_matrix);

		if(pass==1){
			gl.uniformMatrix4fv(lightVmatrix,false,lookMatrix(shadowedLight1.position,shadowedLight1.yaw,shadowedLight1.pitch));
			gl.uniformMatrix4fv(lightPmatrix,false,shadowedLight1.projectionMatrix);
		}
		if(pass==1)
		gl.uniform3fv(pVec, playerVec.toArray());

		gl.uniform1f(pass==1?gameTime:LgameTime, time);

		if(pass==1)
		gl.uniform1f(dD, 30);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

		if(pass==0)
		gl.viewport(0.0,0.0,lightRes,lightRes);
		if(pass==1)
		gl.viewport(0.0, 0.0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
     
	 
        
		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
		
		if(pass==0){
			shadowedLight1.freeSelf();
		}
       
       

	}

	//gameWorld.reloadGeometry(gl, vertex_buffer, color_buffer, index_buffer)
	primary_draw(0);

	//loadDebugQuad(gl,vertex_buffer,color_buffer,index_buffer);
//	drawDebugQuad(gl);

	primary_draw(1);


	window.requestAnimationFrame(animate);
}
animate(0);

