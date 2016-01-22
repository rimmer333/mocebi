// TODO new Player class with the same interface


// var Player = function (points) {
//     var self = this;
//     this._points = points || [];
//     this._idx = 0;
//     this._speed = 1;
//     this._elapsedTime = 0;
//     this._timer = null;
//     this.progressBar = null;
//     this.progressTimer = $('#progress-timer');
//     document.querySelector('#progress').addEventListener('mdl-componentupgraded', function () {
//         self.progressBar = this.MaterialProgress;
//     });
//     this.onlineSwitch = null;
//     document.querySelector('#online-1').addEventListener('mdl-componentupgraded', function () {
//         self.onlineSwitch = this.MaterialSwitch;
//     });

//     return this;
// };

// Player.prototype.isPlaying = function () {
//     if (this._timer !== null) {
//         return true;
//     } else {
//         return false;
//     }
// };

// Player.prototype.clearProgress = function () {
//     this.setProgress(0);
//     this.progressTimer.text('');
// };

// Player.prototype.setProgress = function (progress) {
//     if (this.progressBar) {
//         this.progressBar.setProgress(progress);
//     }
// };

// Player.prototype.play = function () {
//     if (this.onlineSwitch) {
//         this.onlineSwitch.off();
//         this.onlineSwitch.disable();
//     }

//     var self = this;
//     var points = self._points;

//     if (this._points.length === 0 || this._timer !== null) {
//         return;
//     }
//     this._idx++;

//     onTerminalPositionChange(points[0].x, points[0].y, points[0].level);
//     this.setProgress(Math.round((this._idx / this._points.length) * 100));

//     if (this._points.length === 1) {
//         return;
//     }

//     this._progressTimer = setTimeout(function updateTime() {
//         self._elapsedTime = self._elapsedTime + self._speed * 500;
//         var date = new Date(parseInt(points[0].timestamp) + self._elapsedTime);
//         self.progressTimer.text(date.toLocaleTimeString());
//         self._progressTimer = setTimeout(updateTime, 500);
//     }, 1000);

//     console.log(new Date(parseInt(points[0].timestamp)).toLocaleTimeString());
//     console.log(new Date(parseInt(points[points.length - 1].timestamp)).toLocaleTimeString());

//     this._timer = setTimeout(function playFrame() {
//         if (self._idx >= points.length - 2) {
//             self.stop();
//             return;
//         }
//         var latentcy = (points[self._idx + 1].timestamp - points[self._idx].timestamp) / self._speed;
//         self._idx++;
//         onTerminalPositionChange(points[self._idx].x, points[self._idx].y, points[self._idx].level);
//         self.setProgress(Math.round((self._idx / points.length) * 100));
//         self._timer = setTimeout(playFrame, latentcy);
//     }, Math.round((points[1].timestamp - points[0].timestamp) / this._speed));
// };

// Player.prototype.stop = function () {
//     if (this.onlineSwitch) {
//         this.onlineSwitch.enable();
//     }
//     clearTimeout(this._timer);
//     clearTimeout(this._progressTimer);
//     this._elapsedTime = 0;
//     this._timer = null;
//     this._progressTimer = null;
//     this._points = [];
//     this._idx = 0;
// };

// Player.prototype.setSpeed = function (speed) {
//     this._speed = speed;
// };

// Player.prototype.load = function (points) {
//     this._points = points;
// };

var socket = io.connect('http://contentsrv.ibecom.ru', {path: "/tracker/socket.io"});
var fromDateTime = new Date().getTime();
var toDateTime = new Date().getTime();
var player = new Player();
var appId = 0;

function writeTimestamp(timestamp) {
    $("#timeStamp").val(timestamp);
}

$("#online").on('click', function () {
    if ($("#online").is(':checked')) {
        $("#location-status").text('gps_not_fixed');
        removeTerminal();
    } else {
        $("#location-status").text('gps_off');
    }
});

function loadData() {
    if(appId > 0) {
        socket.emit('load-track', {
            appId: appId,
            startTimeStamp: fromDateTime,
            endTimeStamp: toDateTime
        });
        $('#requestInProgress').show();
    }
}

$('#appid').change(function(){
    appId = parseInt($(this).val());
    loadData();
})

$('#fromDateTime').datetimepicker({
    onChangeDateTime: function (current_time, input) {
        if (!current_time) {
            return;
        }
        fromDateTime = current_time.getTime();
        console.log(fromDateTime);
        loadData();
    },
    showTimezone: true
});

$('#toDateTime').datetimepicker({
    onChangeDateTime: function (current_time, input) {
        if (!current_time) {
            return;
        }
        toDateTime = current_time.getTime();
        console.log(toDateTime);
        loadData();
    },
    showTimezone: true
});

$('#speed').change(function () {
    if (isNaN(parseInt($('#speed').val()))) {
        return;
    }
    player.setSpeed(parseInt($('#speed').val()));
});

$('#play').on('click', function (e) {
    $("#location-status").text('gps_off');
});

$('#pause').on('click', function (e) {
    player.pause();
});

$('#stop').on('click', function (e) {
    player.stop();
    console.log('Stop');
});

socket.on('load-track', function (trackData) {
    if (trackData.length === 0) {
        return;
    }
    console.log('Play');
    player.stop();
    player.load(trackData);
    player.play();
    $('#requestInProgress').hide();
    $('#seekBar').show();
});

$.get('map_canvas.json', function (Mapdata) {
    initMap({
        higlightableTag: 'zone',
        labelHideZoom: 17,
        minZoom: 17,
        maxZoom: 28,
        zoom: 17,
        fitBounds: true
    });
    loadMapCanvas(Mapdata);
    socket.on('location-change', function (point) {
        if (!player.isPlaying() && $('#online').is(':checked')) {
            $("#location-status").text('gps_fixed');
            onTerminalPositionChange(point.x, point.y, point.level);
        }
    });
});