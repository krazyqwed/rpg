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

shaders['lightmap_frag'] = `
varying vec2 vFilterCoord;
varying vec2 vTextureCoord;

uniform vec2 scale;

uniform sampler2D uSampler;
uniform sampler2D mapSampler;

uniform vec4 filterClamp;

void main(void)
{
  vec4 diffuse = texture2D(uSampler, vTextureCoord);
  vec4 map = texture2D(mapSampler, vFilterCoord);

  diffuse.r *= map.r + 0.3;
  diffuse.g *= map.g + 0.3;
  diffuse.b *= map.b + 0.3;

  gl_FragColor = diffuse;
}
`;

export default shaders;
