import FreeQueue from "../../../free-queue/free-queue.js";

class WorkletBasicProcessor extends AudioWorkletProcessor 
{
    constructor(options) {
		super(); 
		this.queue = FreeQueue.fromSource( options.processorOptions.queue );
		this.instance = options.processorOptions.instance;
		this.waveform = options.processorOptions.waveform;
		this.channelCount = options.channelCount;
/*
		this.context = options.processorOptions.context;
		
		this.context.decodeAudioData(options.arrayBuffer).then(function (buffer) {
			console.log( buffer );
		}.bind(this));
*/
    }
	
    process(inputs, outputs, _parameters) 
	{
		// let inputBuffer = inputs[0];

		// console.log( "queue: ", this.queue );
		// console.log( "instance: ", this.instance );

		// console.log( "qchannels: ", this.queue.channelCount );

		// console.log( "outputs channelCount: ", this.channelCount );
	

		//console.log( "waveform: ", this.waveform );
		//console.log( "inputs: ", inputs.length );
		//console.log( "input[0]: ", inputs[0].length );


		////////////////////////////////////////////////////////////////////////////////////////
		// inputs count...
		////////////////////////////////////////////////////////////////////////////////////////
		for ( let i = 0; i < outputs.length; i++ ) {

			let bufferSize = 0;

			let channels = outputs[i].length;
			let dataArray = [ channels ];

			////////////////////////////////////////////////////////////////////////////////////////
			// channels count...
			////////////////////////////////////////////////////////////////////////////////////////
			for ( let j = 0; j < channels; j++ ) {  
				bufferSize = outputs[i][j].length;
				dataArray[j] = new Float64Array(bufferSize);
				for ( let k = 0; k < bufferSize; k++ ) {
					dataArray[j][k] = 0.0; // this.waveform[j][k];
				}
			}

			if ( this.queue != undefined ) {
				// const r = this.queue.push( dataArray, bufferSize );
				//console.log( "queue.push: " + ( r == true ) ? "true" : "false" );
				//this.queue.printAvailableReadAndWrite();
			}

		}

		return true;
	}

}


registerProcessor("radio-processor", WorkletBasicProcessor);
