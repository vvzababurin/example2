try {
    globalThis["isPlaybackInProgress"] = false;

    globalThis["startplayback"] = async function()
    {
		globalThis["isPlaybackInProgress"] = true;

		if (globalThis["audioCtx"] == undefined) {
			globalThis["audioCtx"] = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
		}

		await globalThis["audioCtx"].audioWorklet.addModule("./nk-radio/modules/radio/radio-processor.mjs");
		 
		globalThis["audioCtx"].suspend();

		const audioSrc = "https://hermitage.hostingradio.ru/hermitage128.mp3";
	
		$("#audiostream").attr("src", audioSrc);
		globalThis["audioElement"] = $("#audiostream")[0];
	
		if (globalThis["audioSrc"] == undefined) {
			globalThis["audioSrc"] = globalThis["audioCtx"].createMediaElementSource(globalThis["audioElement"]);
		}

		if (globalThis["audioSrc"]) {
			globalThis["audioSrc"].connect(globalThis["audioCtx"].destination);
		}
	
/*		
		if (globalThis["audioRec"] == undefined) {
			globalThis["audioRec"] = globalThis["audioCtx"].createScriptProcessor(2048, 2, 2);
		}		

        globalThis["audioRec"].onaudioprocess = function(e) {

			let inputBuffer = e.inputBuffer;

			//console.log( inputBuffer );

			globalThis["samplerate"] = inputBuffer.sampleRate;
			let bufferSize = 2048;

			globalThis["channels"] = inputBuffer.numberOfChannels;
			const dataArray = [ globalThis["channels"] ];

			for ( let i = 0; i < globalThis["channels"]; i++ ) {
				dataArray[i] = new Float64Array(bufferSize);
			}

			for ( let i = 0; i < bufferSize; i++ ) {
				for ( let j = 0; j < globalThis["channels"]; j++ ) {
					dataArray[j][i] = inputBuffer.getChannelData(j)[i];
				}
			}

			if ( globalThis["queue"] != undefined ) {
				const r = globalThis["queue"].push( dataArray, bufferSize );
				console.log( "queue.push: " + (( r == true ) ? "true" : "false") );
				globalThis["queue"].printAvailableReadAndWrite();
			}
		};

		globalThis["audioSrc"].connect(globalThis["audioRec"]);
		globalThis["audioRec"].connect(globalThis["audioCtx"].destination);


		globalThis["audioCtx"].resume();
		globalThis["audioElement"].play();
*/

		if (globalThis["audioWorklet"] == undefined) 
		{
			globalThis["audioWorklet"] = new AudioWorkletNode(globalThis["audioCtx"], "radio-processor", {
				processorOptions: {
					queue: globalThis["queue"],
					instance: globalThis["instance"],
				},
				numberOfInputs: 1,
				numberOfOutputs: 1,
				outputChannelCount: [2],
				channelCount: 2,
				channelCountMode: "max",
				channelInterpretation: "speakers"
			});
			
			globalThis["audioWorklet"].connect(globalThis["audioCtx"].destination);
		}

		globalThis["audioSrc"].connect(globalThis["audioWorklet"]);
/*
		if (globalThis["worker"] == undefined) 
		{
			globalThis["worker"] = new Worker("./nk-radio/modules/radio/radio-worker.sync.mjs", {
            	name: "internet - radio",
        	    type: "module",
    	    });

			globalThis["worker"].addEventListener('message', (event) => {
				if(event.data.status) {
					switch (event.data.type) {
						case 'terminate':
							//TODO надо проверить уничтожится он или нет до уничтожения компонента
							console.log('######## TERMINATE ##########');
							break;
						default:
							self.this.sharedArrayBuffer =  {
								name: "internet - radio",
								instance: globalThis["instance"],
								queue: globalThis["queue"]
							}
	
							document.dispatchEvent(new CustomEvent(`free-queue`, {
								detail: {
									status: true
								}
							}));
							break;
					}
				}
			}, { once: true })

			globalThis["worker"].postMessage({
				type: 'init',
				data: {
					instance: globalThis["instance"],
					queue: globalThis["queue"],
					sampleRate: 44100
				}
			});

		}

		globalThis["worker"].onerror = (event) => {
			console.log('[main.js] Error from worker.js: ', event);
		};
	
		if (globalThis["audioWorklet"]) {

			globalThis["audioGain"] = globalThis["audioCtx"].createGain();
			globalThis["audioAnalyser"] = globalThis["audioCtx"].createAnalyser();

			if ( globalThis["audioAnalyser"] ) {
				if ( globalThis["waveform"] == undefined ) globalThis["waveform"] = new Float32Array( globalThis["audioAnalyser"].frequencyBinCount );
				if ( globalThis["waveform"] ) {
//					globalThis["audioAnalyser"].fftSize = 1024;
					globalThis["audioAnalyser"].getFloatTimeDomainData( globalThis["waveform"] );
				}
			}
	
			globalThis["audioGain"].connect( globalThis["audioWorklet"] ).connect( globalThis["audioAnalyser"] ).connect(globalThis["audioCtx"].destination);
		}
*/
		globalThis["audioCtx"].resume();
		globalThis["audioElement"].play();
		
    }

    globalThis["stopplayback"] = async function() {
		globalThis["isPlaybackInProgress"] = false;
		globalThis["render-buffer"] = undefined;
		globalThis["audioAnalyser"] = undefined;
		globalThis["audioElement"].pause();
		//globalThis["audioRec"].onaudioprocess = undefined;
    }

	/*

	var draw = async function () {
		requestAnimationFrame(draw);
		if ( globalThis["audioAnalyser"] != undefined ) {
			await globalThis["audioAnalyser"].getFloatTimeDomainData( globalThis["waveform"] );
			console.log( globalThis["waveform"] );
		}
	}

	draw();
	*/

} 
catch( e ) 
{
	console.log( "exception: " + e );
	throw( e );
}