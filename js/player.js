var Player;

Player = (function() {
  var $, animationProxy, calculateTimeDiff, completedPlaying, displayTime, extractAnimatedPropertiesFrom, firstPoint, paused, saveFirstPoint, speed, startedPlaying, timeline, updateAnimatedObjects, updatePlayPauseButtons;

  $ = function(selector) {
    return document.querySelector(selector);
  };

  timeline = null;

  firstPoint = null;

  speed = 1;

  animationProxy = {
    x: 0,
    y: 0,
    timestamp: 0,
    level: 0
  };

  paused = false;

  displayTime = function(timestamp) {
    return $("#progress-timer").innerText = new Date(parseInt(timestamp)).toLocaleTimeString();
  };

  updatePlayPauseButtons = function() {
    if (timeline != null) {
      $('#play').style.display = timeline.paused() ? 'block' : 'none';
      return $('#pause').style.display = timeline.isActive() ? 'block' : 'none';
    }
  };

  startedPlaying = function() {
    return updatePlayPauseButtons();
  };

  updateAnimatedObjects = function(point) {
    if (point == null) {
      point = animationProxy;
    }
    onTerminalPositionChange(point.x, point.y, parseInt(point.level));
    return displayTime(point.timestamp);
  };

  completedPlaying = function() {
    return updatePlayPauseButtons();
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
  }

  Player.prototype.isPlaying = function() {
    return ((timeline != null) && timeline.isActive()) || false;
  };

  Player.prototype.clearProgress = function() {};

  Player.prototype.setProgress = function(progress) {};

  Player.prototype.play = function() {
    if (timeline != null) {
      timeline.play();
      timeline.timeScale(speed);
      return updatePlayPauseButtons();
    }
  };

  Player.prototype.stop = function() {
    if (timeline != null) {
      timeline.pause(0);
    }
    return updatePlayPauseButtons();
  };

  Player.prototype.pause = function() {
    if (timeline != null) {
      timeline.pause();
    }
    return updatePlayPauseButtons();
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
    return this;
  };

  return Player;

})();