var microBitBle;

var servoEnable;
var pca9685;
var angle = 0;
var default_angle = 0;
var rawData = [];
var voltage = [];

console.log("init0:", rawData, voltage);

var ads1115;
var readEnable;

async function connect() {
  for (var i = 0; i < 2; i++) {
    rawData[i] = document.getElementById("rawData" + i);
    voltage[i] = document.getElementById("voltage" + i);
  }
  w = document.getElementById("Weight");

  microBitBle = await microBitBleFactory.connect();
  head.innerHTML = "micro:bit BLE接続しました。";
  var i2cAccess = await microBitBle.requestI2CAccess();
  var i2cPort = i2cAccess.ports.get(1);
  pca9685 = new PCA9685(i2cPort, 0x40);

  ads1115 = new ADS1x15(i2cPort, 0x48);
  await ads1115.init(true, 7); // High Gain
  readEnable = true;
  //readData();

  await pca9685.init(0.001, 0.002, 30);
  servoEnable = true;
  //moveServo();

  operateServo();
}

async function disconnect() {
  servoEnable = false;
  await microBitBle.disconnect();
  head.innerHTML = "micro:bit BLE接続を切断しました。";
}

async function ServoPlis() {
  default_angle += 10;
  await pca9685.setServo(0, default_angle);
}

async function ServoMinus() {
  default_angle -= 10;
  await pca9685.setServo(0, default_angle);
}

async function operateServo() {
  var firstTime = true;
  await pca9685.setServo(0, default_angle);
  while (readEnable) {
    try {
      var difA = await ads1115.read("0,1"); // p0-p1 differential mode
      rawData[0].innerHTML = "dif chA(0-1):" + difA.toString(16);
      voltage[0].innerHTML = ads1115.getVoltage(difA).toFixed(6) + "V"; //left
      if (firstTime) {
        tare = difA;
        firstTime = false;
      }

      weight = difA - tare;
      rawData[1].innerHTML = "rawData - Tare:" + weight.toString(16);
      voltage[1].innerHTML = ads1115.getVoltage(weight).toFixed(6) + "V"; //right

      w.innerHTML = "Weight : " + weight.toString();
    } catch (error) {
      console.log(error);
    }

    if (-11 <= weight && weight <= -8) {
      angle = 20;
      await pca9685.setServo(0, angle);
      await sleep(300);
      angle = 30;
      await pca9685.setServo(0, angle);
      await sleep(0);
      await pca9685.setServo(0, default_angle);
    } else {
      angle = default_angle;
    }
    msg2.innerHTML = "Default: " + default_angle;
    msg1.innerHTML = "Angle: " + angle;
    await pca9685.setServo(0, default_angle);

    await sleep(2000);
  }
}

/*
async function moveServo() {
  while (servoEnable) {
    angle = angle <= -30 ? 30 : -30;
    // console.log("angle"+angle);
    await pca9685.setServo(0, angle);
    // console.log('value:', angle);
    head.innerHTML = angle;
    await sleep(1000);
  }
}
*/

/*
async function readData() {
    var firstTime = true;
    while (readEnable) {
      try {
        var difA = await ads1115.read("0,1"); // p0-p1 differential mode
        rawData[0].innerHTML = "dif chA(0-1):" + difA.toString(16);
        voltage[0].innerHTML = ads1115.getVoltage(difA).toFixed(6) + "V";
        if (firstTime) {
          tare = difA;
          firstTime = false;
        }
  
        weight = difA - tare;
        rawData[1].innerHTML = "rawData - Tare:" + weight.toString(16);
        voltage[1].innerHTML = ads1115.getVoltage(weight).toFixed(6) + "V";

        //  var difB = await ads1115.read("2,3");
        //  rawData[1].innerHTML = "dif chB(2-3):" + difB.toString(16);
        //  voltage[1].innerHTML = ads1115.getVoltage(difB).toFixed(6) + "V";

      } catch (error) {
        console.log(error);
      }
      await sleep(100);
    }
}
*/
