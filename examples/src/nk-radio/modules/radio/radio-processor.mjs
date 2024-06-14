import FreeQueue from './free-queue.js';
import { getConstant} from './constants.js';
const { RENDER_QUANTUM, FRAME_SIZE } = getConstant('radio');

const ExpectedPrimingCount = FRAME_SIZE / RENDER_QUANTUM;


class BasicProcessor extends AudioWorkletProcessor {

    constructor(options) {
        super();
/*
        this.inputQueue = options.processorOptions.inputQueue;
        this.outputQueue = options.processorOptions.outputQueue;
        this.atomicState = options.processorOptions.atomicState;
        Object.setPrototypeOf(this.inputQueue, FreeQueue.prototype);
        Object.setPrototypeOf(this.outputQueue, FreeQueue.prototype);
*/
        this.primingCounter = 0;
    }


    process(inputs, outputs, parameters) {

			let inputBuffer = inputs.inputBuffer;
			window["samplerate"] = inputBuffer.sampleRate;
			let bufferSize = window["samplerate"] / 25;
			window["channels"] = inputBuffer.numberOfChannels;
			const dataArray = [ window["channels"] ];
			for ( let i = 0; i < window["channels"]; i++ ) {
				dataArray[i] = new Float64Array(bufferSize);
			}
			for ( let i = 0; i < bufferSize; i++ ) {
				for ( let j = 0; j < window["channels"]; j++ ) {
					dataArray[j][i] = inputBuffer.getChannelData(j)[i];
				}
			}
			if ( window["queue"] != undefined ) {
				const r = window["queue"].push( dataArray, bufferSize );
				window["queue"].printAvailableReadAndWrite();
			}

/*
        const input = inputs[0];
        const output = outputs[0];

        // console.log('🟢 ==== processor ==== 🟢',{
        //     input: input,
        //     output: output,
        //     parameters: parameters
        // })
        // The first |ExpectedPrimingCount| number of callbacks won't get any
        // data from the queue because the it's empty. This check is not perfect;
        // waking up the worker can be slow and priming N callbacks might not be
        // enough.


        console.log("primingCounter: " + this.primingCounter);
        console.log("ExpectedPrimingCount: " + ExpectedPrimingCount);

        if (this.primingCounter > ExpectedPrimingCount) {
            const didPull = this.outputQueue.pull(output, RENDER_QUANTUM);
            if (!didPull) {
                console.log("pull: false");
                return false;
            }
        } else {
            console.log("pull: true");
            this.primingCounter++;
        }

        const didPush = this.inputQueue.push(input, RENDER_QUANTUM);
        if (!didPush) {
            console.log("push: false");
            return false;
        }

        console.log("push: true");

        // Notify worker.js if `inputQueue` has enough data to perform the batch
        // processing of FRAME_SIZE.
        if (this.inputQueue.isFrameAvailable(FRAME_SIZE)) {
            Atomics.store(this.atomicState, 0, 1);
            Atomics.notify(this.atomicState, 0);
        }
*/

        return true;
    }
}

registerProcessor('radio-processor', BasicProcessor);