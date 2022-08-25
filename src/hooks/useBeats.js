import { useState } from 'react';

// Custom useBeats Hook
export function useBeats() {
    // Array of Integers denoting the number of beats and their index
   const [beats, setBeats] = useState(()=> {
       if (localStorage.getItem("beats")) {
           return parseInt(localStorage.getItem("beats"));
       } else {
           return 2;
       }
   });

   const [count, setCount] = useState(-1);     // Index of next beat to play

   function getBeatsVisual() {
       let beatsVisual = []

       for (let i = 0; i < beats; i++){
           beatsVisual.push(<div key={i}>
               {
                   getLastPlayed()===i ? 
                   <input type="radio" disabled className='metronome-radio metronome-radio-active' /> 
                   : 
                   <input type="radio" disabled className='metronome-radio' /> 
               }
           </div> )
           }

       return beatsVisual;
   }

   function addBeat() {
       if (beats < 12) {
           localStorage.setItem("beats", (beats + 1));

           setBeats(beats + 1);
           restartBeats();

       }
   }


   function removeLastBeat() {
       if (beats > 1) {
           localStorage.setItem("beats", (beats - 1));

           setBeats(beats - 1);
           restartBeats();
       }
   }


   function getLastPlayed() {
       return count;
   }


   function getNextBeat() {
       if (count >= beats - 1) {
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


   return {beats: beats, addBeat: addBeat, removeLastBeat: removeLastBeat, getBeatsVisual: getBeatsVisual, getNextBeat: getNextBeat, restartBeats: restartBeats}
}