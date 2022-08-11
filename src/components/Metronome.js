import { useState, useEffect, useRef } from 'react';
import useSound from 'use-sound';
import placeholderImage from '../img/metronome.png';
import metSoundHi from "../static/metronome2.mp3";
import pingSoundHi from "../static/ping-hi.mp3";
import metSoundLow from "../static/metronome1.mp3";
import pingSoundLow from "../static/ping-low.mp3";



function Metronome() {
    const metronomeRef = useRef();

    const [sounds, index, changeChosenSound] = useSoundMachine();


    const [high] = useSound(sounds[index].high);
    const [low] = useSound(sounds[index].low);
    


    function useSoundMachine() {
        const [sounds] = useState([{high: metSoundHi, low: metSoundLow}, {high: pingSoundHi, low: pingSoundLow}]);
        const [index, setIndex] = useState(1);
        

        function changeChosenSound(i) {
            if (i >= 0 && i < sounds.length) {
                setIndex(i);
            }
        }

        return [sounds, index, changeChosenSound];
    }
    
    const [clicks, addClick, removeLastClick, getLastPlayed, playNextClick, restartClicks] = useClickSound();


    function useClickSound() {
        const [clicks, setClicks] = useState([0, 1]);
        const [count, setCount] = useState(-1);

        function addClick() {
            setClicks([...clicks, clicks.length]);
            restartClicks();
        }

        function removeLastClick() {
            setClicks(clicks.splice(0,clicks.length-1));
            restartClicks();
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

    const [metronome, setMetronome] = useState({
        playing: false,
        volume: 1,
        bpm: 100
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
            playing: playing,
            volume: volume,
            bpm: bpm
        })
    }

    useEffect(() => {
        if (metronome.playing) {
            clearInterval(metronomeRef.current);
            
    
            metronomeRef.current = setInterval(() => {
                let count = playNextClick();
    
                if (count === 0) {
                    high();
                    
                } else {
                    low();
                }
                
                
            }, (60 * 1000 / metronome.bpm));
            
            
        } else {
            clearInterval(metronomeRef.current);
            restartClicks();
        }
    })
       
    

    
    const [lastTapSeconds, setLastTapSeconds] = useState(0);
    const [beats, setBeats] = useState([]);
    const [average, setAverage] = useState(0);

    const [message, setMessage] = useState("");

    


    

    function handleKeyDown(e) {
        if (e.key === "t") {
            handleTapTempo(e);
        }
    }

    function handleTapTempo(e) {
                
        let tapSeconds = new Date().getTime();
        
        let bpm = ((1/ ((tapSeconds - lastTapSeconds) / 1000)) * 60 ); 
        setLastTapSeconds(tapSeconds);


        if (Math.floor(bpm) !== 0) {
            let avg = average * beats.length;
            avg += Math.floor(bpm);
            avg /= (beats.length + 1);

            setBeats([...beats, Math.floor(bpm)]); 

            setAverage(Math.floor(avg));

            handleMetronomeChange({
                target: {
                    id: "bpm",
                    value: Math.floor(bpm)
                }
            })

            console.log(beats, average)
        }

        if(beats.length >= 10) {
            handleMetronomeChange({
                target: {
                    id: "bpm",
                    value: average
                }
            })

            setMessage("Average: " + average);
            setAverage(0);
            setLastTapSeconds(0);
            setBeats([]);
        }

        

    }
    
    return (
        <div onKeyDown={handleKeyDown} className='metronome'>
            <div className='metronome-graphic'>
                <img src={placeholderImage} alt="Placeholder for the Metronome"/>
            </div>

            <div className='flex'>
                <button className='metronome-btn' id='playing' onClick={handleMetronomeChange}>{metronome.playing ? "Pause" : "Play"}</button>
            </div>

            <div className='flex column'>
                {message !== "" ? <h3>{ message }</h3> : <h3>{ metronome.bpm }</h3>}
                
                <button className='metronome-btn' onClick={handleTapTempo}>BPM</button>
            </div>
            
            <div className='flex column'>
                <div className='flex'>{clicks.map((click) => 
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
                    <button className='metronome-btn' onClick={addClick}>Add Click</button>
                    <button className='metronome-btn' onClick={removeLastClick}>Remove Click</button>
                </div>
            </div>

            <div className='flex column'>
                <div className='row'> 
                    <p>Volume</p>   
                    <input id='volume' type="range" min="0" max="1" step="0.01" value={metronome.volume} onChange={handleMetronomeChange} />
                </div>
                
                <div className='row'>
                    <p>BPM</p>   
                    <input id='bpm' type="range" min="30" max="260" value={metronome.bpm} onChange={handleMetronomeChange} />
                </div>

                <div className='row'>
                    {sounds.map((sound,index) => <button key={index} onClick={() => changeChosenSound(index)}>{ index }</button>)}
                </div>
            </div>

            

        </div>
    )
}

export default Metronome;