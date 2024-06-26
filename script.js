class State {
  static p_state = [];
  static extreme_flag = false;
  static extreme_status = NaN;
  static previous_landmark = NaN
  static Emotion_change = NaN;
  static Vertical_score = NaN;
  static Horizontal_score = NaN;
}

let video = document.getElementById("video");
let model;
// declare a canvas variable and get its context
// let canvas = document.getElementById("canvas");
// let ctx = canvas.getContext("2d");

const setupCamera = () => {
  navigator.mediaDevices
    .getUserMedia({
      video: { width: 600, height: 400 },
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    });
};

const detectFaces = async () => {
  const returnTensors = false;
  const flipHorizontal = true;
  const annotateBoxes = true;
  const predictions = await model.estimateFaces(
    video,
    returnTensors,
    flipHorizontal,
    annotateBoxes
  );
  //console.log(predictions)
  if (predictions.length > 1)
    // alert("More then 1 faces detected")
    document.getElementById("faces").innerText = predictions.length;

  if (predictions.length > 0) {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("faces").innerText = predictions.length;
    for (let i = 0; i < predictions.length; i++) {
      if (returnTensors) {
        predictions[i].topLeft = predictions[i].topLeft.arraySync();
        predictions[i].bottomRight = predictions[i].bottomRight.arraySync();
        if (annotateBoxes) {
          predictions[i].landmarks = predictions[i].landmarks.arraySync();
        }
      }

      if (annotateBoxes) {
        const landmarks = predictions[i].landmarks;

        if (landmarks == State.previous_landmark)
          alert("Image Found")

        // console.log("present",landmarks)
        // console.log("Previous",State.previous_landmark)
        State.previous_landmark = landmarks

        var Status = [];

        var extreme_threshold = 0.1;

        // Down
        if (
          landmarks[4][1] < landmarks[0][1] &&
          landmarks[5][1] < landmarks[1][1]
        ) {
          if (!State.p_state.includes(Status))
            if (
              landmarks[0][1] - landmarks[4][1] > 35 ||
              landmarks[1][1] - landmarks[5][1] > 35
            ) {
              Status.push("Extreme Down");
              State.Vertical_score = 0.8 - ((((landmarks[0][1] - landmarks[4][1])/100)+((landmarks[1][1] - landmarks[5][1])/100))/2)

            } else if (
              landmarks[0][1] - landmarks[4][1] > 0 ||
              landmarks[1][1] - landmarks[5][1] > 0
            ) {
              Status.push("Down");
            State.Vertical_score = 0.8 - ((((landmarks[0][1] - landmarks[4][1])/100)+((landmarks[1][1] - landmarks[5][1])/100))/2)

            }
            else if ( (
              landmarks[0][1] - landmarks[4][1] < 0 ||
              landmarks[1][1] - landmarks[5][1] < 0
            ) && (
              landmarks[0][1] - landmarks[4][1] >-13 ||
              landmarks[1][1] - landmarks[5][1] >-13 
            )){
              Status.push("Towards Down");
              State.Vertical_score = 0.9 - ((((landmarks[0][1] - landmarks[4][1])/100)+((landmarks[1][1] - landmarks[5][1])/100))/2)

            }

            // console.log((landmarks[0][0] - landmarks[4][0] ))
            // State.Vertical_score = 0.8 - ((((landmarks[0][1] - landmarks[4][1])/100)+((landmarks[1][1] - landmarks[5][1])/100))/2)
          // Down-Right
          if (landmarks[4][0] < landmarks[0][0]) {
            if (!State.p_state.includes(Status))
              if (landmarks[0][0] - landmarks[4][0] > 30) {
                Status.push("Extreme Right");

              } 
              else if (landmarks[0][0] - landmarks[4][0] > 0) {
                Status.push("Right");
                State.Horizontal_score = 0.6 - ((landmarks[0][0] - landmarks[4][0])/100)
                
              }
            }
            else if ((landmarks[0][0] - landmarks[4][0] < -30) && (landmarks[0][0] - landmarks[4][0] >-40))
            {
              
              State.Horizontal_score = 1 - ((landmarks[0][0] - landmarks[4][0])/100 +0.4)
             
            }
          else if ((landmarks[0][0] - landmarks[4][0] < 0) && (landmarks[0][0] - landmarks[4][0] >-30))
            {
              
              State.Horizontal_score = 0.9 - ((landmarks[0][0] - landmarks[4][0])/100 +0.3)
              Status.push("Towards Right")
            }
          

          // Down-Left
          else if (landmarks[1][0] < landmarks[5][0]) {
            if (!State.p_state.includes(Status))
              if (landmarks[5][0] - landmarks[1][0] > 30) {
                Status.push("Extreme Left");
              } else if (landmarks[5][0] - landmarks[1][0] > 0) {
                Status.push("Left");
                State.Horizontal_score = 0.6 - ((landmarks[5][0] - landmarks[1][0])/100 )
              }
            }

            else if  ((landmarks[5][0] - landmarks[1][0] < -30) &&  (landmarks[5][0] - landmarks[1][0] >-40) )
            {
             
              
              State.Horizontal_score = 1 - ((landmarks[5][0] - landmarks[1][0])/100 +0.4)
            }
          else if  ((landmarks[5][0] - landmarks[1][0] < 0) &&  (landmarks[5][0] - landmarks[1][0] >-30) )
          {
            Status.push("Towards Left")
            
            State.Horizontal_score = 0.9 - ((landmarks[5][0] - landmarks[1][0])/100 +0.3)
          }
          
        }
        // Up
        else if (
          landmarks[4][1] > landmarks[0][1] &&
          landmarks[5][1] > landmarks[1][1]
        ) {
          if (!State.p_state.includes(Status))
            if (
              landmarks[4][1] - landmarks[0][1] > 35 ||
              landmarks[5][1] - landmarks[1][1] > 35
            ) {
              Status.push("Extreme Up");
              State.Vertical_score = 1 - ((((landmarks[4][1] - landmarks[0][1])/100)+((landmarks[5][1] - landmarks[1][1])/100))/2)

            } else if (
              landmarks[4][1] - landmarks[0][1] > 25 ||
              landmarks[5][1] - landmarks[1][1] > 25
            ) {
              Status.push("Up");
              State.Vertical_score = 1 - ((((landmarks[4][1] - landmarks[0][1])/100)+((landmarks[5][1] - landmarks[1][1])/100))/2)

            } 
            else if ((
              landmarks[4][1] - landmarks[0][1] > 13 ||
              landmarks[5][1] - landmarks[1][1] > 13
            ) && (
              landmarks[4][1] - landmarks[0][1] < 25 ||
              landmarks[5][1] - landmarks[1][1] < 25
            )) {
              Status.push("Normal");
              State.Vertical_score = 1.1 - ((((landmarks[4][1] - landmarks[0][1])/100)+((landmarks[5][1] - landmarks[1][1])/100))/2)

            } 
          
            // console.log((landmarks[0][0] - landmarks[4][0]))
            // State.Vertical_score = 1 - ((((landmarks[4][1] - landmarks[0][1])/100)+((landmarks[5][1] - landmarks[1][1])/100))/1.4)

          // Up-Right
          if (landmarks[4][0] < landmarks[0][0]) {
            if (!State.p_state.includes(Status))
              if (landmarks[0][0] - landmarks[4][0] > 30) {
                Status.push("Extreme Right");
              } else if (landmarks[0][0] - landmarks[4][0] > 0){
                Status.push("Right");
                State.Horizontal_score = 0.6 - ((landmarks[0][0] - landmarks[4][0])/100)
              }
            }

          else if ((landmarks[0][0] - landmarks[4][0] < -30) && (landmarks[0][0] - landmarks[4][0] >-40))
              {
                
                State.Horizontal_score = 1 - ((landmarks[0][0] - landmarks[4][0])/100 +0.4)
               
              }
          else if ((landmarks[0][0] - landmarks[4][0] < 0) && (landmarks[0][0] - landmarks[4][0] >-30))
              {
                
                State.Horizontal_score = 0.9 - ((landmarks[0][0] - landmarks[4][0])/100 +0.3)
                Status.push("Towards Right")
              }
          

          // Up-Left
          else if (landmarks[1][0] < landmarks[5][0]) {
            if (!State.p_state.includes(Status))
              if (landmarks[5][0] - landmarks[1][0] > 30) {
                Status.push("Extreme Left");
              } else if (landmarks[5][0] - landmarks[1][0] > 0){
                Status.push("Left");
                State.Horizontal_score = 0.6 - ((landmarks[5][0] - landmarks[1][0])/100 )
              }
            }

            else if  ((landmarks[5][0] - landmarks[1][0] < -30) &&  (landmarks[5][0] - landmarks[1][0] >-40) )
              {
               
                
                State.Horizontal_score = 1 - ((landmarks[5][0] - landmarks[1][0])/100 +0.4)
              }
            else if  ((landmarks[5][0] - landmarks[1][0] < 0) &&  (landmarks[5][0] - landmarks[1][0] >-30) )
            {
              Status.push("Towards Left")
              
              State.Horizontal_score = 0.9 - ((landmarks[5][0] - landmarks[1][0])/100 +0.3)
            }
            
          
        }
        document.getElementById('hscore').innerText = State.Horizontal_score
        document.getElementById('vscore').innerText = State.Vertical_score

        if (Status.length != 0) {
          //If there is a change in position
          if (!State.p_state.includes(Status)) {
            // console.log("Position Changed")
            // console.log(State.p_state,Status)
            State.p_state = Status;
            document.getElementById("status").innerText = State.p_state;


            console.log("Done");
          }
          if (
            Status.includes("Extreme Right") ||
            Status.includes("Extreme Left") ||
            Status.includes("Extreme Up") ||
            Status.includes("Extreme Down")
          ) {


            // console.log("Extreme",State.extreme_flag,State.extreme_status)
            if (State.extreme_flag == false) {
              var d = new Date();
              var minutes = 1000 * 60;
              var n = d.getTime();
              State.extreme_status = n / minutes;
              State.extreme_flag = true;
            } else {
              var d = new Date();
              var minutes = 1000 * 60;
              var n = d.getTime();
              if (n / minutes - State.extreme_status >= extreme_threshold) {
                threshold = true
                alert("Unattentive for more then 10 seconds");
              }
              else
                threshold = false

            }
            // ------------------ Face Tracking API CAll -----------------
            // const res = await fetch("http://localhost:5000/position", {
            //   method: "POST",
            //   mode: "cors",
            //   headers: {
            //     "Content-Type": "application/json",
            //   },
            //   body: JSON.stringify({
            //     SID: "1",
            //     Position: State.p_state.toString(),
            //     // Cordinates: landmarks.toString(),
            //     Threshold: threshold.toString(),
            //     Faces: predictions.length.toString(),
            //   }),
            // });
          } else State.extreme_flag = false;
        }
      }
    }
  }
};

