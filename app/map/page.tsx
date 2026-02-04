'use client';

import { number } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';

type Position = {
  latitude: number;
  longitude: number;
};

const MapPage = () => {
  const [position, setPosition] = useState<Position | null>(null);

  const openInGoogleMaps = useCallback(() => {
    if (!position) return;

    // 構建 Google Maps 網址
    // z=15 是縮放層級，q 代表標記點
    const url = `https://www.google.com/maps/search/?api=1&query=${position.latitude},${position.longitude}`;

    // 開啟新視窗
    window.open(url, '_blank');
  }, [position]);

  useEffect(() => {
    // 檢查瀏覽器是否支援定位功能
    if ("geolocation" in navigator) {

      // 設定定位參數 (Options)
      const options = {
        enableHighAccuracy: true, // 是否使用高精確度 (如 GPS)，在手機端非常重要
        timeout: 10000,          // 等待回應的最長時間 (毫秒)
        maximumAge: 0            // 不使用緩存的定位資料
      };

      console.log("正在請求定位權限...");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // 成功取得座標
          const { latitude, longitude, accuracy } = position.coords;
          setPosition({ latitude, longitude });

          console.log("定位成功！");
          console.log(`緯度: ${latitude}`);
          console.log(`經度: ${longitude}`);
          console.log(`誤差範圍: ${accuracy} 公尺`);
        },
        (error) => {
          // 處理失敗情況
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.error("使用者拒絕提供定位權限。");
              break;
            case error.POSITION_UNAVAILABLE:
              console.error("無法取得定位資訊 (可能是收訊不好或設備 GPS 未開啟)。");
              break;
            case error.TIMEOUT:
              console.error("定位要求逾時。");
              break;
            default:
              console.error("發生未知錯誤。");
              break;
          }
        },
        options
      );

    } else {
      console.error("你的瀏覽器不支援 Geolocation API");
    }
  }, []);

  return (
    <>
      {position ? (
        <div className="w-full">
          <div className="w-full my-5 flex justify-center">
            <h1 className="text-5xl">
              {position.latitude}, {position.longitude}
            </h1>
          </div>
          <div className="w-full flex justify-center">
            <button
              onClick={openInGoogleMaps}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-transform active:scale-95 shadow-lg flex items-center"
            >
              📍 在 Google 地圖中開啟
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold text-gray-700">正在取得精確 GPS 定位...</h2>
          </div>
        </div>
      )}
    </>
  );
};

export default MapPage;