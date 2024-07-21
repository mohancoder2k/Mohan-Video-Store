// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
/*
const firebaseConfig = {
  apiKey: "AIzaSyBOeC2pBlJNchxKMll8KgQ25213tttCtYE",
  authDomain: "upload-store-4ee77.firebaseapp.com",
  projectId: "upload-store-4ee77",
  storageBucket: "upload-store-4ee77.appspot.com",
  messagingSenderId: "828400865333",
  appId: "1:828400865333:web:2335cefba44d0fdb51a17c"
};*/
const firebaseConfig = {
    apiKey: "AIzaSyCBbxxjfgvK_pk9kXYRC-n6BJ0R0T6opSw",
    authDomain: "mohan-cloud.firebaseapp.com",
    projectId: "mohan-cloud",
    storageBucket: "mohan-cloud.appspot.com",
    messagingSenderId: "1000812045377",
    appId: "1:1000812045377:web:bc29d2ea589379a226d2c0"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage, app };
export const fetchVideoUrls = async () => {
  const videoUrls = [];
  const listRef = ref(storage, 'videos/');
  const res = await listAll(listRef);

  for (const itemRef of res.items) {
    const url = await getDownloadURL(itemRef);
    videoUrls.push(url);
  }
  return videoUrls;
}
