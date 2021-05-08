#!/bin/bash
pushd /usr/src/watcher

echo hello world

echo $(whoami)

/usr/bin/Xvfb $DISPLAY -screen 0 1280x1024x24 &
addgroup $(whoami) audio
pulseaudio -vvvv -D --exit-idle-time=-1
sleep 1
pactl load-module module-null-sink sink_name=DummyOutput sink_properties=device.description="CustomSpeaker"
pactl load-module module-null-sink sink_name=CustomAudioPipe sink_properties=device.description="CustomMicrophone"
pacmd set-default-source CustomAudioPipe.monitor
pacmd load-module module-virtual-source source_name="CustomMicrophone"
pacmd unload-module module-suspend-on-idle

echo $VIDEO
VLINK="https://www.youtube.com/watch?v=$VIDEO"
echo $VLINK

function playvid() {
	mpv --no-vid $1
}

function server() {
	python3.8 -m uvicorn --app-dir=server server:app --port=42069 --log-level="error"
}

# python3.8 -m pip install -r server/requirements.txt
server &
playvid $VLINK
