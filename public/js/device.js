/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and Eclipse Distribution License v1.0 which accompany this distribution.
 *
 * The Eclipse Public License is available at
 *   http://www.eclipse.org/legal/epl-v10.html
 * and the Eclipse Distribution License is available at
 *   http://www.eclipse.org/org/documents/edl-v10.php.
 *
 * Contributors:
 *   Bryan Boyd - Initial implementation
 *	 Alan Blyth - Modified to favour SSL over port 8883
 *******************************************************************************/
(function(window){
    
    // "masdev"
    // "messaging.iot.demo2.monitordemo2-822c5cdfc486f5db3c3145c89ca6409d-0000.us-south.containers.appdomain.cloud"
	var mqttClient;
    var orgId = "main"
    var messagingRoute = "messaging.iot"
	var masHost = "maspreivt89.ivt.suite.maximo.com"
	var mqttPort = 443;

	var deviceType = "mas-phone"
    var devicePassword = "Pasword1!"
    var deviceIdRegEx = /^([a-zA-Z0-9]){8,}$/;

	var mqttTopic = "iot-2/evt/sensorData/fmt/json";
    var isDeviceConnected = false;

	var ax = 0, ay = 0, az = 0, oa = 0, ob = 0, og = 0;
	window.lat = 0;
	window.lng = 0;

    window.ondevicemotion = function(event) {
        ax = parseFloat((event.acceleration.x || 0));
        ay = parseFloat((event.acceleration.y || 0));
        az = parseFloat((event.acceleration.z || 0));

        document.getElementById("accx").innerHTML = ax.toFixed(2);
        document.getElementById("accy").innerHTML = ay.toFixed(2);
        document.getElementById("accz").innerHTML = az.toFixed(2);
    }

    window.ondeviceorientation = function(event){

        oa = (event.alpha || 0);
        ob = (event.beta || 0);
        og = (event.gamma || 0);

        if(event.webkitCompassHeading){
            oa = -event.webkitCompassHeading;
        }

        document.getElementById("alpha").innerHTML = oa.toFixed(2);
        document.getElementById("beta").innerHTML = ob.toFixed(2);
        document.getElementById("gamma").innerHTML = og.toFixed(2);
    }

	window.msgCount = 0;

	var updatePersonalLocation = function(position) {
		window.lat = position.coords.latitude;
		window.lng = position.coords.longitude;
		$("#lat").html(window.lat.toFixed(6));
		$("#lng").html(window.lng.toFixed(6));
	}

	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(updatePersonalLocation);
	}

	function getMqttClient() {
		var clientId = "d:"+orgId+":"+deviceType+":"+window.deviceId;
		mqttHost = orgId+"."+messagingRoute+"."+masHost;
		mqttClient = new Paho.MQTT.Client(mqttHost, mqttPort, clientId);
		console.log("Attempting connect to " + mqttHost);

		connectDevice(mqttClient);
		setInterval(publish, 1000);
    }

	function getDeviceId() {

		window.deviceId = prompt("Enter a unique ID of at least 8 characters containing only letters and numbers:");
		if (deviceIdRegEx.test(window.deviceId) === true) {
			console.log("Connecting with device id: " + window.deviceId);
			$("#deviceId").html(window.deviceId);
			getMqttClient();
		}
		else
		{
			window.alert("Device ID must be atleast 8 characters in length, and contain only letters and numbers.");
			getDeviceId();
		}
	}

    function publish() {
    	// We only attempt to publish if we're actually connected, saving CPU and battery
		if (isDeviceConnected) {
	    	var payload = {
					//"id": window.deviceId,
					"ts": (new Date()).getTime(),
					"lat": parseFloat(window.lat),
					"lng": parseFloat(window.lng),
					"ax": parseFloat(ax.toFixed(2)),
					"ay": parseFloat(ay.toFixed(2)),
					"az": parseFloat(az.toFixed(2)),
					"oa": parseFloat(oa.toFixed(2)),
					"ob": parseFloat(ob.toFixed(2)),
					"og": parseFloat(og.toFixed(2))
	        };
	        var message = new Paho.MQTT.Message(JSON.stringify(payload));
	        message.destinationName = mqttTopic;
	       	try {
			     mqttClient.send(message);
				 window.msgCount++;
				 $("#msgCount").html(window.msgCount);
			     console.log("[%s] Published", new Date().getTime());
			}
			catch (err) {
				isConnected = false;
				changeConnectionStatusImage("/images/disconnected.svg");
				document.getElementById("connection").innerHTML = "Disconnected";
				setTimeout(connectDevice(mqttClient), 1000);
			}
		}
    }

    function onConnectSuccess(){
    	// The device connected successfully
        console.log("Connected Successfully!");
        isDeviceConnected = true;
        changeConnectionStatusImage("/images/connected.svg");
        document.getElementById("connection").innerHTML = "Connected";
    }

    function onConnectFailure(){
    	// The device failed to connect. Let's try again in one second.
        console.log("Could not connect to IoT Foundation! Trying again in one second.");
        setTimeout(connectDevice(mqttClient), 1000);
    }

    function connectDevice(mqttClient){
    	changeConnectionStatusImage("/images/connecting.svg");
    	document.getElementById("connection").innerHTML = "Connecting";
    	console.log("Connecting device to IoT Foundation...");
		mqttClient.connect({
			onSuccess: onConnectSuccess,
			onFailure: onConnectFailure,
			userName: "use-token-auth",
			password: devicePassword,
			useSSL: true
		});
    }

	function changeConnectionStatusImage(image) {
        document.getElementById("connectionImage").src=image;
    }

    $(document).ready(function() {
		// prompt the user for device id
		getDeviceId();		
    });

}(window));