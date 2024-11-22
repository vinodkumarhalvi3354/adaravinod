import React, { useRef, useEffect } from 'react'

export default function FileDisplay(props) { //Getting props from parent(App.js)
    /*
    handleAudioReset: A callback function to reset the audio (likely clears file and audioStream).
    file: Represents an uploaded audio file, likely an instance of the File object.
    audioStream: Represents an audio stream (e.g., recorded from the microphone).
    handleFormSubmission: A callback function to handle form submission (likely processes the file or stream).

    */
    const { handleAudioReset, file, audioStream, handleFormSubmission } = props

    /**
     audioRef: A mutable reference created using the React useRef hook.
    Used to interact directly with the DOM element for the <audio> player.      
    Unlike state, changes to audioRef do not trigger a re-render.
    useRef(): React hook that returns an object with a .current property to hold a reference to a DOM node or a mutable value.
     */
    const audioRef = useRef()

    /*
    Executes code after the component renders or when dependencies (audioStream and file) change.
    */

    useEffect(() => {
        if (!file && !audioStream) { return } //Checks if file or audioStream presents.Exits the function early, preventing further execution if neither file nor audio stream exists.
        if (file) {
            console.log('HERE FILE', file)
            //The URL.createObjectURL() method is a built-in JavaScript function that generates a temporary, unique URL that points to an object (usually a File or Blob) in memory. This URL can be used by the browser to access and manipulate the object without requiring a server or external resources.
            audioRef.current.src = URL.createObjectURL(file) //based on the file uploaded it will set src attribute of the <audio> to blob url by directly accessing DOM element without need to rerender
        } else {
            console.log('HERE AUDIO', audioStream)
            audioRef.current.src = URL.createObjectURL(audioStream)
        }
    }, [audioStream, file])


    return (
        <main className='flex-1  p-4 flex flex-col gap-3 text-center sm:gap-4 justify-center pb-20 w-full max-w-prose mx-auto'>
            <h1 className='font-semibold text-4xl sm:text-5xl md:text-6xl'>Your <span className='text-blue-400 bold'>File</span></h1>
            <div className=' flex flex-col text-left my-4'>
                <h3 className='font-semibold'>Name</h3>
                <p className='truncate'>{file ? file?.name : 'Custom audio'}</p>
            </div>
            <div className='flex flex-col mb-2'>
                <audio ref={audioRef} className='w-full' controls>
                    Your browser does not support the audio element.
                </audio>
            </div>
            <div className='flex items-center justify-between gap-4'>
                <button onClick={handleAudioReset} className='text-slate-400 hover:text-blue-600 duration-200'>Reset</button>
                <button onClick={handleFormSubmission} className='specialBtn  px-3 p-2 rounded-lg text-blue-400 flex items-center gap-2 font-medium '>
                    <p>Transcribe</p>
                    <i className="fa-solid fa-pen-nib"></i>
                </button>
            </div>
        </main>
    )
}
