var aud=document.getElementById("audio");
var video = document.getElementById('video');
let startButton = document.querySelector("#start-rec");
let stopButton = document.querySelector("#stop-rec");
let downloadButton = document.getElementById("downloadButton");
let logElement = document.getElementById("log");
var recordingTimeMS = 9000;
var input=document.getElementById("upload");
var para=document.getElementById("time");


const mapper={};
input.addEventListener("change", handleFiles);
const ac = new AudioContext();
var count=0;



const seconds = (number, [inMin, inMax], [outMin, outMax]) => {
  return (number - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
}


async function handleFiles(event) {
  var files = event.target.files;
  //getTheEnergies(files);'
  var chunkSize=50;
  const buffer = await input.files[0].arrayBuffer();
  const audioBuffer = await ac.decodeAudioData(buffer);
  const float32Array = audioBuffer.getChannelData(0);
  console.log(audioBuffer);
  
  let i = 0;
  const length = float32Array.length;
  while (i < length) {
    let val=float32Array.slice(i, i += chunkSize).reduce(function (total, value) {
    return Math.max(total, Math.abs(value))})*100;
    if(val>75 || val<=25){
      
      
      mapper[(parseInt(seconds(i ,[0,7504986],[0,156])))]=val;
    }
    i=i+48000;
  }
  console.log(mapper);



  $("#src").attr("src", URL.createObjectURL(files[0]));
  aud.load();
  aud.addEventListener("loadedmetadata",()=>{

    recordingTimeMS=aud.duration;
    recordingTimeMS=recordingTimeMS*1000;
    console.log(recordingTimeMS);
  })
}



function log(msg) {
  logElement.innerHTML += msg + "\n";
}

function wait(delayInMS) {
  return new Promise(resolve => setTimeout(resolve, delayInMS));
}

function startRecording(stream, lengthInMS) {
  let recorder = new MediaRecorder(stream);
  let data = [];
  let pause=document.getElementById("pause");
  pause.addEventListener("click",()=>{
    if(recorder.state === "recording") {
      recorder.pause();
      aud.pause();
      console.log(aud.currentTime);
      // recording paused
    } else if(recorder.state === "paused") {
      recorder.resume();
      console.log("resume");
      aud.play();
      // resume recording
    }
  });

  setInterval(()=>{
    const  time=parseInt(aud.currentTime);
    if(mapper[time]!==undefined){
      const [track] = stream.getVideoTracks();
      const capabilities = track.getCapabilities();
      const settings = track.getSettings();
    }
      if (!('zoom' in settings)) {
        console.log('Zoom is not supported by ' + track.label);
      }
      track.applyConstraints({advanced: [ {zoom: seconds(mapper[time],[0,100],[1,10])} ]});

},100);

   recorder.ondataavailable = event =>{
    data.push(event.data);
    data.push(event.data);
    count++;
    console.log("event trigger ");
    console.log(data);
  } 
  recorder.start();
  log(recorder.state + " for " + (lengthInMS/1000) + " seconds...");
 
  
  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = event => reject(event.name);
  });
  
  let recorded = wait(lengthInMS/10).then(
    () => recorder.state == "recording" && recorder.stop()
  );
  
  return Promise.all([
    stopped,
    recorded
  ])
  .then(() => data);
}

function stop(stream) {
  stream.getTracks().forEach(track => track.stop());
}


stopButton.addEventListener("click", function() {
  /*var stream = video.srcObject;
  var tracks = stream.getTracks();
  for (var i = 0; i < tracks.length; i++) {
      var track = tracks[i];
      track.stop();
  }
  aud.pause();
  video.srcObject = null;*/
 
  aud.pause();
  stop(video.srcObject);
}, false);
 
 
startButton.addEventListener("click", function() {
  /*vendorUrl = window.URL || window.webkitURL;
  stream = navigator.mediaDevices.getUserMedia({ video: true});
  if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
          .then(function (stream) {
              video.srcObject = stream;
              aud.play();
          }).catch(function (error) {
              console.log("Something went wrong!");
          });
  }*/

  navigator.mediaDevices.getUserMedia({
    video: {zoom : true}
  }).then(stream => {
    video.srcObject = stream;
    aud.play();
    downloadButton.href = stream;
    video.captureStream = video.captureStream || video.mozCaptureStream;
    return new Promise(resolve => video.onplaying = resolve);
  }).then(() => startRecording(video.captureStream(), recordingTimeMS))
  .then (recordedChunks => {
    let recordedBlob = new Blob(recordedChunks, { type: "video/mp4" });
    var videoUrl = URL.createObjectURL(recordedBlob);
    downloadButton.href = videoUrl;
    downloadButton.download = "RecordedVideo.mp4";
    downloadButton.click();
    log("Successfully recorded " + recordedBlob.size + " bytes of " +
        recordedBlob.type + " media.");
    console.log(count);
  })
  .catch((error) => {
    if (error.name === "NotFoundError") {
      log("Camera or microphone not found. Can't record.");
    } else {
      log(error);
    }
  });
}, false);

   

$(function () {
  start();
});  


// navigator.mediaDevices.getUserMedia({video: { zoom: true }})
// .then(mediaStream => {
//   document.querySelector('video').srcObject = mediaStream;

//   const [track] = mediaStream.getVideoTracks();
//   const capabilities = track.getCapabilities();
//   const settings = track.getSettings();

//   if (!('zoom' in settings)) {
//     return Promise.reject('Zoom is not supported by ' + track.label);
//   }
//     track.applyConstraints({advanced: [ {zoom: seconds(idx,[0,100],[1,10]);} ]});

// })
// .catch(error => ChromeSamples.log('Argh!', error.name || error));


