import Engine from '../Engine';
import shaders from '../shaders';

var GAME;

class LightmapFilter extends PIXI.Filter {
  constructor(sprite, scale) {
    super(shaders['lightmap_vert'], shaders['lightmap_frag']);

    var maskMatrix = new PIXI.Matrix();
    sprite.renderable = false;

    this.maskSprite = sprite;
    this.maskMatrix = maskMatrix;

    this.uniforms.mapSampler = sprite.texture;
    this.uniforms.filterMatrix = maskMatrix.toArray(true);
    this.uniforms.scale = { x: 1, y: 1 };

    if (scale === null || scale === undefined)
    {
        scale = 20;
    }

    this.scale = new PIXI.Point(scale, scale);
  }

  apply(filterManager, input, output) {
    var ratio =  (1 / output.destinationFrame.width) * (output.size.width / input.size.width);

    this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, this.maskSprite);
    this.uniforms.scale.x = this.scale.x * ratio;
    this.uniforms.scale.y = this.scale.y * ratio;

    filterManager.applyFilter(this, input, output);
  }

  get map() {
    return this.uniforms.mapSampler.value;
  }

  set map(value) {
    this.uniforms.mapSampler.value = value;
  }
}

PIXI.filters.LightmapFilter = LightmapFilter;

class Light extends Engine {
  constructor(Game) {
    super();
    GAME = Game;

    this.NAME = 'Light';

    this.lightLoader;
    this.lights = [
      'light_fire_small',
      'light_fire_medium',
      'light_fire_medium_yellow',
      'light_fire_down_small_yellow'
    ];
    this.textures = {};
  }

  load() {
    super.load();

    var p = new promise.Promise();

    this.lightLoader = new PIXI.loaders.Loader();

    for (var i in this.lights) {
      this.lightLoader.add(this.lights[i], 'resources/tilesets/' + this.lights[i] + '.png');
    }

    this.lightLoader.load((loader, res) => {
      for (var i in this.lights) {
        this.textures[this.lights[i]] = res[this.lights[i]];
      }

      p.done();
    });

    return p;
  }

  add(sprite, scale) {
    return new LightmapFilter(sprite, scale);
  }
}

export default Light;
