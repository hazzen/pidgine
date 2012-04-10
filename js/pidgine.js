FRAME_RATE = 60;
DEBUG = false;

// +----------------------------------------------------------------------------
// | KB
KB = {};
KB.keyDown_ = {};
KB.keyDownCounts_ = {};

KB.keyPressed = function(chr) {
  return KB.keyDown(chr) == 1;
};

KB.keyDown = function(chr) {
  if (typeof(chr) == 'string') {
    return KB.keyDownCounts_[chr.toUpperCase().charCodeAt(0)];
  } else {
    return KB.keyDownCounts_[chr];
  }
};

KB.tickHandleInput_ = function() {
  $.each(KB.keyDown_, function(key, value) {
      if (KB.keyDownCounts_[key]) {
        KB.keyDownCounts_[key]++;
      } else {
        KB.keyDownCounts_[key] = 1;
      }
  });
  $.each(KB.keyDownCounts_, function(key, value) {
      if (!KB.keyDown_[key]) {
        KB.keyDownCounts_[key] = 0;
      }
  });
};

KB.onKeyDown = function(event) {
  KB.keyDown_[event.keyCode] = true;
  event.preventDefault();
  return false;
};

KB.onKeyUp = function(event) {
  KB.keyDown_[event.keyCode] = false;
  event.preventDefault();
  return false;
};

// +----------------------------------------------------------------------------
// | Pidgine
Pidgine = {};

// Takes an object with these fields as a param:
//   elem: the Element to listen for key events on.
//   tick: a function of one argument that steps time forward by that amount.
//   render: a function that renders something.
Pidgine.run = function(gameStruct) {
  $(gameElem).keydown(KB.onKeyDown);
  $(gameElem).keyup(KB.onKeyUp);
  var lastFrame = new Date().getTime();
  (function renderLoop() {
    var now = new Date().getTime();
    var numFrames = Math.floor((now - lastFrame) / (1000 / FRAME_RATE));
    lastFrame = lastFrame + numFrames * (1000 / FRAME_RATE);
    if (numFrames > 5) {
      numFrames = 1;
    }
    for (var i = 0; i < numFrames; i++) {
      KB.tickHandleInput_();
      gameStruct.tick(1 / FRAME_RATE);
    }
    gameStruct.render();

    requestAnimFrame(renderLoop);
  })();
};
