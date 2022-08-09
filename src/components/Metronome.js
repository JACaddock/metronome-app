import { useState, useEffect, useRef } from 'react';
import placeholderImage from '../img/metronome.png';


function Metronome() {
    const metronomeRef = useRef();
    const [metronome, setMetronome] = useState({
        audio: new Audio("./static/samp9Metronom1.WAV"),
        playing: false,
        volume: 1,
        bpm: 100
    })

    var lastTapSeconds = metronome.bpm;
    var bpm = metronome.bpm;
    var beats = [];
    var average = 0;
    var count = 0;
    

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

    function handleTapTempo(e) {
        let tapSeconds = new Date().getTime();

        bpm = ((1/ ((tapSeconds - lastTapSeconds) / 1000)) * 60 ); 
        lastTapSeconds = tapSeconds;

        if (Math.floor(bpm) === 0) {
            beats.push(Math.floor(bpm));    
            average *= count;
            average += Math.floor(bpm);
            count++
            average /= count;
        }

        if(beats.length >= 10) {
            console.log("Average: " + average)
        }
    }
    
    return (
        <div>
            <div className='metronome-graphic'>
                <img src={placeholderImage} alt="Placeholder for the Metronome"/>
            </div>

            <div className='flex'>
                <button id='playing' onClick={handleMetronomeChange}>{metronome.playing ? "Pause" : "Play"}</button>
            </div>

            <div className='flex'>
                <button onClick={handleTapTempo}>BPM</button>
            </div>

            <div className='flex'>
                <p>Volume</p>   
                <input id='volume' type="range" min="0" max="1" step="0.01" value={metronome.volume} onChange={handleMetronomeChange} />
            </div>

            <div className='flex'>
                <p>BPM</p>   
                <input id='bpm' type="range" min="30" max="240" value={metronome.bpm} onChange={handleMetronomeChange} />
            </div>

        </div>
    )
}

export default Metronome;