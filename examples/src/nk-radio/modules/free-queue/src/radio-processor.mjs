import FreeQueue from './free-queue.js';
import { getConstant} from './constants.js';
const { RENDER_QUANTUM, FRAME_SIZE } = getConstant('radio');

const ExpectedPrimingCount = FRAME_SIZE / RENDER_QUANTUM;

/**
 * A simple AudioWorkletProcessor node.
 *
 * @class BasicProcessor
 * @extends AudioWorkletProcessor
 */
class BasicProcessor extends AudioWorkletProcessor {
    /**
     * Constructor to initialize, input and output FreeQueue instances
     * and atomicState to synchronise Worker with AudioWorklet
     * @param {Object} options AudioWorkletProcessor options
     *    to initialize inputQueue, outputQueue and atomicState
     */
    constructor(options) {
        super();
        this.inputQueue = options.processorOptions.inputQueue;
        this.outputQueue = options.processorOptions.outputQueue;
        this.atomicState = options.processorOptions.atomicState;
        Object.setPrototypeOf(this.inputQueue, FreeQueue.prototype);
        Object.setPrototypeOf(this.outputQueue, FreeQueue.prototype);

        this.primingCounter = 0;
    }

    /**
     * The AudioWorkletProcessor's isochronous callback.
     * @param {Array<Float32Array>>} inputs
     * @param {Array<Float32Array>>} outputs
     * @returns {boolean}
     */
    process(inputs, outputs, parameters) {
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
        if (this.primingCounter > ExpectedPrimingCount) {
            const didPull = this.outputQueue.pull(output, RENDER_QUANTUM);
            if (!didPull) {
                console.log('[basic-processor.js] Not enough data in outputQueue');
                return false;
            }
        } else {
            this.primingCounter++;
        }

        const didPush = this.inputQueue.push(input, RENDER_QUANTUM);

        if (!didPush) {
            console.log('[basic-processor.js] Not enough space in inputQueue');
            return false;
        }

        // Notify worker.js if `inputQueue` has enough data to perform the batch
        // processing of FRAME_SIZE.
        if (this.inputQueue.hasEnoughFramesFor(FRAME_SIZE)) {
            Atomics.store(this.atomicState, 0, 1);
            Atomics.notify(this.atomicState, 0);
        }

        return true;
    }
}

registerProcessor('radio-processor', BasicProcessor);