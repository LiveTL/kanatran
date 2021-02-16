#!/bin/bash
echo "Is running the thing"
pulseaudio -vvvv -D --exit-idle-time=-1
echo "Have run the thing"
sleep 1

echo "Create virtual output device (used for audio playback)"
pactl load-module module-null-sink sink_name=DummyOutput sink_properties=device.description="CustomSpeaker"

echo 'Create virtual microphone output, used to play media into the "microphone"'
pactl load-module module-null-sink sink_name=CustomAudioPipe sink_properties=device.description="CustomMicrophone"

echo "Set the default source device (for future sources) to use the monitor of the virtual microphone output"
pacmd set-default-source CustomAudioPipe.monitor

echo "Create a virtual audio source linked up to the virtual microphone output"
pacmd load-module module-virtual-source source_name="CustomMicrophone"

echo "Disable idle timeout"
pacmd unload-module module-suspend-on-idle

# Used for debugging audio
# pulseaudio --check -vvvv
# echo Soundcards:
# pacmd list soundcards
# echo Sinks:
# pacmd list-sinks
# echo Sources:
# pacmd list-sources && echo listed sources


function bruhpv() {
	local bruh=""
	local newbruh=""
	local mpvs=$(pgrep mpv)
	while true
	do
		newbruh=$(cat bruh.txt)
		if [ "$newbruh" = "None" ]
		then
			pkill mpv
		elif [ "$mpvs" = "" -o "$newbruh" != "$bruh" ]
		then
			echo Playing $newbruh
			pkill mpv
			mpv --no-video $newbruh &> /dev/null &
		fi
		bruh=$newbruh
		sleep 10
	done
}

function bruhpvstatus() {
	while true
	do
		echo "<STATUS> pgrepping mpv"
		pgrep mpv
		echo "</STATUS>"
		sleep 30
	done
}

touch bruh.txt
bruhpv &
bruhpvstatus &

echo Printing release
youtube-dl --version

echo Machine $1

# Actual python should be at /opt/hostedtoolcache/Python/3.8.7/x64/bin/python3
echo Using $2
echo Action index $4
export CHANNEL_ID=$(jq .[$(($1 + $4))].channel channels.json | sed 's/"//g')
echo CHANNEL_ID: $CHANNEL_ID

if [ $CHANNEL_ID != "null" ]
then
	echo Using channel $CHANNEL_ID
	$2 -m uvicorn run_audio:app --app-dir=scripts --port=6969 &
	$2 -m uvicorn server:app --app-dir=scripts --port=42069
else
	echo Channel_ID was null, quiting
fi
