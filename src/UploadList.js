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
      <div className='nav' style={{display:'flex', justifyContent:'space-between'}}>
        <h2 className="mb-4 text-dark" style={{ paddingTop: 20 }}>Mohan Video Store</h2>
        <div className="mt-3">
          <Link style={{background:"green"}} to="/" className="btn btn-secondary">Back</Link>
          <button onClick={reloadVideos} className="btn btn-primary ms-2">Reload</button>
        </div>
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {videos.map(({ url, ref }, index) => (
          <div key={index} className="col">
            <div className="card h-100" style={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
              <div
                ref={videoContainerRef}
                className="video-container"
                style={{ position: 'elative', cursor: 'pointer' }}
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
              <div className="card-body">
              <span className="text-primary me-3" onClick={() => handleDownload(url)}><RiVideoDownloadFill /></span>

                <span className="text-primary me-3" onClick={() => handleDelete(ref)}><MdDelete/></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UploadList;