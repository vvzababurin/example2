try {
    window["isPlaybackInProgress"] = false;

    window["startplayback"] = async function()
    {
		window["isPlaybackInProgress"] = true;

		if (window["audioCtx"] == undefined) {
			window["audioCtx"] = new (window.AudioContext || window.webkitAudioContext)();
		}
		 
		const audioSrc = "https://hermitage.hostingradio.ru/hermitage128.mp3";
	
		$("#audiostream").attr("src", audioSrc);
		window["audioElement"] = $("#audiostream")[0];
	
		if (window["audioSrc"] == undefined) {
			window["audioSrc"] = window["audioCtx"].createMediaElementSource(window["audioElement"]);
		}

		if (window["audioSrc"]) {
			window["audioSrc"].connect(window["audioCtx"].destination);
		}

		await window["audioCtx"].audioWorklet.addModule("./nk-radio/modules/radio/radio-processor.mjs");
	
		if (window["audioWorklet"] == undefined) {
			window["audioWorklet"] = new AudioWorkletNode(window["audioCtx"], "radio-processor", {
				processorOptions: {
					instance: window["instance"],
					queue: window["queue"]
				},
				numberOfInputs: 0,
				numberOfOutputs: 5,
				outputChannelCount: [2, 2, 2, 2, 2],
				channelCount: 2,
				channelCountMode: "max",
				channelInterpretation: "speakers"
			});
		}

		if (window["audioWorklet"]) {

			window["audioAnalyser"] = window["audioCtx"].createAnalyser();
			if ( window["audioAnalyser"] ) {
				window["waveform"] = new Float32Array( window["audioAnalyser"].frequencyBinCount );
				if ( window["waveform"] ) {
					window["audioAnalyser"].fftSize = 2048;
					window["audioAnalyser"].getFloatTimeDomainData( window["waveform"] );
				}
			}
	
			window["audioAnalyser"].connect(window["audioCtx"].destination);
			window["audioWorklet"].connect(window["audioCtx"].destination);
		}
		
		window["audioElement"].play();
		
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
		// window["audioRec"].onaudioprocess = undefined;
    }


	var draw = function () {
		requestAnimationFrame(draw);
		if ( window["audioAnalyser"] != undefined ) {
			window["audioAnalyser"].getFloatTimeDomainData( window["waveform"] );
			console.log( window["waveform"] );
		}
	}

	draw();
} 
catch( e ) 
{
	console.log( "exception: " + e );
	throw( e );
}