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

shaders['lightmap'] = `
  precision mediump float;

  varying vec2 vTextureCoord;
  
  uniform sampler2D uSampler;
  uniform sampler2D uLightmap;
  uniform vec2 resolution;
  uniform vec4 ambientColor;

  void main(void)
  {
    vec4 diffuseColor = texture2D(uSampler, vTextureCoord);
    diffuseColor.a = 1.0 - diffuseColor.r;

    diffuseColor.rgb = vec3(0, 0, 0);

    gl_FragColor = diffuseColor * 0.8;
  }
`;

export default shaders;
