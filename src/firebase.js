import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase 配置
// 请替换为您自己的 Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyDDCkdP5qs83CSjeaf1cwjT59gRILyFUqc",
  authDomain: "mini-social-media-ff5f9.firebaseapp.com",
  projectId: "mini-social-media-ff5f9",
  storageBucket: "mini-social-media-ff5f9.firebasestorage.app",
  messagingSenderId: "285984423637",
  appId: "1:285984423637:web:0974c7bd7257d696ec2c5c",
  measurementId: "G-VZJ1HB370G"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 导出认证和数据库实例
export const auth = getAuth(app);
export const db = getFirestore(app);


