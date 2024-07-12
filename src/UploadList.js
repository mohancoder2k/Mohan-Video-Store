import React, { useEffect, useState, useRef } from 'react';
import { storage } from './firebase';
import { listAll, ref, getDownloadURL, deleteObject } from "firebase/storage";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { Link } from 'react-router-dom';
function UploadList() {
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRefs = useRef([]);
  const videoContainerRef = useRef(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const listRef = ref(storage, 'videos/');
      const res = await listAll(listRef);
      const urls = await Promise.all(res.items.map(async item => {
        const url = await getDownloadURL(item);
        return { url, ref: item };
      }));
      setVideos(urls);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'video.mp4'; // Default filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (videoRef) => {
    try {
      await deleteObject(videoRef);
      setVideos(prevVideos => prevVideos.filter(video => video.ref !== videoRef));
      alert('Video deleted successfully.');
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video.');
    }
  };

  const playVideo = (index) => {
    if (index !== currentVideoIndex) {
      if (videoRefs.current[currentVideoIndex]) {
        videoRefs.current[currentVideoIndex].pause();
      }
      setCurrentVideoIndex(index);
    }
    setIsPlaying(true);
    if (videoRefs.current[index]) {
      videoRefs.current[index].play();
    }
  };

  const pauseVideo = () => {
    setIsPlaying(false);
    if (videoRefs.current[currentVideoIndex]) {
      videoRefs.current[currentVideoIndex].pause();
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseVideo();
    } else {
      playVideo(currentVideoIndex);
    }
  };

  const playNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      playVideo(currentVideoIndex + 1);
    }
  };

  const playPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      playVideo(currentVideoIndex - 1);
    }
  };

  const toggleFullscreen = () => {
    const videoContainer = videoContainerRef.current;
    if (videoContainer.requestFullscreen) {
      videoContainer.requestFullscreen();
    } else if (videoContainer.mozRequestFullScreen) { /* Firefox */
      videoContainer.mozRequestFullScreen();
    } else if (videoContainer.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      videoContainer.webkitRequestFullscreen();
    } else if (videoContainer.msRequestFullscreen) { /* IE/Edge */
      videoContainer.msRequestFullscreen();
    }
  };

  return (
    <div className="container mt-5">
        <div  className='nav' style={{display:'flex', justifyContent:'space-between'}}>
      <h2 className="mb-4 text-dark" style={{ paddingTop: 20 }}>Mohan Video Store</h2>
      <div className="mt-3">
        <Link  style={{background:"green"}}  to="/" className="btn btn-secondary">Back</Link>
      </div>
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {videos.map(({ url, ref }, index) => (
          <div key={index} className="col">
            <div className="card h-100" style={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
              <div
                ref={videoContainerRef}
                className="video-container"
                style={{ position: 'relative', cursor: 'pointer' }}
                onClick={toggleFullscreen}
              >
                <video
                  ref={el => videoRefs.current[index] = el}
                  className="card-img-top"
                  controls
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  onEnded={playNextVideo}
                >
                  <source src={url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="fullscreen-controls">
                  <button className="btn btn-secondary me-2" onClick={playPreviousVideo} disabled={currentVideoIndex === 0}>Previous</button>
                  <button className="btn btn-secondary me-2" onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
                  <button className="btn btn-secondary" onClick={playNextVideo} disabled={currentVideoIndex === videos.length - 1}>Next</button>
                </div>
              </div>
              <div className="card-body">
                <p className="card-text">Video Description or Title</p>
                <button className="btn btn-primary me-2" onClick={() => handleDownload(url)}>Download</button>
                <button className="btn btn-danger" onClick={() => handleDelete(ref)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UploadList;
