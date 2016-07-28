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

void main(void)
{
   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
   vFilterCoord = ( filterMatrix * vec3( aTextureCoord, 1.0)  ).xy;
   vTextureCoord = aTextureCoord;
}
`;

shaders['lightmap_frag'] = `
varying vec2 vFilterCoord;
varying vec2 vTextureCoord;

uniform vec2 scale;

uniform sampler2D uSampler;
uniform sampler2D mapSampler;

uniform vec4 filterClamp;

void main(void)
{
   vec4 map =  texture2D(mapSampler, vFilterCoord);

   map -= 0.5;
   map.xy *= scale;

   gl_FragColor = texture2D(uSampler, clamp(vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y), filterClamp.xy, filterClamp.zw));
}
`;

export default shaders;
