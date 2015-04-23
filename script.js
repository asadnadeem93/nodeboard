
(function() {
	var canvas = document.getElementById("mainCanvas");
	var ctx = canvas.getContext('2d');
	var clearButton = document.getElementById("clear_all_button");

	var drawnPoints = [];
	var receivedPoints = [];


	//var colorValue = 0x0;
	var colorBlack = "#000000";
	var colorPurple = "#cb3594";
	var colorGreen = "#659b41";
	var colorYellow = "#ffcf33";
	var colorBrown = "#986928";

	var radS = 1;
	var radM = 3;
	var radL = 5;
	var radXL = 10;

	var curRadius = radS;

	var curColor = colorBlack;

	var newColor = document.getElementById("color");

	var socket = io("http://localhost:8080");
	socket.on('connect', function() {
		document.body.className = "connected";

		socket.emit("clear");
		socket.on('points', redrawAllPoints);
		socket.on('clear', clearCanvas);
	});

	clearButton.addEventListener("click", onClearButtonClicked);

	function addListeners() {
		canvas.addEventListener("mousedown", onCanvasMouseDown);
		canvas.addEventListener("mouseup", onCanvasMouseUp);

		canvas.addEventListener("touchstart", onCanvasTouchBegin);
		canvas.addEventListener("touchend", onCanvasTouchEnd);
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

	function setRadius(){
		if (document.getElementById("radius").value === "small") {ctx.lineWidth = radS;}
			else if (document.getElementById("radius").value === "medium") {ctx.lineWidth = radM;}
			else if (document.getElementById("radius").value === "large") {ctx.lineWidth = radL;}
			else if (document.getElementById("radius").value === "xlarge") {ctx.lineWidth = radXL;}
	}
	

	function setColor(){
		if (document.getElementById("color").value === "purple") {ctx.strokeStyle = colorPurple;}
			else if (document.getElementById("color").value === "green") {ctx.strokeStyle = colorGreen;}
			else if (document.getElementById("color").value === "brown") {ctx.strokeStyle = colorBrown;}
			else if (document.getElementById("color").value === "yellow") {ctx.strokeStyle = colorYellow;}
	}

	function drawLatestPoints() {
		if (drawnPoints.length > 1) {
			var pointA = drawnPoints[drawnPoints.length - 1];
			var pointB = drawnPoints[drawnPoints.length - 2];

			var xOffset = (window.innerWidth - canvas.width) / 2;

			ctx.lineWidth = curRadius;
			ctx.strokeStyle = curColor;
			setRadius();
			setColor();
			

			ctx.beginPath();			
			ctx.moveTo(pointA.x - xOffset, pointA.y - 50);
			ctx.lineTo(pointB.x - xOffset, pointB.y - 50);
			ctx.closePath();
			ctx.stroke();

			if (document.getElementById("dtool").value==="pencil") {
				ctx.beginPath();			
				ctx.moveTo(pointA.x - xOffset, pointA.y - 50);
				ctx.lineTo(pointB.x - xOffset, pointB.y - 50);
				ctx.closePath();
				ctx.stroke();
			} else if (document.getElementById("dtool").value==="eraser") {
				ctx.beginPath();			
				ctx.moveTo(pointA.x - xOffset, pointA.y - 50);
				ctx.lineTo(pointB.x - xOffset, pointB.y - 50);
				ctx.closePath();
				ctx.strokeStyle = "#ffffff";
				ctx.fillStyle = "#ffffff";
				ctx.stroke();
			} else if (document.getElementById("dtool").value==="circle"){
				var radius1 = Math.sqrt(Math.pow((pointA.x - pointB.x), 2)
                 + Math.pow((pointA.y - pointB.y), 2));
                ctx.beginPath();
                ctx.arc(pointB.x, pointB.y, radius1, 0, Math.PI * 2, false);
                ctx.stroke();
			}else if (document.getElementById("dtool").value==="rect"){
				ctx.beginPath();
                ctx.rect(pointA.x, pointA.y, pointB.x 
                    - pointA.x, pointB.y - pointA.y);
                ctx.stroke();
			}/*else if (document.getElementById("dtool").value==="line"){
				ctx.beginPath();
                ctx.moveTo(pointA.x, pointA.y);
                ctx.lineTo(pointB.x, pointB.y);
                ctx.stroke();*/
			}
			
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
		
		//ctx.lineWidth = data.radius;
		//ctx.strokeStyle = data.color;
		

		ctx.beginPath();
		ctx.moveTo(pointA.x - xOffset, pointA.y - 50);
		ctx.lineTo(pointB.x - xOffset, pointB.y - 50);
		ctx.closePath();
		ctx.stroke();

		if (document.getElementById("dtool").value==="pencil") {
				ctx.beginPath();			
				ctx.moveTo(pointA.x - xOffset, pointA.y - 50);
				ctx.lineTo(pointB.x - xOffset, pointB.y - 50);
				ctx.closePath();
				ctx.stroke();
			} else if (document.getElementById("dtool").value==="eraser") {
				ctx.beginPath();			
				ctx.moveTo(pointA.x - xOffset, pointA.y - 50);
				ctx.lineTo(pointB.x - xOffset, pointB.y - 50);
				ctx.closePath();
				ctx.strokeStyle = "#ffffff";
				ctx.fillStyle = "#ffffff";
				ctx.stroke();
			} else if (document.getElementById("dtool").value==="circle"){
				var radius1 = Math.sqrt(Math.pow((pointA.x - pointB.x), 2)
                 + Math.pow((pointA.y - pointB.y), 2));
                ctx.beginPath();
                ctx.arc(pointB.x, pointB.y, radius1, 0, Math.PI * 2, false);
                ctx.stroke();
			}else if (document.getElementById("dtool").value==="rect"){
				ctx.beginPath();
                ctx.rect(pointA.x, pointA.y, pointB.x 
                    - pointA.x, pointB.y - pointA.y);
                ctx.stroke();
			}/*else if (document.getElementById("dtool").value==="line"){
				ctx.beginPath();
                ctx.moveTo(pointA.x, pointA.y);
                ctx.lineTo(pointB.x, pointB.y);
                ctx.stroke();
			}*/

		
	}

	function transmitLatestPoints() {
		var pointToSend = drawnPoints[drawnPoints.length - 1] ;
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
				

				var currPosition = 0;
				var slideWidth = 500;
				var slides = $('.slide');
				var numberOfSlides = slides.length;
				var slideInterval;
				var speed = 3000;

				slideInterval = setInterval(changePosition, speed);

				slides.wrapAll('<div id="slidesHolder"></div>')

				slides.css({ 'float' : 'left' });

				$('#slidesHolder').css('width', slideWidth * numberOfSlides);

				function changePosition() {
					if(currPosition == numberOfSlides - 1) {
						currPosition = 0;
					} else {
						currPosition++;
					}
					moveSlide();
				}

				function moveSlide() {
					$('#slidesHolder')
					.animate({'marginLeft' : slideWidth*(-currPosition)});
				}

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
								$('#contentWrap2').show();
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