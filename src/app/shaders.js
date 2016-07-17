export var selectiveColor = `
  precision mediump float;

  varying vec2 vTextureCoord;
  varying vec4 vColor;

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
