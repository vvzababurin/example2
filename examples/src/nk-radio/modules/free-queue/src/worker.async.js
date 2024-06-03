import { getConstant } from './constants.js';
import { FreeQueue } from './free-queue.js';
const { FRAME_SIZE }  = getConstant(self.name.toLowerCase());

let inputQueue = null;
let outputQueue = null;
let atomicState = null;
let gpuProcessor = null;
let inputBuffer = null;
let outputBuffer = null
let irArray = null;
let sampleRate = null;

// Performance metrics
let lastCallback = 0;
let averageTimeSpent = 0;
let timeElapsed = 0;
let runningAverageFactor = 1;

function executeLocked(callback, atomicState, index = 0, value = 0) {
    async function tryGetLock() {
        while (await (Atomics.waitAsync(atomicState, index, value)).value === 'ok') {
                callback();
                Atomics.store(atomicState, index, 0);
        }
    }

    tryGetLock();
}

// processing.
const initialize = (messageDataFromMainThread) => {
    ({inputQueue, outputQueue, atomicState, irArray, sampleRate} = messageDataFromMainThread);
    Object.setPrototypeOf(inputQueue, FreeQueue.prototype);
    Object.setPrototypeOf(outputQueue, FreeQueue.prototype);

    // A local buffer to store data pulled out from `inputQueue`.
    inputBuffer = [new Float64Array(FRAME_SIZE), new Float64Array(FRAME_SIZE)]
    //TODO Подключить gpu processor
    // Create an instance of GPUProcessor and provide an IR array.
    // gpuProcessor = new GPUProcessor();
    // gpuProcessor.setIRArray(irArray);
    // await gpuProcessor.initialize();

    // How many "frames" gets processed over 1 second (1000ms)?
    runningAverageFactor = sampleRate / FRAME_SIZE;

    console.log('[worker.js] initialize', runningAverageFactor);
};


const process = () => {
    const data = inputQueue.pull(inputBuffer, FRAME_SIZE)
    if (!data) {
        console.error('[worker.js] Pulling from inputQueue failed.');
        return;
    }

    // 1. Bypassing
    outputBuffer = inputBuffer;
    // 2. Bypass via GPU.
    // const dataGPU  = await gpuProcessor.processBypass([inputBuffer[0]]);
    // outputBuffer[0] = dataGPU
    // outputBuffer[1] = await gpuProcessor.processBypass(inputBuffer[1]);
    // 3. Convolution via GPU
    // const dataGPU = await gpuProcessor.processConvolution(inputBuffer[0]);
    // outputBuffer[1] = dataGPU
    // outputBuffer[0] = dataGPU


    if (!outputQueue.push(outputBuffer, FRAME_SIZE)) {
        console.error('[worker.js] Pushing to outputQueue failed.');
        return;
    }
};

/**
 * Worker message event handler.
 * This will initialize worker with FreeQueue instance and set loop for audio
 * processing. 
 */
self.onmessage = (msg) => {
    if (msg.data.type === 'init') {
        initialize(msg.data.data)

        self.postMessage({
            status: true
        });

        executeLocked(() => {
            const processStart = performance.now();
            const callbackInterval = processStart - lastCallback;
            lastCallback = processStart;
            timeElapsed += callbackInterval;

            process()
            console.log('################# INDEX 0 #################')

            // Approximate running average of process() time.
            const timeSpent = performance.now() - processStart;
            averageTimeSpent -= averageTimeSpent / runningAverageFactor;
            averageTimeSpent += timeSpent / runningAverageFactor;

            // Throttle the log by 1 second.
            if (timeElapsed >= 1000) {
                console.log(
                    `[worker.js] process() = ${timeSpent.toFixed(3)}ms : ` +
                    `avg = ${averageTimeSpent.toFixed(3)}ms : ` +
                    `callback interval = ${(callbackInterval).toFixed(3)}ms`);
                timeElapsed -= 1000;
            }

            Atomics.store(atomicState, 0, 0);
        }, atomicState, 0, 0)

        executeLocked(() => {
            const processStart = performance.now();
            const callbackInterval = processStart - lastCallback;
            lastCallback = processStart;
            timeElapsed += callbackInterval;

            console.log('################# INDEX 1 #################')

            // Approximate running average of process() time.
            const timeSpent = performance.now() - processStart;
            averageTimeSpent -= averageTimeSpent / runningAverageFactor;
            averageTimeSpent += timeSpent / runningAverageFactor;

            // Throttle the log by 1 second.
            if (timeElapsed >= 1000) {
                console.log(
                    `[worker.js] process() = ${timeSpent.toFixed(3)}ms : ` +
                    `avg = ${averageTimeSpent.toFixed(3)}ms : ` +
                    `callback interval = ${(callbackInterval).toFixed(3)}ms`);
                timeElapsed -= 1000;
            }

            Atomics.store(atomicState, 1, 0);
        }, atomicState, 1, 0)

    }
};
