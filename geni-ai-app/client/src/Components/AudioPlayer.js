import React, { useRef, useState, useEffect } from "react";
import { FaPlay, FaPause, FaVolumeUp } from "react-icons/fa";
import SoundRecorder from "./SoundRecorder";

const AudioPlayer = ({ audioURL }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false); // Track whether the audio is playing
  const [volume, setVolume] = useState(1); // Track volume (1 is max)

  // Play or pause the audio
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    audioRef.current.volume = newVolume;
    setVolume(newVolume); // Update the volume state
  };

  // Reset play button after audio ends
  useEffect(() => {
    const audio = audioRef.current;

    const handleAudioEnded = () => {
      setIsPlaying(false); // Reset play button to "Play" when audio ends
    };

    if (audio) {
      audio.addEventListener("ended", handleAudioEnded);
    }

    // Cleanup the event listener when component is unmounted
    return () => {
      if (audio) {
        audio.removeEventListener("ended", handleAudioEnded);
      }
    };
  }, []);

  return (
    <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-xl">
      <span className="text-sm font-semibold text-white block mb-3">
        🎧 Listen
      </span>
      <div className="flex flex-col items-center gap-4">
        <div>{isPlaying ? <SoundRecorder /> : <p></p>}</div>
        <div className="flex items-center flex-row justify-between gap-4">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full transition-all transform hover:scale-110 focus:outline-none"
            title={isPlaying ? "Pause" : "Play"}
            type="button"
          >
            {isPlaying ? (
              <FaPause className="text-2xl" />
            ) : (
              <FaPlay className="text-2xl" />
            )}
          </button>
          <div className="flex items-center gap-3 ">
            <FaVolumeUp className="text-white text-lg" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full"
            />
          </div>
        </div>
      </div>
      <audio ref={audioRef} src={audioURL} preload="metadata" />
    </div>
  );
};

export default AudioPlayer;
