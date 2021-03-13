# chown -R $USER:$USER $HOME/
test -f hasrun || {
    ulimit -n 10000
    touch hasrun

    addgroup $USER audio
    addgroup $3 audio

    echo "Load pulseaudio virtual audio source 1"
    
    # echo "sudo -u $3 sh ./scripts/run-runner.sh $2"
    sudo -u $3 ./scripts/run-runner.sh $2 $4 $5 $6
    echo "Done with running script"
}
