// +----------------------------------------------------------------------------
// | Sprite
function Sprite(src, opt_w) {
  this.img_ = new Image();
  this.src_ = src;
  this.w_ = opt_w || 0;
  this.h_ = 0;
  this.loaded_ = false;
};

// Render flags.
Sprite.RENDER_FLIPPED = 1 << 1;

Sprite.prototype.w = function() { return this.w_; }
Sprite.prototype.h = function() { return this.h_; }

Sprite.prototype.load = function(onload) {
  this.img_.onload = bind(this, this.onload_, onload);
  this.img_.src = this.src_;
};

Sprite.prototype.onload_ = function(onload) {
  this.loaded_ = true;
  if (this.w_ <= 0) {
    this.w_ = this.img_.width;
  }
  if (this.h_ <= 0) {
    this.h_ = this.img_.height;
  }
  onload();
};

Sprite.prototype.renderFrame = function(renderer, frame, x, y, flags) {
  var ctx = renderer.context();
  var rx = x;
  var ry = y;
  if (flags & Sprite.RENDER_FLIPPED) {
    rx = -rx;
    rx -= this.w_;
    ctx.scale(-1, 1);
  }
  ctx.drawImage(this.img_,
                this.w_ * frame, 0, this.w_, this.h_,
                rx, ry, this.w_, this.h_);
  if (flags & Sprite.RENDER_FLIPPED) {
    ctx.scale(-1, 1);
  }
};

Sprite.prototype.render = function(renderer, x, y, flags) {
  this.renderFrame(renderer, 0, x, y);
};

// +----------------------------------------------------------------------------
// | Sound
function Sound(src) {
  this.snd_ = new Audio(src);
};

Sound.prototype.load = function(onload) {
  this.snd_.load();
  onload();
};

Sound.prototype.play = function() {
  if (window.chrome) {
    this.snd_.load();
  }
  this.snd_.play();
};

// +----------------------------------------------------------------------------
// | ImgLoader
function ImgLoader() {
  this.loads_ = 0;
  this.done_ = 0;
  this.allLoaded_ = function() {};
};

ImgLoader.prototype.load = function(sprite) {
  this.loads_ += 1;
  sprite.load(bind(this, this.oneLoaded_));
};

ImgLoader.prototype.whenDone = function(fn) {
  this.allLoaded_ = fn;
  if (this.done_ == this.loads_ && this.loads_) {
    fn();
  }
};

ImgLoader.prototype.oneLoaded_ = function(img, src) {
  this.done_++;
  if (this.done_ == this.loads_) {
    this.allLoaded_();
  }
};

