import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from './firebase'; // Updated import
import { Link } from 'react-router-dom'; // Import Link for navigation

function Upload() {
  const [videos, setVideos] = useState([]);
  const [videoPerc, setVideoPerc] = useState({});
  const [uploading, setUploading] = useState(false);

  const playNotificationSound = () => {
    const audio = new Audio('./assets/notify.mp3'); // Add your sound file in the public directory
    audio.play().catch(error => {
      console.error('Error playing notification sound:', error);
    });
  };

  const uploadFile = (file, fileType) => {
    const storage = getStorage(app);
    const folder = "videos/";
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, folder + fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setVideoPerc(prev => ({ ...prev, [fileType]: Math.round(progress) }));
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
          default:
            break;
        }
      },
      (error) => {
        console.log(error);
        switch (error.code) {
          case "storage/unauthorized":
            console.log(error);
            break;
          case "storage/canceled":
            break;
          case "storage/unknown":
            break;
          default:
            break;
        }
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('DownloadURL - ', downloadURL);
          toast.success("Video uploaded successfully!");
          playNotificationSound();
          // If you need to extract audio, you can call extractAudio(downloadURL) here
        }).finally(() => {
          setUploading(false);
        });
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (videos.length === 0) {
      toast.error("Please select up to 100 videos to upload.");
      playNotificationSound();
      return;
    }
    if (!uploading) {
      setUploading(true);
      videos.forEach((video, index) => {
        uploadFile(video, `videoUrl${index}`);
      });
    }
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 100) {
      toast.error("You can upload a maximum of 100 videos at a time.");
      playNotificationSound();
      return;
    }
    setVideos(files);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Mohan Video Store</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="videos">Videos:</label>
          {videos.length > 0 && videos.map((video, index) => (
            <div key={index}>
              <div>{`Uploading ${index + 1}: ${videoPerc[`videoUrl${index}`] || 0}%`}</div>
              <div className="progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${videoPerc[`videoUrl${index}`] || 0}%` }}
                  aria-valuenow={videoPerc[`videoUrl${index}`] || 0}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {videoPerc[`videoUrl${index}`] || 0}%
                </div>
              </div>
            </div>
          ))}
          <input
            type="file"
            accept="video/*"
            id="videos"
            className="form-control"
            onChange={handleVideoChange}
            multiple
          />
        </div>
        <br />
        <button type="submit" className="btn btn-primary" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      <ToastContainer />
      <div className="mt-3">
        <Link to="/upload-list" className="btn btn-secondary">View Uploaded Videos</Link>
      </div>
    </div>
  );
}

export default Upload;
