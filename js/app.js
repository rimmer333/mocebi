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
    $('#appIdDisplay').text('Идентификатор приложения: ' + appId)
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


socket.on('load-track', function (trackData) {
    if (trackData.length === 0) {
        return;
    }
    console.log('Play');
    player.stop();
    player.load(trackData);
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