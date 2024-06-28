import Assets from './assets.js'
import isEmpty from '../isEmpty/index.mjs';

const nkMemory = window.document.querySelector('nk-memory')

let audioContext = null;

let toggleButton = null;
let isPlaying = false;
let messageView = null;

let impulseResponseSelect = {
    value: 'TEST'
};

const CONFIG = {
    audio: {
        ctx: false,
        analyser: false,
        waveform: false,
        master: {
            gain: false
        }
    },
    html: {
        scope: {
            canvas: false,
            context:false
        },
        button: {
            start: false,
            radios: {
                this: false,
                length: false
            }
        }
    },
    player: {
        start: false,
        stop: false,
        isPlaying: false
    },
    stream: {
        song: false,
        source: false,
        path: false,
    },
    web: {
        crossOrigin: 'anonymous'
    }
}

const detectFeaturesAndReport = (viewElement) => {
    let areRequiremensMet = true;

    if (typeof navigator.gpu !== 'object') {
        viewElement.textContent +=
            'ERROR: WebGPU is not available on your browser.\r\n';
        areRequiremensMet = false;
    }

    if (typeof SharedArrayBuffer !== 'function') {
        viewElement.textContent +=
            'ERROR: SharedArrayBuffer is not available on your browser.\r\n';
        areRequiremensMet = false;
    }

    if (areRequiremensMet) {
        viewElement.textContent +=
            'All requirements have been met. The experiment is ready to run.\r\n';
    }

    return areRequiremensMet;
};

const newAudio = async (CONFIG) => {
    try {
        await CONFIG.stream.song.pause()
        await CONFIG.audio.ctx.suspend();

        CONFIG.stream.song = new Audio(CONFIG.stream.path)
        CONFIG.stream.source = CONFIG.audio.ctx.createMediaElementSource(CONFIG.stream.song)
        CONFIG.stream.song.crossOrigin = 'anonymous'

        CONFIG.stream.song.addEventListener("canplay", async (event) => {
            await CONFIG.audio.ctx.resume();
            await CONFIG.stream.song.play()
            CONFIG.html.button.start.textContent = 'Stop Audio'
            return true
        });
        await CONFIG.stream.source.connect(CONFIG.audio.ctx.destination);
        await CONFIG.stream.source.connect(CONFIG.audio.processorNode);
        //await CONFIG.stream.source.connect(CONFIG.audio.master.gain);
    } catch (e) {
        CONFIG.html.button.start.textContent = 'Stop Audio'
        return true
    }
}

const drawOscilloscope = () => {
    return ;
    CONFIG.html.scope.context = CONFIG.html.scope.canvas.getContext('2d')
    CONFIG.html.scope.canvas.width = CONFIG.audio.waveform.length
    CONFIG.html.scope.canvas.height = 200
    CONFIG.html.scope.context.clearRect(0, 0, CONFIG.html.scope.canvas.width, CONFIG.html.scope.canvas.height)
    CONFIG.html.scope.context.beginPath()
    for (let i = 0; i < CONFIG.audio.waveform.length; i++) {
        const x = i
        const y = (0.5 + (CONFIG.audio.waveform[i] / 2)) *  CONFIG.html.scope.canvas.height

        if (i === 0) {
            CONFIG.html.scope.context.moveTo(x, y)
        } else {
            CONFIG.html.scope.context.lineTo(x, y)
        }
    }
    CONFIG.audio.analyser.getFloatTimeDomainData(CONFIG.audio.waveform)

    // CONFIG.audio.waveform = window["queue"].pull();

    CONFIG.html.scope.context.strokeStyle = '#5661FA'
    CONFIG.html.scope.context.lineWidth = 2
    CONFIG.html.scope.context.stroke()
    if ( CONFIG.player.isPlaying ) window.requestAnimationFrame(drawOscilloscope)
}

