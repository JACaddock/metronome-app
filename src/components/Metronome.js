import { useState, useEffect, useRef } from 'react';
import { useBeats } from '../hooks/useBeats.js'
import useSound from 'use-sound';
import placeholderImage from '../img/metronome.png';
import minus from '../img/minus.svg';
import plus from '../img/plus.svg';
import pingSoundHi from "../static/ping-hi.mp3";
import pingSoundLow from "../static/ping-low.mp3";
import "./Metronome.css";



function Metronome() {   

    const metronomeInterval = useRef();
    const keyRef = useRef(handleKeyDown);
    
    const [playing, setPlaying] = useState(false);

    const [volume, setVolume] = useState(() => {
        if (localStorage.getItem("vol")) {
            return localStorage.getItem("vol");
        } else {
            return 0.5;
        }
    });

    const [bpm, setBpm] = useState(() => {
        if (localStorage.getItem("bpm")) {
            return parseInt(localStorage.getItem("bpm"));
        } else {
            return 100;
        }
    });

    // Two play functions sing the useSound hook.
    const [playHigh] = useSound(pingSoundHi, {
        id: "high",
        volume: volume
    }) ;
    const [playLow] = useSound(pingSoundLow, {
        id: "low",
        volume: volume
    });
    
    const [lastTapSeconds, setLastTapSeconds] = useState(0); // The time in milliseconds when the Tap Tempo button was last pressed.
    const [lastBpms, setLastBpms] = useState([]);  // Array of BPMs used to create the average BPM for Tap Tempo

    
    const {beats, addBeat, removeLastBeat, getBeatsVisual, getNextBeat, restartBeats} = useBeats(); 

    

    useEffect(() => {
        if (playing) {           
            metronomeInterval.current = setInterval(() => {
                let count = getNextBeat();
    
                if (count === 0) {
                    playHigh();
                    
                } else {
                    playLow();
                }
                
                
            }, (60 * 1000 / bpm));
            
            
        } else {
            restartBeats();
        }

        return () => {
            clearInterval(metronomeInterval.current);
        }
    }, [playing, bpm, playHigh, playLow, getNextBeat, restartBeats])
       
    
    useEffect(() => {
        keyRef.current = handleKeyDown;
    })
    
    
    useEffect(() => {
        const key = (e) => keyRef.current(e)
        
        window.addEventListener("keydown", key)
        
        return () => {
            window.removeEventListener("keydown", key)
        }    
    }, [])
    
    
    function handleKeyDown(e) {
        if (e.key === "t") {
            handleTapTempo();
        }
    }

    
    function handleTapTempo() {
        const tapSeconds = new Date().getTime();
        
        const next_bpm = Math.floor(((1/ ((tapSeconds - lastTapSeconds) / 1000)) * 60 )); 
        setLastTapSeconds(tapSeconds);

        let avg = bpm;

        if (next_bpm !== 0) {
            avg *= lastBpms.length;
            setLastBpms([...lastBpms, next_bpm]); 
        } else {
            setLastBpms([...lastBpms, bpm]);
        }
        
        avg += next_bpm;
        avg /= lastBpms.length + 1;
        setBpm(Math.floor(avg));
        localStorage.setItem("bpm", Math.floor(avg));
        
        
        if(lastBpms.length >= 10) {
            setLastTapSeconds(0);
            setLastBpms([]);
        }
    }


    function handleVolumeChange(e) {
        setVolume(e.target.value);
        localStorage.setItem("vol", e.target.value);
    }


    function handleBpmChange(e) {
        setBpm(parseInt(e.target.value));
        localStorage.setItem("bpm", e.target.value);
        setLastBpms([]);
        setLastTapSeconds(0);
    }

    
    return (
        <div className='metronome'>
            <div className='metronome-graphic'>
                <img src={placeholderImage} alt="Placeholder for the Metronome"/>
            </div>

            <div className='flex'>
                <button className='metronome-btn' id='playing' onClick={() => setPlaying(!playing)}>{playing ? "Stop" : "Start"}</button>
            </div>

            <div className='flex column'>
                <div className='flex column'>
                    <div className='flex metronome-box'>
                        <h3 className='metronome-h3 '>Current BPM</h3>
                    </div>
                    <p className='metronome-box'>{ bpm }</p>
                </div>
                
                <button className='metronome-btn' onClick={handleTapTempo}>Tap Tempo</button>                  
                
                {lastBpms.length !== 0 && <button className='flex metronome-btn' value='100' onClick={handleBpmChange}>Reset</button>}
                
                
                
            </div>
            
            <div className='flex column metronome-block'>
                <div className='flex metronome-box'>{getBeatsVisual()}</div>
                <div className='flex row'>
                    <button className='icon-btn' disabled={beats<2} onClick={removeLastBeat}><img className='icon-btn-img' src={minus} alt="minus icon" /></button>
                    <p className="text">{beats}</p>
                    <button className='icon-btn' disabled={beats>11} onClick={addBeat}><img className='icon-btn-img' src={plus} alt="plus icon" /></button>
                </div>
            </div>

            <div className='metronome-sliders metronome-block'>
                <div className='row metronome-box'> 
                    <p className="metronome-p">Volume</p>   
                    <input className='metronome-range' id='volume' type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} />
                </div>
                
                <div className='row metronome-box'>
                    <p className="metronome-p">BPM</p>   
                    <input className='metronome-range' id='bpm' type="range" min="30" max="260" value={bpm} onChange={handleBpmChange} />
                </div>

            </div>
        </div>
    )
}

export default Metronome;