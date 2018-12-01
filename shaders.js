
const shader1 = {

	v : `

	attribute vec4 aVertexPos;
	attribute vec3 aVertexNorm;
	attribute vec2 aUVCoord;
	uniform mat4 uModelViewMat;
	uniform mat4 uProjectionMat;
	uniform mat4 uNormalMat;

	varying highp vec2 vUVCoord;
	varying highp vec3 vLighting;
	varying highp vec3 vFog;

	void main(){
		gl_Position  = uProjectionMat* uModelViewMat * aVertexPos;
		vUVCoord = aUVCoord;

		//lighting
		highp vec3 ambientLight = vec3(0.2, 0.2, 0.2);
		highp vec3 directionalColor = vec3(1,1,1);
		highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

		highp vec4 tranformedNorm = uNormalMat * vec4(aVertexNorm, 1.0);
		highp float directional = 1.2 * max(dot(tranformedNorm.xyz, directionalVector), 0.0);
		vLighting = ambientLight + (directionalColor * directional);

		//fog
		highp vec3 fogColor = vec3(0.6,0.6,1.0);
		highp float distanceFromCamera = length(uModelViewMat * aVertexPos);
		highp float fogPercent = clamp((200.0 - distanceFromCamera) / (200.0 - 40.0), 0.0, 1.0);
		vFog = fogPercent * fogColor;


	}

	`,

	f : `
	
	varying highp vec2 vUVCoord;
	varying highp vec3 vLighting;
	varying highp vec3 vFog;

	uniform sampler2D uSampler;

	void main(){
		highp vec4 texelColor = texture2D(uSampler, vUVCoord);
		highp vec3 surfaceColor = texelColor.rgb * vLighting;
		highp vec3 fogColor = vec3(0.3,0.6,1.0);
		gl_FragColor = vec4(surfaceColor, texelColor.a);
		//gl_FragColor = vec4(mix(fogColor, surfaceColor, vFog), texelColor.a);
		//gl_FragColor = texelColor;
		//gl_FragColor = vec4(1.0,1.0,1.0,1.0);
	}

	`,

	info: function(gl, sProgram){
		//program: sProgram,
		return {
			program: sProgram,

		attLocations: {
			vertexPos: gl.getAttribLocation(sProgram, 'aVertexPos'),
			vertexNorm: gl.getAttribLocation(sProgram, 'aVertexNorm'),
			uvCoord: gl.getAttribLocation(sProgram, 'aUVCoord'),
		},
		uniLocations: {
			projectionMat: gl.getUniformLocation(sProgram, 'uProjectionMat'),
			modelViewMat: gl.getUniformLocation(sProgram, 'uModelViewMat'),
			normalMat: gl.getUniformLocation(sProgram, 'uNormalMat'),
			uSampler: gl.getUniformLocation(sProgram, 'uSampler'),
		},
		}
	},

}
