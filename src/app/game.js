import World from './components/World';
import Player from './components/Player';
import Camera from './components/Camera';
import options from './options';

const OPTIONS = options;

class Game {
  constructor() {
    this.options = OPTIONS;

    this.engine = {};

    this.stage;
    this.renderer;
    this.loader;
    this.world;
    this.camera;
    this.stats;

    this.engine.world = new World(this);
    this.engine.player = new Player(this);
    this.engine.camera = new Camera(this);

    this.init();
  }

  init() {
    this.engine.world.init();
    this.engine.player.init();
    this.engine.camera.init(new PIXI.Container());
    this.engine.camera.getContainer().scale = {x: 2, y: 2 };

    PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
    this.renderer = new PIXI.WebGLRenderer(this.options.stage.width, this.options.stage.height, { antialias: false, transparent: false, resolution: 1 });

    this.stats = new Stats();
    this.stats.setMode(0);
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '0px';
    this.stats.domElement.style.top = '0px';

    document.body.appendChild(this.renderer.view);
    document.body.appendChild(this.stats.domElement);

    this.load();
  }

  load() {
    this.engine.world.load();
    this.engine.player.load();

    this.update();
  }

  update() {
    this.stats.begin();

    this.engine.world.update();
    this.engine.player.update();
    this.engine.camera.update();

    this.render();

    this.stats.end();
    requestAnimationFrame(this.update.bind(this));
  }

  render() {
    this.engine.world.render();

    this.renderer.render(this.engine.camera.getContainer());
  }
}

var _Game = new Game();