setupCamera();
video.addEventListener("loadeddata", async () => {
  model = await blazeface.load();
  // call detect faces every 100 milliseconds or 10 times every second
  setInterval(detectFaces, 100);
});
console.log("script started");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  // faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  // faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models"),
]).then(startVideo);

function startVideo() {
  console.log("LOading models");
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      const video = document.getElementById("video");
      video.addEventListener("playing", () => {
        console.log("PLaying");
        // const canvas = faceapi.createCanvasFromMedia(video);
        // document.body.append(canvas);
        const displaySize = { width: video.width, height: video.height };
        // faceapi.matchDimensions(canvas, displaySize);
        setInterval(async () => {
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();
          // const resizedDetections = faceapi.resizeResults(
          //   detections,
          //   displaySize
          // );
          // document.getElementById("exp").innerText = detections['expressions'];
          if (detections.length > 0) {
            var obj = detections[0].expressions
            // var arr = Object.keys( obj ).map(function ( key ) { return obj[key]; });
            // console.log()
            Exp = Object.keys(obj).reduce(function (a, b) { return obj[a] > obj[b] ? a : b })
            if (State.Emotion_change == NaN)
              State.Emotion_change = Exp
            if (State.Emotion_change == Exp)
            // document.getElementById("exp").innerText = "No Change -"+Exp;
            { }
            else {
              document.getElementById("exp").innerText = "Emotion Changed from " + State.Emotion_change + " to " + Exp;
              
              // ----------------Expression API Call-------------------------------
              //     const res = await fetch("http://localhost:5000/emotion", {
              //   method: "POST",
              //   mode: "cors",
              //   headers: {
              //     "Content-Type": "application/json",
              //   },
              //   body: JSON.stringify({
              //     SID: "1",
              //     Expression: Exp.toString(),
              //   }),
              // });
            }
            State.Emotion_change = Exp

          }

        }, 100);
      });
      console.log("STarting play");
      video.srcObject = stream;
      video.play();
    })
    .catch((err) => console.error(err));
}
