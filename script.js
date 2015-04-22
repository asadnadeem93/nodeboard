
(function() {
	var canvas = document.getElementById("mainCanvas");
	var ctx = canvas.getContext('2d');
	var clearButton = document.getElementById("clear_all_button");

	var drawnPoints = [];
	var receivedPoints = [];

	var colorValue = 0x0;

	var socket = io("http://localhost:8080");
	socket.on('connect', function() {
		document.body.className = "connected";

		socket.emit("clear");
		socket.on('points', redrawAllPoints);
		socket.on('rect', drawRect);
		socket.on('clear', clearCanvas);
	});

	clearButton.addEventListener("click", onClearButtonClicked);


	function addListeners() {
		canvas.addEventListener("mousedown", onCanvasMouseDown);
		canvas.addEventListener("mouseup", onCanvasMouseUp);

		canvas.addEventListener("touchstart", onCanvasTouchBegin);
		canvas.addEventListener("touchend", onCanvasTouchEnd);
		canvas.addEventListener('mousemove', ev_mousemove, false);


	}

	function clearCanvas() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	function downloadCanvas(link, canvasId, filename) {
		link.href = document.getElementById(canvasId).toDataURL();
		link.download = filename;
	}

	document.getElementById('save').addEventListener('click', function() {
		downloadCanvas(this, 'mainCanvas', 'test.png');
	}, false);

	function drawLatestPoints() {
		if (drawnPoints.length > 1) {
			var pointA = drawnPoints[drawnPoints.length - 1];
			var pointB = drawnPoints[drawnPoints.length - 2];

			var xOffset = (window.innerWidth - canvas.width) / 2;
			
			ctx.beginPath();			
			ctx.moveTo(pointA.x - xOffset, pointA.y - 50);
			ctx.lineTo(pointB.x - xOffset, pointB.y - 50);
			ctx.closePath();
			ctx.strokeStyle = "black";
			ctx.stroke();
		}
	}

	function redrawAllPoints(data) {
		if (data.fresh) receivedPoints = [];

		receivedPoints.push(data);
		if (receivedPoints.length < 2) return;

		var i = receivedPoints.length - 1;
		var pointA = receivedPoints[i];
		var pointB = receivedPoints[i - 1];

		var xOffset = (window.innerWidth - canvas.width) / 2;
		
		ctx.beginPath();
		ctx.moveTo(pointA.x - xOffset, pointA.y - 50);
		ctx.lineTo(pointB.x - xOffset, pointB.y - 50);
		ctx.closePath();
		ctx.strokeStyle = "red";
		ctx.stroke();
	}

	function transmitLatestPoints() {
		var pointToSend = drawnPoints[drawnPoints.length - 1];
		if (drawnPoints.length == 1) pointToSend.fresh = true;

		socket.emit("points", pointToSend, function() {
		});
	}

	function init() {
		addListeners();
	}

	init();

	// event handlers

	function onCanvasMouseDown(event) {
		drawnPoints = [];
		canvas.addEventListener("mousemove", onCanvasMouseMove);
	}

	function onCanvasMouseMove(event) {
		if (drawnPoints.length > 0) {
			var referencePoint = drawnPoints[drawnPoints.length - 1];
			var distance = Math.sqrt( Math.pow(referencePoint.x - event.pageX, 2) + Math.pow(referencePoint.y - event.pageY , 2) );

			if (distance < 2) return;
		}

		drawnPoints.push( { x: event.pageX+200, y: event.pageY-45 } );

		drawLatestPoints();
		transmitLatestPoints();
	}

	var started = false;
	function ev_mousemove (ev) {
		var x, y;

		// Get the mouse position relative to the <canvas> element
		if (ev.layerX || ev.layerX == 0) { // Firefox
			x = ev.layerX;
			y = ev.layerY;
		} else if (ev.offsetX || ev.offsetX == 0) { // Opera
			x = ev.offsetX;
			y = ev.offsetY;
		}

	var tool = false;
	var tool_default = 'rect';

	function init () {
		// Get the tool select input
		var tool_select = document.getElementById('dtool');
		if (!tool_select) {
			alert('Error: failed to get the dtool element!');
			return;
		}
		tool_select.addEventListener('change', ev_tool_change, false);

		// Activate the default tool.
		if (tools[tool_default]) {
			tool = new tools[tool_default]();
			tool_select.value = tool_default;
		}
	}

	function ev_tool_change (ev) {
	if (tools[this.value]) {
		tool = new tools[this.value]();
	}
}

// This object holds the implementation of each drawing tool
var tools = {};

tools.rect = function () {
	var tool = this;
	this.started = false;

	this.mousedown = function (ev) {
		tool.started = true;
		tool.x0 = ev._x;
		tool.y0 = ev._y;
	};

	this.mousemove = function (ev) {
		if (!tool.started) {
			return;
		}

		var x = Math.min(ev._x,	tool.x0),
			y = Math.min(ev._y,	tool.y0),
			w = Math.abs(ev._x - tool.x0),
			h = Math.abs(ev._y - tool.y0);

		context.clearRect(0, 0, canvas.width, canvas.height);

		if (!w || !h) {
			return;
		}

		context.strokeRect(x, y, w, h);
	};

	this.mouseup = function (ev) {
		if (tool.started) {
			tool.mousemove(ev);
			tool.started = false;
		}
	};
};
	function onCanvasMouseUp(event) {
		canvas.removeEventListener("mousemove", onCanvasMouseMove);
	}





	function onCanvasTouchBegin(event) {
		drawnPoints = [];
		canvas.addEventListener("touchmove", onCanvasTouchMove);
		event.preventDefault();
		event.stopPropagation();
	}

	function onCanvasTouchMove(event) {
		var touches = event.changedTouches;
		var touch;

		if (touches.length) touch = touches[0];
		else return;

		if (drawnPoints.length > 0) {
			var referencePoint = drawnPoints[drawnPoints.length - 1];
			var distance = Math.sqrt( Math.pow(referencePoint.x - touch.pageX, 2) + Math.pow(referencePoint.y - touch.pageY , 2) );

			if (distance < 2) return;
		}


		var xOffset = (window.innerWidth - canvas.width) / 2 - 10;

		drawnPoints.push( { x: touch.pageX + xOffset, y: touch.pageY + 50 } );

		drawLatestPoints();
		transmitLatestPoints();

		event.preventDefault();
		event.stopPropagation();
	}

	function onCanvasTouchEnd(event) {
		canvas.removeEventListener("mousemove", onCanvasMouseMove);

		event.preventDefault();
		event.stopPropagation();
	}

	function onClearButtonClicked(event) {
		socket.emit("clear");
		clearCanvas();
		console.log("cleared canvas");
	}
}());


(function() {

	$(document).ready(function($){
				var socket = io("http://localhost:3000");
				var $messageForm = $('#send-message');
				var $messageBox = $('#message');
				var $chat = $('#chat');
				var $nickForm = $('#setNick');
				var $nickError = $('#nickError');
				var $nickBox = $('#nickname');
				var $users = $("#users");
				
				$messageForm.submit(function(e){
					e.preventDefault();
					socket.emit('send message', $messageBox.val());
					$messageBox.val('');
				});

				$nickForm.submit(function(e){
					e.preventDefault();
					if($nickBox.val() != ''){
						socket.emit('new users', $nickBox.val(), function(data){
							if (data) {
								$('#nickWrap').hide();
								$('#contentWrap').show();
							}else{
								$nickError.html("Already taken, choose another, idiot!)")
							}
						});
						$nickBox.val('');
					}
					else{
						$nickError.html("Don't you have a name?")
					}
				});
				
				socket.on('usernames', function(data){
					var html = "";
					for (var i = 0; i < data.length; i++) {
						html += data[i] + '<br/>';
					}
					$users.html(html);
				});

				socket.on('new message', function(data){
					displayMsg(data);
				});
				socket.on('load old msgs', function(docs){
					for (var i = 0; i < docs.length; i++) {
						displayMsg(docs[i]);
					};
				});
				function displayMsg(data){
					$chat.append("<br/>" + "<b>" + data.nick + "</b>" + ": " +data.msg + "<br/>");
				}
			});

}());