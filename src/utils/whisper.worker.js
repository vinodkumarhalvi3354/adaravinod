import { pipeline } from '@xenova/transformers'
import { MessageTypes } from './presets'

class MyTranscriptionPipeline {
    static task = 'automatic-speech-recognition'
    static model = 'openai/whisper-tiny.en'
    static instance = null

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, null, { progress_callback })
        }

        return this.instance
    }
}

self.addEventListener('message', async (event) => {
    const { type, audio } = event.data
    if (type === MessageTypes.INFERENCE_REQUEST) {
        await transcribe(audio)
    }
})

async function transcribe(audio) {
    sendLoadingMessage('loading')

    let pipeline

    try {
        pipeline = await MyTranscriptionPipeline.getInstance(load_model_callback) //The load_model_callback function is responsible for handling progress updates while loading the model.
    } catch (err) {
        console.log(err.message)
    }

    sendLoadingMessage('success')

    const stride_length_s = 5
    /*
    top_k :
    Sets the number of "beams" (alternative transcriptions) considered during the decoding process.
    A value of 0 indicates "greedy decoding," where only the highest-probability sequence is selected without exploring alternatives.
    do_sample:
    Controls whether sampling is used in the decoding process.
    When false, the transcription is deterministic, always producing the same result for the same input.
    chunk_length:
    Specifies the length of each audio chunk (in seconds) to be processed at one time.
    In this case, the audio is divided into 30-second segments for transcription.
    stride_length:
    Sets the length (in seconds) of overlapping audio between consecutive chunks.
    stride_length_s ensures that some context is preserved across chunks, which is critical for accurate transcription.
    return_timestamps:
    Sets the length (in seconds) of overlapping audio between consecutive chunks.
    stride_length_s ensures that some context is preserved across chunks, which is critical for accurate transcription.

    */

    const generationTracker = new GenerationTracker(pipeline, stride_length_s)
    await pipeline(audio, {
        top_k: 0,
        do_sample: false,
        chunk_length: 30,
        stride_length_s,
        return_timestamps: true,
        callback_function: generationTracker.callbackFunction.bind(generationTracker),
        chunk_callback: generationTracker.chunkCallback.bind(generationTracker)
    })
    generationTracker.sendFinalResult()
}

/*
If the status is 'progress', the function extracts the following:
file: The file being loaded.
progress: The percentage of progress made (e.g., 50%).
loaded: Bytes loaded so far.
total: Total bytes to be loaded.
*/

async function load_model_callback(data) {
    const { status } = data
    if (status === 'progress') {
        const { file, progress, loaded, total } = data
        sendDownloadingMessage(file, progress, loaded, total)
    }
}

function sendLoadingMessage(status) {
    self.postMessage({
        type: MessageTypes.LOADING,
        status
    })
}

async function sendDownloadingMessage(file, progress, loaded, total) {
    self.postMessage({
        type: MessageTypes.DOWNLOADING,
        file,
        progress,
        loaded,
        total
    })
}

/*
GenerationTracker is the central class managing transcription chunking, decoding, and result handling. 
It ensures efficient and real-time transcription updates with timestamps, while its methods interact seamlessly with the transcription pipeline to process data progressively and deliver formatted results to the main thread.
*/

class GenerationTracker {
    constructor(pipeline, stride_length_s) {
        this.pipeline = pipeline
        this.stride_length_s = stride_length_s
        this.chunks = []
        this.time_precision = pipeline?.processor.feature_extractor.config.chunk_length / pipeline.model.config.max_source_positions
        this.processed_chunks = []
        this.callbackFunctionCounter = 0
    }

    sendFinalResult() {
        self.postMessage({ type: MessageTypes.INFERENCE_DONE })
    }

    /*
    Increments the counter to throttle updates.
    Decodes the best transcription candidate (bestBeam) into text using the tokenizer.
    */

    callbackFunction(beams) {
        this.callbackFunctionCounter += 1
        if (this.callbackFunctionCounter % 10 !== 0) {
            return
        }

        const bestBeam = beams[0]
        let text = this.pipeline.tokenizer.decode(bestBeam.output_token_ids, {
            skip_special_tokens: true
        })

        const result = {
            text,
            start: this.getLastChunkTimestamp(),
            end: undefined
        }

        createPartialResultMessage(result)
    }

    /*
    Adds the new chunk (data) to the chunks array.
    Decodes all chunks into text and timestamped segments using _decode_asr().
    Processes each decoded chunk to clean up the results.
    */

    chunkCallback(data) {
        this.chunks.push(data)
        const [text, { chunks }] = this.pipeline.tokenizer._decode_asr(
            this.chunks,
            {
                time_precision: this.time_precision,
                return_timestamps: true,
                force_full_sequence: false
            }
        )

        this.processed_chunks = chunks.map((chunk, index) => {
            return this.processChunk(chunk, index)
        })


        createResultMessage(
            this.processed_chunks, false, this.getLastChunkTimestamp()
        )
    }

    getLastChunkTimestamp() {
        if (this.processed_chunks.length === 0) {
            return 0
        }
    }

    /*
    Extracts the text and timestamp from the chunk.
    Ensures timestamps are rounded for better readability.
    */

    processChunk(chunk, index) {
        const { text, timestamp } = chunk
        const [start, end] = timestamp

        return {
            index,
            text: `${text.trim()}`,
            start: Math.round(start),
            end: Math.round(end) || Math.round(start + 0.9 * this.stride_length_s)
        }

    }
}

function createResultMessage(results, isDone, completedUntilTimestamp) {
    self.postMessage({
        type: MessageTypes.RESULT,
        results,
        isDone,
        completedUntilTimestamp
    })
}

function createPartialResultMessage(result) {
    self.postMessage({
        type: MessageTypes.RESULT_PARTIAL,
        result
    })
}