const ctx = async (CONFIG) => {
    if( !CONFIG.audio.ctx ) {
        CONFIG.audio.ctx = new window.AudioContext;
        await CONFIG.audio.ctx.audioWorklet.addModule(new URL('./radio-processor.mjs', import.meta.url).pathname);
    }
    //CONFIG.audio.oscillatorNode = new OscillatorNode(CONFIG.audio.ctx);

    // Create an atomic state for synchronization between Worker and AudioWorklet.

    CONFIG.audio.processorNode = new AudioWorkletNode(CONFIG.audio.ctx, 'radio-processor', {
        processorOptions: {
            queue: window["queue"],
            instance: window["instance"]
        },
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [2],
        channelCount: 2,
        channelCountMode: "max",
        channelInterpretation: "speakers"
    });

    CONFIG.audio.processorNode.connect(CONFIG.audio.ctx.destination);

    CONFIG.audio.ctx.suspend();

//    CONFIG.audio.analyser =  CONFIG.audio.ctx.createAnalyser()
//    CONFIG.audio.master.gain = CONFIG.audio.ctx.createGain()

//    CONFIG.audio.waveform = new Float32Array(CONFIG.audio.analyser.frequencyBinCount)
//    await CONFIG.audio.analyser.getFloatTimeDomainData(CONFIG.audio.waveform)

    // TODO переключатель между радио и осцилятором
//    CONFIG.audio.master.gain.connect(CONFIG.audio.processorNode).connect(CONFIG.audio.analyser).connect(CONFIG.audio.ctx.destination);
    // CONFIG.audio.oscillatorNode.connect(CONFIG.audio.processorNode).connect(CONFIG.audio.analyser).connect(CONFIG.audio.ctx.destination);

//    CONFIG.audio.oscillatorNode.start();

    return CONFIG.audio.ctx
}

const init = (self) => {
    CONFIG.html.scope.canvas = self['this']['shadowRoot'].querySelector('#oscilloscope')
    CONFIG.html.button.start = self['this']['shadowRoot'].querySelector('#start')
    CONFIG.html.button.radios.this = self['this']['shadowRoot'].querySelectorAll('input[name="radio-selection"]')
    CONFIG.html.button.radios.length = CONFIG.html.button.radios.this.length;
}

export default async () => {
    return new Promise((resolve, reject) => {
        class Radio {
            constructor(self) {
                init(self)
                for (let i = 0, max = CONFIG.html.button.radios.length; i < max; i++) {
                    if (CONFIG.html.button.radios.this[i].checked === true) {
                        CONFIG.stream.path = CONFIG.html.button.radios.this[i].value
                    }
                }

                CONFIG.stream.song = new Audio(CONFIG.stream.source)

                for (let i = 0, max = CONFIG.html.button.radios.length; i < max; i++) {
                    CONFIG.html.button.radios.this[i].addEventListener('change', async (event) => {
                        if (CONFIG.player.isPlaying) {
                            await CONFIG.stream.song.pause()
                            CONFIG.html.button.start.textContent = 'Start Audio'
                            CONFIG.player.isPlaying = !CONFIG.player.isPlaying
                            CONFIG.stream.path = event.target.value
                            if(CONFIG.audio.ctx) {
                                CONFIG.player.isPlaying = !CONFIG.player.isPlaying
                                await newAudio(CONFIG)
                            }
                        }
                    })
                }

                CONFIG.html.button.start.addEventListener('click', async (e) => {
                    if (CONFIG.player.isPlaying) {
                        await CONFIG.stream.song.pause()
                        CONFIG.audio.ctx.suspend();
                        CONFIG.html.button.start.textContent = 'Start Audio'
                    } else {
                        CONFIG.html.button.start.textContent = 'Stop Audio'
                        await ctx(CONFIG)
                        await newAudio(CONFIG)
                        drawOscilloscope()
                    }
                    CONFIG.player.isPlaying = !CONFIG.player.isPlaying
                })
            }
        }

        resolve(Radio)
    })
}