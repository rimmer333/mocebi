(function() {
  var Player,
    hasProp = {}.hasOwnProperty;

  Player = (function() {
    var $, animationProxy, buttons, calculateTimeDiff, completedPlaying, displayTime, extractAnimatedPropertiesFrom, firstPoint, initializeSeekBar, saveFirstPoint, seekBar, seekBarDetached, setButtonEnabled, speed, startedPlaying, stopped, timeline, updateAllControls, updateAnimatedObjects, updatePlayerButtons, updateSeekBar;

    $ = function(selector) {
      return document.querySelector(selector);
    };

    buttons = {
      play: $('#play'),
      pause: $('#pause'),
      stop: $('#stop'),
      rewind: $('#rewind'),
      forward: $('#forward')
    };

    seekBar = $('#seekBar');

    seekBarDetached = false;

    timeline = null;

    firstPoint = null;

    speed = 1;

    animationProxy = {
      x: 0,
      y: 0,
      timestamp: 0,
      level: 0
    };

    stopped = true;

    Player.prototype.initializeButtons = function() {
      buttons.play.addEventListener('click', (function(_this) {
        return function() {
          return _this.play();
        };
      })(this));
      buttons.pause.addEventListener('click', (function(_this) {
        return function() {
          return _this.pause();
        };
      })(this));
      buttons.stop.addEventListener('click', (function(_this) {
        return function() {
          return _this.stop();
        };
      })(this));
      buttons.rewind.addEventListener('click', function() {
        if (timeline != null) {
          timeline.progress(0);
          return updatePlayerButtons();
        }
      });
      buttons.forward.addEventListener('click', function() {
        if (timeline != null) {
          timeline.progress(1);
          return updatePlayerButtons();
        }
      });
      return updatePlayerButtons();
    };

    initializeSeekBar = function() {
      seekBar.setAttribute('min', 0);
      seekBar.setAttribute('max', 10000);
      seekBar.addEventListener('change', function() {
        if (timeline != null) {
          timeline.progress(seekBar.value / 10000);
          return updatePlayerButtons();
        }
      });
      seekBar.addEventListener('mousedown', function() {
        return seekBarDetached = true;
      });
      return seekBar.addEventListener('mouseup', function() {
        return setTimeout((function() {
          return seekBarDetached = false;
        }), 100);
      });
    };

    displayTime = function(timestamp) {
      return $('#progress-timer').innerText = new Date(parseInt(timestamp)).toLocaleString();
    };

    updateSeekBar = function() {
      if (timeline != null) {
        if (!seekBarDetached) {
          return seekBar.MaterialSlider.change(parseInt(timeline.progress() * 10000));
        }
      }
    };

    setButtonEnabled = function(button, state) {
      if (state) {
        return button.removeAttribute('disabled');
      } else {
        return button.disabled = "disabled";
      }
    };

    updatePlayerButtons = function() {
      var buttonName;
      if (timeline != null) {
        buttons.play.style.display = timeline.paused() ? 'block' : 'none';
        buttons.pause.style.display = timeline.isActive() ? 'block' : 'none';
        setButtonEnabled(buttons.play, timeline.progress() < 1);
        setButtonEnabled(buttons.pause, true);
        setButtonEnabled(buttons.stop, !stopped);
        setButtonEnabled(buttons.rewind, timeline.progress() > 0);
        setButtonEnabled(buttons.forward, timeline.progress() < 1);
      } else {
        for (buttonName in buttons) {
          if (!hasProp.call(buttons, buttonName)) continue;
          setButtonEnabled(buttons[buttonName], false);
        }
      }
      return true;
    };

    updateAllControls = function() {
      updatePlayerButtons();
      return updateSeekBar();
    };

    startedPlaying = function() {
      return updatePlayerButtons();
    };

    completedPlaying = function() {
      timeline.pause();
      stopped = true;
      return updatePlayerButtons();
    };

    updateAnimatedObjects = function(point) {
      if (point == null) {
        point = animationProxy;
      }
      onTerminalPositionChange(point.x, point.y, parseInt(point.level));
      displayTime(point.timestamp);
      return updateSeekBar();
    };

    extractAnimatedPropertiesFrom = function(point) {
      return {
        x: point.x,
        y: point.y,
        timestamp: point.timestamp,
        level: point.level
      };
    };

    saveFirstPoint = function(point) {
      firstPoint = animationProxy = extractAnimatedPropertiesFrom(point);
      return updateAnimatedObjects();
    };

    calculateTimeDiff = function(startPoint, endPoint) {
      return (endPoint.timestamp - startPoint.timestamp) / 1000;
    };

    function Player(points) {
      if (points != null) {
        this.load(points);
      }
      this.initializeButtons();
      initializeSeekBar();
    }

    Player.prototype.isPlaying = function() {
      return ((timeline != null) && timeline.isActive()) || false;
    };

    Player.prototype.play = function() {
      if (timeline != null) {
        timeline.play();
        timeline.timeScale(speed);
        stopped = false;
        return updatePlayerButtons();
      }
    };

    Player.prototype.stop = function() {
      if (timeline != null) {
        timeline.pause(0);
      }
      stopped = true;
      return updateAllControls();
    };

    Player.prototype.pause = function() {
      if (timeline != null) {
        timeline.pause();
      }
      return updatePlayerButtons();
    };

    Player.prototype.setSpeed = function(value) {
      speed = value;
      if (timeline != null) {
        return timeline.timeScale(speed);
      }
    };

    Player.prototype.load = function(points) {
      var i, len, point, previousPoint;
      timeline = new TimelineLite({
        paused: true,
        onStart: startedPlaying,
        onComplete: completedPlaying,
        onUpdate: updateAnimatedObjects,
        callbackScope: this
      });
      previousPoint = points.shift();
      saveFirstPoint(previousPoint);
      for (i = 0, len = points.length; i < len; i++) {
        point = points[i];
        timeline.add(TweenLite.to(animationProxy, calculateTimeDiff(previousPoint, point), extractAnimatedPropertiesFrom(point)));
        previousPoint = point;
      }
      updateAllControls();
      return this;
    };

    return Player;

  })();

  window.Player = Player;

}).call(this);
