// +----------------------------------------------------------------------------
// | Collider
Collider = function(aabb, vx, vy) {
  this.aabb = aabb;
  this.w_ = aabb.p2.x - aabb.p1.x;
  this.h_ = aabb.p2.y - aabb.p1.y;
  this.vx = vx;
  this.vy = vy;
  this.ox = aabb.p1.x;
  this.oy = aabb.p2.y;
  this.ovx = vx;
  this.ovy = vy;
};

Collider.fromCenter = function(x, y, w, h, vx, vy, mass) {
  var aabb = new geom.AABB(x - w / 2, y - w / 2, w, h);
  return new Collider(aabb, vx, vy, mass);
};

Collider.prototype.x = function() {
  return this.aabb.p1.x;
};

Collider.prototype.y = function() {
  return this.aabb.p1.y;
};

Collider.prototype.cx = function() {
  return (this.aabb.p1.x + this.aabb.p2.x) / 2;
};

Collider.prototype.cy = function() {
  return (this.aabb.p1.y + this.aabb.p2.y) / 2;
};

Collider.prototype.w = function() {
  return this.w_;
};

Collider.prototype.h = function() {
  return this.h_;
};

Collider.prototype.clampVx = function(v) {
  this.vx = Math.min(v, Math.max(-v, this.vx));
};

Collider.prototype.clampVy = function(v) {
  this.vy = Math.min(v, Math.max(-v, this.vy));
};

Collider.COLLIDE_X = 1;
Collider.COLLIDE_Y = 2;

Collider.collideAll_ = function(colliders, t) {
  var irange = new geom.Range();
  var jrange = new geom.Range();
  var tx = new geom.Range();
  var ty = new geom.Range();
  var len = colliders.length;
  var ts = [];
  for (var i = 0; i < len; ++i) {
    ts.push({time: 1, object: null, direction: undefined});
  }
  for (var i = 0; i < len; ++i) {
    for (var j = i + 1; j < len; ++j) {
      var txp = geom.Range.collides(
          colliders[i].aabb.xRange(irange), colliders[i].vx * t,
          colliders[j].aabb.xRange(jrange), colliders[j].vx * t,
          tx);
      var typ = geom.Range.collides(
          colliders[i].aabb.yRange(irange), colliders[i].vy * t,
          colliders[j].aabb.yRange(jrange), colliders[j].vy * t,
          ty);
      if (txp && typ && tx.overlaps(ty)) {
        var start = Math.max(tx.lo, ty.lo);
        var end = Math.min(tx.hi, ty.hi);
        if (start < 1 && end > 0) {
          var dir = tx.lo < ty.lo ?  Collider.COLLIDE_Y : Collider.COLLIDE_X;
          if (start < ts[i].time) {
            ts[i].time = start;
            ts[i].object = colliders[j];
            ts[i].direction = dir;
          }
          if (start < ts[j].time) {
            ts[j].time = start;
            ts[j].object = colliders[i];
            ts[j].direction = dir;
          }
        }
      }
    }
  }
  return ts;
};

Collider.stepAll = function(colliders, t) {
  var ts = Collider.collideAll_(colliders, t);
  var tsLen = ts.length;
  for (var i = 0; i < tsLen; ++i) {
    var collider = colliders[i];
    var collideStruct = ts[i];
    var other = collideStruct.object;
    // Overlapping - push out.
    if (collideStruct.time < 0) {
      // Could max the xp/yp so things don't jump as much.
      var xp = (Math.min(collider.aabb.p2.x, other.aabb.p2.x) -
                Math.max(collider.aabb.p1.x, other.aabb.p1.x));
      var yp = (Math.min(collider.aabb.p2.y, other.aabb.p2.y) -
                Math.max(collider.aabb.p1.y, other.aabb.p1.y));
      var xMult = collider.aabb.p1.x < other.aabb.p1.x ? -1 : 1;
      var yMult = collider.aabb.p1.y < other.aabb.p1.y ? -1 : 1;
      collider.aabb.addXY(xMult * xp / 2, yMult * yp / 2);
      other.aabb.addXY(xMult * xp / -2, yMult * yp / -2);
    }
    var it = Math.min(1, Math.max(0, ts[i].time));
    if (collideStruct.direction == Collider.COLLIDE_X) {
      collider.vx *= -0.8;
    } else if (collideStruct.direction == Collider.COLLIDE_Y) {
      collider.vy *= -0.8;
    }
    collider.aabb.addXY(it * t * collider.vx, it * t * collider.vy);
  }
};

Collider.prototype.saveLast = function() {
  this.ox = this.x();
  this.oy = this.y();
  this.ovx = this.vx;
  this.ovy = this.vy;
};
