import React, { useState, useEffect, useRef } from "react";

export default function HomePage(props) {
  //setAudioStream: A function passed from the parent component, used to store the audio stream (e.g., recorded audio).
  //setFile: A function passed from the parent component, used to store an uploaded audio file.

  const { setAudioStream, setFile } = props;

  const [recordingStatus, setRecordingStatus] = useState("inactive"); //Purpose: Tracks whether recording is in progress ("recording") or stopped ("inactive").

  const [audioChunks, setAudioChunks] = useState([]); // Stores chunks of audio data captured during recording.
  const [duration, setDuration] = useState(0); //Tracks the duration of the current recording.

  const mediaRecorder = useRef(null); //Stores a reference to the MediaRecorder object, which handles audio recording in the browser.

  const mimeType = "audio/webm"; //Determines the output format for the MediaRecorder

  async function startRecording() {
    let tempStream; //Used to store the audio stream from the microphone so it can be passed to the MediaRecorder
    console.log("Start recording");

    try {
      /*
      Asks the user for permission to access their microphone or camera.
      Returns a MediaStream containing the audio (and/or video) data.
      */
      const streamData = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      tempStream = streamData;
    } catch (err) {
      console.log(err.message);
      return;
    }
    setRecordingStatus("recording");

    /*
    Initializes a new MediaRecorder instance using the MediaStream (tempStream) as input.
    Encodes the recorded audio data into the format specified by mimeType
    */

    //create new Media recorder instance using the stream
    const media = new MediaRecorder(tempStream, { type: mimeType });
    mediaRecorder.current = media; //Stores the MediaRecorder instance in the mediaRecorder reference for future use

    /*
    Starts recording audio using the MediaRecorder instance.
    Recording begins immediately, and data will be captured in chunks as it becomes available.
    */
    mediaRecorder.current.start();
    let localAudioChunks = [];
    /*
    Fires whenever a chunk of audio data is available.
    The event.data contains the recorded data as a Blob.
    */
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") {
        return;
      }
      if (event.data.size === 0) {
        return;
      }
      localAudioChunks.push(event.data);
    };
    setAudioChunks(localAudioChunks);
  }

  async function stopRecording() {
    setRecordingStatus("inactive");
    console.log("Stop recording");

    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      setAudioStream(audioBlob);
      setAudioChunks([]);
      setDuration(0);
    };
  }

  useEffect(() => {
    if (recordingStatus === "inactive") {
      return;
    }

    const interval = setInterval(() => {
      setDuration((curr) => curr + 1);
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <main className="flex-1  p-4 flex flex-col gap-3 text-center sm:gap-4  justify-center pb-20">
      <h1 className="font-semibold text-5xl sm:text-6xl md:text-7xl">
        Adara<span className="text-blue-400 bold">Vinod</span>
      </h1>
      <h3 className="font-medium md:text-lg">
        Record <span className="text-blue-400">&rarr;</span> Transcribe{" "}
        <span className="text-blue-400">&rarr;</span> Translate
      </h3>
      <button
        onClick={
          recordingStatus === "recording" ? stopRecording : startRecording
        }
        className="flex specialBtn px-4 py-2 rounded-xl items-center text-base justify-between gap-4 mx-auto w-72 max-w-full my-4"
      >
        <p className="text-blue-400">
          {recordingStatus === "inactive" ? "Record" : `Stop recording`}
        </p>
        <div className="flex items-center gap-2">
          {/* {duration !== 0 && (
                        <p className='text-sm'>{duration}s</p>
                    )} */}
          <i
            className={
              "fa-solid duration-200 fa-microphone " +
              (recordingStatus === "recording" ? " text-rose-300" : "")
            }
          ></i>
        </div>
      </button>
      <p className="text-base">
        Or{" "}
        <label className="text-blue-400 cursor-pointer hover:text-blue-600 duration-200">
          upload{" "}
          <input
            onChange={(e) => {
              const tempFile = e.target.files[0];
              setFile(tempFile);
            }}
            className="hidden"
            type="file"
            accept=".mp3,.wave"
          />
        </label>{" "}
        a mp3 file
      </p>
    </main>
  );
}
