// eslint-disable-next-line react/wrap-multilines
//TODO ============== WebAudio's render block size (in sample-frames) to default ==============
export const RENDER_QUANTUM = 2000;

// The size multiplier for the batch processing frame size (in worker).
export const KERNEL_LENGTH = 8;

// The actual batch processing frame size used in Worker.
export const FRAME_SIZE = KERNEL_LENGTH * RENDER_QUANTUM;

// export const FRAME_SIZE = KERNEL_LENGTH * RENDER_QUANTUM;
// The maximum size of two SharedArrayBuffers between Worker and
// AudioWorkletProcessor.
export const QUEUE_SIZE = 100000;

// WebGPU parallelization parameter
export const WORKGROUP_SIZE = 4;

export const getConstant = (type) => {
    let constants = {}
    switch (type) {
    case 'emulator':
        constants = {
            RENDER_QUANTUM: 2000,
            KERNEL_LENGTH: 8,
            QUEUE_SIZE: 100000,
            WORKGROUP_SIZE: 4
        };

        constants.FRAME_SIZE = constants.KERNEL_LENGTH * constants.RENDER_QUANTUM

        return constants;
    case 'radio':
    default:
        return {
            RENDER_QUANTUM: RENDER_QUANTUM,
            KERNEL_LENGTH: KERNEL_LENGTH,
            FRAME_SIZE: FRAME_SIZE,
            QUEUE_SIZE: QUEUE_SIZE,
            WORKGROUP_SIZE: WORKGROUP_SIZE
        };
    }
};
