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
		globalThis["audioElement"] = globalThis.document.getElementById("audiostream");
		if (globalThis["audioSrc"] == undefined) {
			globalThis["audioSrc"] = globalThis["audioCtx"].createMediaElementSource(globalThis["audioElement"]);
		}
		if (globalThis["audioSrc"]) {
			globalThis["audioSrc"].connect(globalThis["audioCtx"].destination);
		}	
		if (globalThis["audioWorklet"] == undefined) {
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
		globalThis["audioCtx"].resume();
		globalThis["audioElement"].play();
		
    }
    globalThis["stopplayback"] = async function() {
		globalThis["isPlaybackInProgress"] = false;
		globalThis["render-buffer"] = undefined;
		globalThis["audioAnalyser"] = undefined;
		globalThis["audioElement"].pause();
    }
} 
catch( e ) 
{
	console.log( "exception: " + e );
	throw( e );
}