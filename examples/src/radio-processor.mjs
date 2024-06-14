
class WorkletBasicProcessor extends AudioWorkletProcessor 
{
    constructor(options) {
        super();
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
		return true;
	}
}

registerProcessor("radio-processor", WorkletBasicProcessor);
