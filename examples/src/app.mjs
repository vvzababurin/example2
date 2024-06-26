try {
    window["isPlaybackInProgress"] = false;

    window["startplayback"] = async function()
    {
		window["isPlaybackInProgress"] = true;

		if (window["audioCtx"] == undefined) {
			window["audioCtx"] = new (window.AudioContext || window.webkitAudioContext)();
		}

//		await window["audioCtx"].audioWorklet.addModule("./nk-radio/modules/radio/radio-processor.mjs");
		 
		window["audioCtx"].suspend();

		const audioSrc = "https://hermitage.hostingradio.ru/hermitage128.mp3";
	
		$("#audiostream").attr("src", audioSrc);
		window["audioElement"] = $("#audiostream")[0];
	
		if (window["audioSrc"] == undefined) {
			window["audioSrc"] = window["audioCtx"].createMediaElementSource(window["audioElement"]);
		}

		if (window["audioSrc"]) {
			window["audioSrc"].connect(window["audioCtx"].destination);
		}
	
		if (window["audioRec"] == undefined) {
			window["audioRec"] = window["audioCtx"].createScriptProcessor(2048, 2, 2);
		}		

        window["audioRec"].onaudioprocess = function(e) {

			let inputBuffer = e.inputBuffer;

			//console.log( inputBuffer );

			window["samplerate"] = inputBuffer.sampleRate;
			let bufferSize = 2048;

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
				console.log( "queue.push: " + (( r == true ) ? "true" : "false") );
				window["queue"].printAvailableReadAndWrite();
			}
		};

		window["audioSrc"].connect(window["audioRec"]);
		window["audioRec"].connect(window["audioCtx"].destination);

		window["audioCtx"].resume();
		window["audioElement"].play();

/*
		if (window["audioWorklet"] == undefined) {
			window["audioWorklet"] = new AudioWorkletNode(window["audioCtx"], "radio-processor", {
				processorOptions: {
					undefined,
					undefined,
					undefined
				},
				//numberOfInputs: 1,
				//numberOfOutputs: 5,
				//outputChannelCount: [2, 2, 2, 2, 2],
				//channelCount: 2,
				//channelCountMode: "max",
				//channelInterpretation: "speakers"
			});
			//window["audioWorklet"].connect(window["audioCtx"].destination);
		}

		if (window["worker"] == undefined) {

			window["worker"] = new Worker("./nk-radio/modules/radio/radio-worker.sync.mjs", {
            	name: "internet - radio",
        	    type: "module",
    	    });

			window["worker"].addEventListener('message', (event) => {
				if(event.data.status) {
					switch (event.data.type) {
						case 'terminate':
							//TODO надо проверить уничтожится он или нет до уничтожения компонента
							console.log('######## TERMINATE ##########');
							break;
						default:
							self.this.sharedArrayBuffer =  {
								name: "internet - radio",
								instance: window["instance"],
								queue: window["queue"]
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

			window["worker"].postMessage({
				type: 'init',
				data: {
					instance: window["instance"],
					queue: window["queue"],
					sampleRate: 44100
				}
			});

		}

		window["worker"].onerror = (event) => {
			console.log('[main.js] Error from worker.js: ', event);
		};
	
		if (window["audioWorklet"]) {

			window["audioGain"] = window["audioCtx"].createGain();
			window["audioAnalyser"] = window["audioCtx"].createAnalyser();

			if ( window["audioAnalyser"] ) {
				if ( window["waveform"] == undefined ) window["waveform"] = new Float32Array( window["audioAnalyser"].frequencyBinCount );
				if ( window["waveform"] ) {
//					window["audioAnalyser"].fftSize = 1024;
					window["audioAnalyser"].getFloatTimeDomainData( window["waveform"] );
				}
			}
	
			window["audioGain"].connect( window["audioWorklet"] ).connect( window["audioAnalyser"] ).connect(window["audioCtx"].destination);
		}
		window["audioCtx"].resume();
		window["audioElement"].play();
*/		
/*
        window["audioRec"].onaudioprocess = function(e) {
			let inputBuffer = e.inputBuffer;
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
		};
*/

        
    }

    window["stopplayback"] = async function() {
		window["isPlaybackInProgress"] = false;
		window["render-buffer"] = undefined;
		window["audioAnalyser"] = undefined;
		window["audioElement"].pause();
		window["audioRec"].onaudioprocess = undefined;
    }

	/*

	var draw = async function () {
		requestAnimationFrame(draw);
		if ( window["audioAnalyser"] != undefined ) {
			await window["audioAnalyser"].getFloatTimeDomainData( window["waveform"] );
			console.log( window["waveform"] );
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