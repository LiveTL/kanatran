#!/bin/bash

# log and upload are for @r2dev2, ignore them otherwise
function log() {
	curl "https://PublicFiles.r2dev2bb8.repl.co/" \
		--data-urlencode "msg=$1" \
		-G \
	       	&> /dev/null
}

function upload() {
	curl  \
		-F "file=@$1" \
		"https://FileUpload.r2dev2bb8.repl.co/upload/$1"
}

echo hello world

log $(whoami)

/usr/bin/Xvfb $DISPLAY -screen 0 1280x1024x24 &
addgroup $(whoami) audio
pulseaudio -vvvv -D --exit-idle-time=-1
sleep 1
pactl load-module module-null-sink sink_name=DummyOutput sink_properties=device.description="CustomSpeaker"
pactl load-module module-null-sink sink_name=CustomAudioPipe sink_properties=device.description="CustomMicrophone"
pacmd set-default-source CustomAudioPipe.monitor
pacmd load-module module-virtual-source source_name="CustomMicrophone"
pacmd unload-module module-suspend-on-idle

log $VIDEO
VLINK="https://www.youtube.com/watch?v=$VIDEO"
log $VLINK

function playvid() {
	mpv --no-vid $1 &
}

# python3.8 -m pip install -r server/requirements.txt
playvid $VLINK &> logs.txt
python3.8 -m uvicorn --app-dir=server server:app --port=42069 &> uvlog.txt
bash
