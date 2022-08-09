import { useState, useEffect, useRef } from 'react';


function Metronome() {
    const metronomeRef = useRef();
    const [metronome, setMetronome] = useState({
        audio: new Audio("./static/samp9Metronom1.WAV"),
        playing: false,
        volume: 1,
        bpm: 100
    })
    

    useEffect(() => {
        if (metronome.playing) {
            clearInterval(metronomeRef.current);

            metronomeRef.current = setInterval(() => {
                metronome.audio.play();
                metronome.audio.volume = metronome.volume;
            },(60 / metronome.bpm) * 1000);
            
            
        } else {
            clearInterval(metronomeRef.current);
        }
    })


    function handleMetronomeChange(e) {
        let playing = metronome.playing;
        let volume = metronome.volume;
        let bpm = metronome.bpm;

        switch (e.target.id) {
            case "playing":
                playing = !playing;
                break;
            case "volume":
                volume = e.target.value;
                break;

            case "bpm":
                bpm = e.target.value;
                break;
        
            default:
                break;
        }

        setMetronome({
            audio: metronome.audio,
            playing: playing,
            volume: volume,
            bpm: bpm
        })
    }

    //function handleTapTempo(e) {}
    
    return (
        <div>
            <div>
                <button id='playing' onClick={handleMetronomeChange}>{metronome.playing ? "Pause" : "Play"}</button>
            </div>

            <div className='flex'>
                <p>Volume</p>   
                <input id='volume' type="range" min="0" max="1" step="0.01" value={metronome.volume} onChange={handleMetronomeChange} />
            </div>

            <div className='flex'>
                <p>BPM</p>   
                <input id='bpm' type="range" min="60" max="240" value={metronome.bpm} onChange={handleMetronomeChange} />
            </div>

        </div>
    )
}

export default Metronome;