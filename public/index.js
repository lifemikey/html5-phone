
// show a message with a type of the input
function showMessage(input, message, type) {
    // get the small element and set the message
    const msg = input.parentNode.querySelector("small");
    msg.innerText = message;
    // update the class for the input
    input.className = type ? "success" : "error";
    return type;
}

function showError(input, message) {
    return showMessage(input, message, false);
}

function showSuccess(input) {
    return showMessage(input, "", true);
}

function hasValue(input, message) {
    if (input.value.trim() === "") {
        return showError(input, message);
    }
    return showSuccess(input);
}

var isAndroidDevice = false;
var isIOSDevice = false;

function getTypeMobileDevice(){
		
    var ua = navigator.userAgent;
    console.log(ua);
    var checker = {
    iphone: ua.match(/(iPhone|iPod|iPad)/),
    android: ua.match(/Android/)
    };
    if (checker.android){
        $('.android-only').show();
        isAndroidDevice = true;
    }
    else if (checker.iphone){
        $('.idevice-only').show();
        isIOSDevice = true;
    }
    else {
        $('.unknown-device').show();
        isUnknownDevice = true;
    }
}

var configureForm;

document.addEventListener('DOMContentLoaded',
function(event){

    console.log("DOMContentLoaded!");
    // hide connect and table
    $("#publish,#metricstable").hide();
    console.log(document);
    configureForm = document.querySelector('#configure-form');
    console.log(configureForm);

const DEVICETYPE_REQUIRED = "Enter device type name that you created in Monitor setup";
const DEVICE_REQUIRED = "Enter device name that you created in Monitor setup";
const DEVICE_PASSWORD_REQUIRED = "Enter device password that was set or generated in Monitor setup";
const MSG_HOSTNAME_REQUIRED = "Enter MAS messaging hostname";
const MSG_HOSTNAME_INVALID = "Invalid DNS hostname for MAS messaging";

configureForm.addEventListener("submit", function (event) {
    // stop form submission
    event.preventDefault();

    // validate the form
    deviceType = configureForm.elements["devicetype"]
    let deviceTypeValid = hasValue(deviceType, DEVICETYPE_REQUIRED);
    if (deviceTypeValid){
        deviceType = deviceType.value;
        console.log("Device Type: " + deviceType);
    }
    device = configureForm.elements["device"];
    let deviceValid = hasValue(device, DEVICE_REQUIRED);
    if (deviceValid)
    {
        device = device.value;
        console.log("Device: " + device);
    }
    devicePassword = configureForm.elements["devicepassword"]
    let devicePasswordValid = hasValue(devicePassword, DEVICE_PASSWORD_REQUIRED);
    if  (devicePasswordValid)
    {
        devicePassword = devicePassword.value;
        console.log("Device Password: " + devicePassword);
    }
    msgHostname = configureForm.elements["msghostname"]
    let msgHostnameValid = hasValue(msgHostname, MSG_HOSTNAME_REQUIRED);
    if (msgHostnameValid)
    {
        msgHostname = msgHostname.value;
        console.log("Messaging hostname: " + msgHostname);
        arr = msgHostname.split(".");
        orgId = arr[0];
        console.log("orgId: " + orgId);
    }
    if (deviceTypeValid && deviceValid && devicePasswordValid && msgHostnameValid) {
        
        console.log("configuration valid");
        getMqttClient();

        getTypeMobileDevice();
        if (isIOSDevice)
        {
           let btn = document.createElement("button");
           btn.id = "enableIOSAcceleration"
           btn.className = "data-title"
           btn.innerHTML = "Enable IOS Acceleration";
           document.body.appendChild(btn);
           btn.addEventListener("click", getIOSAccelPerm());
        }
    }
})
})




