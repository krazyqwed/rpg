var shaders = {};

shaders['day_night'] = `
  precision mediump float;

  varying vec2 vTextureCoord;

  uniform sampler2D uSampler;

  void main(void)
  {
    vec2 uvs = vTextureCoord.xy;

    vec4 fg = texture2D(uSampler, vTextureCoord);

    //fg.r *= 0.05;
    //fg.g *= 0.05;
    //fg.b *= 0.6;

    gl_FragColor = fg;
  }
`;

shaders['lightmap_vert'] = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform mat3 filterMatrix;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;

void main(void) {
  gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
  vFilterCoord = (filterMatrix * vec3( aTextureCoord, 1.0)).xy;
  vTextureCoord = aTextureCoord;
}
`;

shaders['lightmap_frag'] = `
varying vec2 vFilterCoord;
varying vec2 vTextureCoord;

uniform vec4 daylight;

uniform sampler2D uSampler;
uniform sampler2D mapSampler;

void main(void) {
  vec4 diffuse = texture2D(uSampler, vTextureCoord);
  vec4 map = texture2D(mapSampler, vFilterCoord);

  diffuse.r *= max(daylight.a, map.a) * max(daylight.a, map.r);
  diffuse.g *= max(daylight.a, map.a) * max(daylight.a, map.g);
  diffuse.b *= max(daylight.a, map.a) * max(daylight.a, map.b);

  gl_FragColor = diffuse;
}
`;

export default shaders;
