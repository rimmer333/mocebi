var Player;

Player = (function() {
  var animationProxy, calculateTimeDiff, completedPlaying, displayTime, extractAnimatedPropertiesFrom, firstPoint, saveFirstPoint, startedPlaying, timeline, updateAnimatedObjects;

  timeline = null;

  firstPoint = null;

  animationProxy = {
    x: 0,
    y: 0,
    timestamp: 0,
    level: 0
  };

  displayTime = function(timestamp) {
    return document.querySelector("#progress-timer").innerText = new Date(parseInt(timestamp)).toLocaleTimeString();
  };

  startedPlaying = function() {};

  updateAnimatedObjects = function(point) {
    if (point == null) {
      point = animationProxy;
    }
    onTerminalPositionChange(point.x, point.y, parseInt(point.level));
    return displayTime(point.timestamp);
  };

  completedPlaying = function() {};

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
  }

  Player.prototype.isPlaying = function() {
    return ((timeline != null) && timeline.isActive()) || false;
  };

  Player.prototype.clearProgress = function() {};

  Player.prototype.setProgress = function(progress) {};

  Player.prototype.play = function() {
    if (timeline != null) {
      return timeline.play();
    }
  };

  Player.prototype.stop = function() {
    if (timeline != null) {
      return timeline.pause(0);
    }
  };

  Player.prototype.pause = function() {
    if (timeline != null) {
      return timeline.pause();
    }
  };

  Player.prototype.setSpeed = function(speed) {
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
    return this;
  };

  return Player;

})();