class Keyboard {
  constructor(keyCode) {
    this.key = {
      code: keyCode,
      isDown: false,
      isUp: true,
      press: undefined,
    };

    window.addEventListener('keydown', this._downHandler.bind(this), false);
    window.addEventListener('keyup', this._upHandler.bind(this), false);
  }

  _downHandler(event) {
    if (event.keyCode === this.key.code) {
      event.preventDefault();

      this.key.isDown = true;
      this.key.isUp = false;

      if (this.key.press !== undefined) this.key.press();
    }
  }

  _upHandler(event) {
    if (event.keyCode === this.key.code) {
      event.preventDefault();

      this.key.isDown = false;
      this.key.isUp = true;
    }
  }

  getState() {
    return this.key.isDown ? true : false;
  }

  setPressed(fn) {
    this.key.press = fn;
  }
}

export default Keyboard;
