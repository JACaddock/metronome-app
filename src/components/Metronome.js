import { useState, useEffect } from 'react';
import useSound from 'use-sound';
import placeholderImage from '../img/metronome.png';
import pingSoundHi from "../static/ping-hi.mp3";
import pingSoundLow from "../static/ping-low.mp3";



function Metronome() {   

    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [bpm, setBpm] = useState(100);


    const [high] = useSound(pingSoundHi, {
        id: "high",
        volume: volume
    }) ;
    const [low] = useSound(pingSoundLow, {
        id: "low",
        volume: volume
    });
    
    const [lastTapSeconds, setLastTapSeconds] = useState(0);
    const [beats, setBeats] = useState([]);  


    
    const [clicks, addClick, removeLastClick, getLastPlayed, playNextClick, restartClicks] = useClickSound();


    function useClickSound() {
        const [clicks, setClicks] = useState([0, 1]);
        const [count, setCount] = useState(-1);

        function addClick() {
            if (clicks.length < 12) {
                setClicks([...clicks, clicks.length]);
                restartClicks();
            }
        }

        function removeLastClick() {
            if (clicks.length > 1) {
                setClicks(clicks.splice(0,clicks.length-1));
                restartClicks();
            }
        }

        function getLastPlayed() {
            return count;
        }

        function playNextClick() {
            if (count >= clicks.length - 1) {
                setCount(0);
                return 0;
            } else { 
                setCount(count + 1);

                return count + 1;
            }
        }

        function restartClicks() {
            setCount(-1);
        }

        return [clicks, addClick, removeLastClick, getLastPlayed, playNextClick, restartClicks]
    }


    useEffect(() => {
        var metronomeInterval = null;

        if (playing) {           
    
            metronomeInterval = setInterval(() => {
                let count = playNextClick();
    
                if (count === 0) {
                    high();
                    
                } else {
                    low();
                }
                
                
            }, (60 * 1000 / bpm));
            
            
        } else {
            restartClicks();
        }

        return () => {
            clearInterval(metronomeInterval);
        }
    }, [playing, bpm, high, low, playNextClick, restartClicks])
       
    

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
            avg *= beats.length;
            setBeats([...beats, next_bpm]); 
        } else {
            setBeats([...beats, bpm]);
        }
        
        avg += next_bpm;
        avg /= (beats.length + 1);

        setBpm(Math.floor(avg));
        
        
        if(beats.length >= 10) {
            setLastTapSeconds(0);
            setBeats([]);
        }

    }


    function handleVolumeChange(e) {
        setVolume(e.target.value);
    }

    function handleBpmChange(e) {
        setBpm(e.target.value);
        setBeats([]);
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
                    <h3 className='metronome-box'>Current BPM</h3>
                    <p className='metronome-box'>{ bpm }</p>
                </div>
                    
                <button className='metronome-btn' onClick={handleTapTempo}>Tap Tempo</button>                  
                
                
            </div>
            
            <div className='flex column metronome-block'>
                <div className='flex metronome-box'>{clicks.map((click) => 
                    <div key={click}>
                        {
                            getLastPlayed()===click ? 
                            <input type="radio" disabled className='metronome-radio metronome-radio-active' /> 
                            : 
                            <input type="radio" disabled className='metronome-radio' /> 
                        }
                    </div> )}
                </div>
                <div className='flex row metronome-box'>
                    <button className='metronome-btn' disabled={clicks.length>11} onClick={addClick}>Add Click</button>
                    <button className='metronome-btn' disabled={clicks.length<2} onClick={removeLastClick}>Remove Click</button>
                </div>
            </div>

            <div className='flex column metronome-block'>
                <div className='row metronome-box'> 
                    <p>Volume</p>   
                    <input id='volume' type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} />
                </div>
                
                <div className='row metronome-box'>
                    <p>BPM</p>   
                    <input id='bpm' type="range" min="30" max="260" value={bpm} onChange={handleBpmChange} />
                </div>

            </div>
        </div>
    )
}

export default Metronome;