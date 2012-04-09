function Renderer(attachTo, width, height) {
  $(attachTo).width(width);
  this.canvasElem_ = $('<canvas />')
      .attr('width', width)
      .attr('height', height)
      .appendTo(attachTo)
      .get(0);
  this.context_ = this.canvasElem_.getContext('2d');
  this.w_ = this.canvasElem_.width;
  this.h_ = this.canvasElem_.height;
  this.xv_ = 0;
  this.yv_ = 0;
  this.xt_ = undefined;
  this.yt_ = undefined;
  this.xOff_ = 0;
  this.yOff_ = 0;
  this.aabb_ = new geom.AABB(0, 0, this.w_, this.h_);
}

Renderer.prototype.focusOn = function(x, y) {
  this.xt_ = x;
  this.yt_ = y;
};

Renderer.prototype.xOffset = function() {
  return this.xOff_;
};

Renderer.prototype.yOffset = function() {
  return this.yOff_;
};

Renderer.prototype.width = function() {
  return this.w_;
};

Renderer.prototype.height = function() {
  return this.h_;
};

Renderer.prototype.context = function() {
  return this.context_;
};

Renderer.prototype.boxOnScreen = function(aabb) {
  return this.aabb_.overlaps(aabb);
};

Renderer.prototype.pointOnScreen = function(x, y) {
  return this.aabb_.contains(x, y);
};

Renderer.prototype.tick = function() {
  if (this.xt_ == undefined) return;

  var cx = this.xOff_ + this.w_ / 2;
  var ncx = Math.abs(this.xt_ - cx) < this.w_ / 8;
  var ex1d = (this.xt_ - this.w_ / 6) - this.xOff_;
  var ex2d = -(this.xt_ + this.w_ / 6) + (this.xOff_ + this.w_);
  if (ex1d < 0) {
    this.xv_ = ex1d;
  } else if (ex2d < 0) {
    this.xv_ = -ex2d;
  }
  if (ncx) {
    this.xv_ = 0;
  }

  var cy = this.yOff_ + this.h_ / 2;
  var ncy = Math.abs(this.yt_ - cy) < this.h_ / 8;
  var ey1d = (this.yt_ - this.h_ / 6) - this.yOff_;
  var ey2d = -(this.yt_ + this.h_ / 6) + (this.yOff_ + this.h_);
  if (ey1d < 0) {
    this.yv_ = ey1d;
  } else if (ey2d < 0) {
    this.yv_ = -ey2d;
  }
  if (ncy) {
    this.yv_ = 0;
  }

  this.xOff_ += this.xv_;
  this.yOff_ += this.yv_;
  this.xv_ -= sgn(this.xv_) * 0.15
  this.yv_ -= sgn(this.yv_) * 0.15

  this.aabb_.p1.x = this.xOff_;
  this.aabb_.p1.y = this.yOff_;
  this.aabb_.p2.x = this.xOff_ + this.w_;
  this.aabb_.p2.y = this.yOff_ + this.h_;
};

Renderer.prototype.render = function(cb) {
  this.context_.clearRect(0, 0, this.w_, this.h_);
  this.context_.fillStyle = 'rgb(50, 50, 40)';
  this.context_.fillRect(0, 0, this.w_, this.h_);

  this.context_.save();
  this.context_.translate(-Math.round(this.xOff_) + 0.5,
                          -Math.round(this.yOff_) + 0.5);

  cb(this);

  this.context_.restore();
};
