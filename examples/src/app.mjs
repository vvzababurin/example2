try {
    window["isPlaybackInProgress"] = false;

    window["startplayback"] = function()
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
        const channels = 2;
        if (window["audioRec"] == undefined) {
		window["audioRec"] = window["audioCtx"].createScriptProcessor(0, channels, channels);        
        }
        if (window["audioRec"]) {
		window["audioSrc"].connect(window["audioRec"]);
		window["audioRec"].connect(window["audioCtx"].destination);
        }
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
        window["audioElement"].play();
    }

    window["stopplayback"] = function() {
	window["isPlaybackInProgress"] = false;
	window["render-buffer"] = undefined;
	window["audioElement"].pause();
	window["audioRec"].onaudioprocess = undefined;
    }
} 
catch( e ) 
{
	console.log( "exception: " + e );
	throw( e );
}