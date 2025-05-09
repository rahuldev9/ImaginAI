import { useState } from "react";
import axios from "axios";
import ImageLoader from "./Components/ImageLoader";
import DownloadBtn from "./Components/DownloadBtn";
import AudioPlayer from "./Components/AudioPlayer";
import SoundRecorder from "./Components/SoundRecorder";
import { MdOutlineRecordVoiceOver, MdRecordVoiceOver } from "react-icons/md";
import FullScreenLoader from "./Components/FullScreenLoader";
import Navbar from "./Components/Navbar";


const App = () => {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [Output, setOutput] = useState("");
  const [Loader, setLoader] = useState(false);
  const [audioFile, setAudioFile] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const startRecording = async () => {
    setPrompt("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const audioFileFromBlob = new File([audioBlob], "MyAudio.webm", {
          type: "audio/webm",
        });
        setAudioFile(audioFileFromBlob);
        setAudioURL(URL.createObjectURL(audioBlob));
        handleSubmit(audioFileFromBlob);
        setLoader(true);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()){
      setError('Enter the prompt!')
      return;
    }
    setLoading(true);
    setError("");
    setImage(""); 
    try {
      const response = await axios.post(
        "http://localhost:5000/generate-image",
        { prompt }
      );
      const imageUrl = response?.data?.imageUrl;
      if (imageUrl) {
        setImage(imageUrl);
      } else {
        throw new Error("Invalid image URL from backend");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      setError("Failed to generate image.");
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage("");
    setPrompt("");
    setError("");
  };

  const handleSubmit = async (audioBlobFile) => {
    const formData = new FormData();
    formData.append("audio", audioBlobFile);

    try {
      const response = await axios.post(
        "http://localhost:5000/transcribe-and-translate",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log(response.data);
      setOutput(response.data?.transcription);
      setPrompt(response.data?.transcription);
      setLoader(false);
    } catch (error) {
      console.error("Translation failed:", error);

      alert("Failed to translate the audio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <div
        className={`min-h-screen  p-6 flex flex-col items-center gap-8 ${
          isDarkMode
            ? "bg-slate-50 text-slate-900"
            : "bg-black text-slate-100"
        }`}
        
      >
        <div
          className={`max-w-2xl w-full p-6 rounded-2xl shadow-xl ${
            isDarkMode
              ? "bg-slate-50 text-black"
              : "bg-slate-950 text-slate-100"
          }`}
        >
          {Loader && <FullScreenLoader />}
          <textarea
            value={prompt}
            onChange={(e) => {setPrompt(e.target.value);
            setError('')}}
            placeholder="Describe the image you want to generate..."
            className={`w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-hidden resize-none ${
              isDarkMode
                ? "bg-slate-50 text-black"
                : "bg-black text-slate-100"
            }`}
          />

          {error && <p className="text-red-500 mb-2">{error}</p>}
          <div className="flex justify-between gap-4 flex-wrap">
            {/* Clear Button */}
            <div className="flex flex-row gap-2 flex-wrap">
              <button
                onClick={clearImage}
                className={`px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none transition-all transform hover:scale-105 active:scale-95 ${
                  !isDarkMode
                    ? "bg-slate-50 text-slate-900"
                    : "bg-slate-900 text-slate-100"
                }`}
                
              >
                Clear
              </button>
              <div
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-4 py-2 text-white rounded-lg transition ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isRecording ? (
                  <MdRecordVoiceOver />
                ) : (
                  <MdOutlineRecordVoiceOver />
                )}
              </div>
            </div>

            <button
              onClick={generateImage}
              disabled={loading}
              className={`px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none transition-all transform hover:scale-105 active:scale-95 ${
                  !isDarkMode
                    ? "bg-slate-50 text-slate-900"
                    : "bg-slate-900 text-slate-100"
                }`}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              ) : (
                <div></div>
              )}
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
        <div>
          <div className="flex items-center flex-row justify-start gap-3">
            <div>{isRecording && <SoundRecorder />}</div>
          </div>

          {audioURL && !isRecording && <AudioPlayer audioURL={audioURL} />}
        </div>

        <div className="grid grid-cols sm:grid-cols lg:grid-cols gap-4 place-items-center w-full">
  {loading ? (
    <div className="flex justify-center items-center w-[300px] h-[300px] bg-slate-700 bg-opacity-50 backdrop-blur-lg rounded-xl">
      <ImageLoader />
    </div>
  ) : image ? (
    <div className="w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden mt-4 relative">
      <img
        src={image}
        alt="Generated"
        className="w-full cursor-zoom-in"
      />
      <div className="absolute top-1 right-1">
        <a href={image} download="generated-image.png">
          <DownloadBtn />
        </a>
      </div>
    </div>
  ) : null}
</div>

      </div>
    </>
  );
};

export default App;
