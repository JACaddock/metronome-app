import { useState, useEffect } from 'react';
import useSound from 'use-sound';
import placeholderImage from '../img/metronome.png';
import minus from '../img/minus.svg';
import plus from '../img/plus.svg';
import pingSoundHi from "../static/ping-hi.mp3";
import pingSoundLow from "../static/ping-low.mp3";
import "./Metronome.css";



function Metronome() {   

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

    
    const [beats, addBeat, removeLastBeat, getLastPlayed, getNextBeat, restartBeats] = useClickSound(); 

    // Custom useClickSound Hook
    function useClickSound() {
         // Array of Integers denoting the number of beats and their index
        const [beats, setBeats] = useState(()=> {
            if (localStorage.getItem("beats")) {
                let array = [];
                for (let i = 0; i < parseInt(localStorage.getItem("beats")); i++) {
                    array.push(i);
                }

                return array;
            } else {
                return [0 , 1];
            }
        });

        const [count, setCount] = useState(-1);     // Index of next beat to play


        function addBeat() {
            if (beats.length < 12) {
                localStorage.setItem("beats", (beats.length + 1));

                setBeats([...beats, beats.length]);
                restartBeats();

            }
        }


        function removeLastBeat() {
            if (beats.length > 1) {
                localStorage.setItem("beats", (beats.length - 1));

                setBeats(beats.splice(0,beats.length-1));
                restartBeats();
            }
        }


        function getLastPlayed() {
            return count;
        }


        function getNextBeat() {
            if (count >= beats.length - 1) {
                setCount(0);
                return 0;
            } else { 
                setCount(count + 1);

                return count + 1;
            }
        }


        function restartBeats() {
            setCount(-1);
        }


        return [beats, addBeat, removeLastBeat, getLastPlayed, getNextBeat, restartBeats]
    }


    useEffect(() => {
        var metronomeInterval = null;

        if (playing) {           
    
            metronomeInterval = setInterval(() => {
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
            clearInterval(metronomeInterval);
        }
    }, [playing, bpm, playHigh, playLow, getNextBeat, restartBeats])
       

    function handleKeyDown(e) {
        if (e.key === "t") {
            handleTapTempo(e);
        }
    }


    function handleTapTempo() {    

        let tapSeconds = new Date().getTime();
        
        let next_bpm = Math.floor(((1/ ((tapSeconds - lastTapSeconds) / 1000)) * 60 )); 
        setLastTapSeconds(tapSeconds);

        let avg = bpm;

        if (next_bpm !== 0) {
            avg *= lastBpms.length;
            setLastBpms([...lastBpms, next_bpm]); 
        } else {
            setLastBpms([...lastBpms, bpm]);
        }
        
        avg += next_bpm;
        avg /= (lastBpms.length + 1);
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
        <div onKeyDown={handleKeyDown} className='metronome'>
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
                <div className='flex metronome-box'>{beats.map((click) => 
                    <div key={click}>
                        {
                            getLastPlayed()===click ? 
                            <input type="radio" disabled className='metronome-radio metronome-radio-active' /> 
                            : 
                            <input type="radio" disabled className='metronome-radio' /> 
                        }
                    </div> )}
                </div>
                <div className='flex row'>
                    <button className='icon-btn' disabled={beats.length<2} onClick={removeLastBeat}><img className='icon-btn-img' src={minus} alt="minus icon" /></button>
                    <p className="text">{beats.length}</p>
                    <button className='icon-btn' disabled={beats.length>11} onClick={addBeat}><img className='icon-btn-img' src={plus} alt="plus icon" /></button>
                </div>
            </div>

            <div className='metronome-sliders metronome-block'>
                <div className='row metronome-box'> 
                    <p class="metronome-p">Volume</p>   
                    <input className='metronome-range' id='volume' type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} />
                </div>
                
                <div className='row metronome-box'>
                    <p class="metronome-p">BPM</p>   
                    <input className='metronome-range' id='bpm' type="range" min="30" max="260" value={bpm} onChange={handleBpmChange} />
                </div>

            </div>
        </div>
    )
}

export default Metronome;