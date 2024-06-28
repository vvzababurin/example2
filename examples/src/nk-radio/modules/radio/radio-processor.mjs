import FreeQueue from "../../../free-queue/free-queue.js";
import { getConstant } from "./constants.js";

const { RENDER_QUANTUM, FRAME_SIZE } = getConstant( "radio" );

class WorkletBasicProcessor extends AudioWorkletProcessor 
{
    constructor(options) {
		super(); 
		this.queue = Object.setPrototypeOf(options.processorOptions.queue, FreeQueue.prototype);
		this.instance = options.processorOptions.instance;
    }
	
    process(inputs, outputs, parameters) 
	{
		////////////////////////////////////////////////////////////////////////////////////////
		// inputs count...
		////////////////////////////////////////////////////////////////////////////////////////
		for ( let i = 0; i < inputs.length; i++ ) {

			let bufferSize = 0;

			let channels = inputs[i].length;
			if ( channels == 0 ) break;

			let dataArray = [ channels ];

			////////////////////////////////////////////////////////////////////////////////////////
			// channels count...
			////////////////////////////////////////////////////////////////////////////////////////

			for ( let j = 0; j < channels; j++ ) {  
				bufferSize = inputs[i][j].length;
				dataArray[j] = new Float64Array(bufferSize);
				for ( let k = 0; k < bufferSize; k++ ) {
					dataArray[j][k] = inputs[i][j][k];
				}
			}

			if ( this.queue != undefined ) {
				const r = this.queue.push( dataArray, bufferSize );
				console.debug( "processor: queue.push [ " + ( ( r == true ) ? "true" : "false" ) + " ]" );
				// this.queue.printAvailableReadAndWrite();
			}

		}

		return true;
	}

}


registerProcessor("radio-processor", WorkletBasicProcessor);
