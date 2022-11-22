//https://codesandbox.io/s/arduino-simulator-js-9z159?file=/src/App.js:76-110


const arduinoCode = `
void setup() {
  // put your setup code here, to run once:
  pinMode(7, OUTPUT); 
}

void loop() {
  // put your main code here, to run repeatedly:
  digitalWrite(7, HIGH);
  delay(1000);
  digitalWrite(7, LOW);
  delay(1000);
}

`;



const runCode = async () => {
// Compile the arduino source code
const result = await fetch('https://hexi.wokwi.com/build', {
  method: 'post',
  body: JSON.stringify({ sketch: arduinoCode }),
  headers: {
    'Content-Type': 'application/json'
  }
});
const { hex, stderr } = await result.json();
if (!hex) {
  alert(stderr);

}
//const { data } = parse(hex);
//const progData = new Uint8Array(data);
console.log(result);
console.log(typeof(stderr));
console.log(stderr);
console.log(hex);
intelHex = parseIntelHex(hex);
console.log(intelHex);
}

runCode()