import { useState, useEffect, useRef } from 'react';
import placeholderImage from '../img/metronome.png';
import metSoundHi from "../static/ping-hi.mp3";
import metSoundLow from "../static/ping-low.mp3";



function Metronome() {
    //const metronomeRef = useRef();
    
    /*const [metronome, setMetronome] = useState({
        audio: new Audio(metSound),
        playing: false,
        volume: 1,
        bpm: 100
    }) */

    const [metronome, handleMetronomeChange] = useMetronome();


    function useMetronome() {
        const metronomeRef = useRef();

        const [sound, setSound] = useState(metSoundHi);
        
        const [clicks, addClick] = useClickSound();


        function useClickSound() {
            const [clicks, setClicks] = useState([new Audio(metSoundLow), new Audio(metSoundLow)]);

            function addClick(s) {
                setClicks([...clicks, s]);
            }

            return [clicks, addClick]
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
                case "sound":
                    setSound(e.target.value);
                    break;

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
                var count = 0;
    
                metronomeRef.current = setInterval(() => {
                    if (count <= clicks.length - 1) {
                        clicks[count].play();
                        clicks[count].volume = metronome.volume;
                        count++;
                    } else {
                        count = 1;
                        clicks[0].play();
                        clicks[0].volume = metronome.volume;
                    }
                }, (60 * 1000 / metronome.bpm));
                
                
            } else {
                clearInterval(metronomeRef.current);
            }

            
        })

        return [metronome, handleMetronomeChange];
    }

    
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
                <div className='row'> 
                    <p>Volume</p>   
                    <input id='volume' type="range" min="0" max="1" step="0.01" value={metronome.volume} onChange={handleMetronomeChange} />
                </div>
                
                <div className='row'>
                    <p>BPM</p>   
                    <input id='bpm' type="range" min="30" max="260" value={metronome.bpm} onChange={handleMetronomeChange} />
                </div>
            </div>

            

        </div>
    )
}

export default Metronome;