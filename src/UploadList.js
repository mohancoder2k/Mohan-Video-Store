import React, { useEffect, useState, useRef } from 'react';
import { storage } from './firebase';
import { listAll, ref, getDownloadURL, deleteObject } from "firebase/storage";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Link } from 'react-router-dom';

import { RiVideoDownloadFill } from "react-icons/ri";
import { MdDelete } from "react-icons/md";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UploadList() {
  const [videos, setVideos] = useState([]);
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
      setVideos(prevVideos => prevVideos.filter(video => video.ref!== videoRef));
      toast.success('Video deleted successfully.');
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video.');
    }
  };

  const reloadVideos = () => {
    fetchVideos();
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
      <div className='nav d-flex justify-content-between align-items-center'>
        <div>
          <h2 className="mb-2 text-dark" style={{ paddingTop: 20, fontFamily: 'Arial, sans-serif' }}>Mohan Video Store</h2>
          <p className="text-muted mb-0">Total Videos: {videos.length}</p>
        </div>
        <div className="mt-3">
          <Link to="/" className="btn btn-success text-white">Back</Link>
          <button onClick={reloadVideos} className="btn btn-primary ms-2">Reload</button>
        </div>
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mt-3">
        {videos.map(({ url, ref }, index) => (
          <div key={index} className="col">
            <div className="card h-100 border-light shadow-sm">
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
                >
                  <source src={url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="card-body d-flex justify-content-between align-items-center">
                <span 
                  className="text-success me-3 fs-4" 
                  onClick={() => handleDownload(url)}
                >
                  <RiVideoDownloadFill />
                </span>
                <span 
                  className="text-danger fs-4" 
                  onClick={() => handleDelete(ref)}
                  style={{ cursor: 'pointer' }}
                  data-bs-toggle="tooltip" 
                  data-bs-placement="top" 
                  title="Delete"
                >
                  <MdDelete />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UploadList;
