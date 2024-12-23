import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from 'react-router-dom';


declare global {
  interface Window {
    kakao: any;
  }
}


const ShelterAddress: React.FC = () => {
  const { shelterId } = useParams();
  const mapRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState<string | null>(null);
  const location = useLocation();
  const { shelterName, address } = location.state as { shelterName: string; address: string };
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setToken(storedToken);
    } else {
      console.error("로컬 스토리지에 토큰이 없습니다.");
    }
  }, []);



  // 카카오 지도 API 연동
  useEffect(() => {
    if (!address) return;

    if (!window.kakao || !window.kakao.maps) {
      console.error("Kakao Maps API가 로드되지 않았습니다.");
      return;
    }
    
    window.kakao.maps.load(() => {
      if (!mapRef.current) {
        console.error("mapRef가 초기화되지 않았습니다.");
        return;
      }

      const mapInstance = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 기본 위치
        level: 5,
      });

      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.addressSearch(address, (result:any, status:any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

          // 지도 중심 이동
          mapInstance.setCenter(coords);

          // 마커 생성
          const marker = new window.kakao.maps.Marker({
            position: coords,
            map: mapInstance,
          });

          // 정보 오버레이 생성
          const overlayContent = `
            <div style="
              padding: 10px;
              text-align: center;
              background: white;
              border-radius: 4px;
              font-weight: bold;
              min-width: 120px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              font-size: 18px;
            ">
              ${shelterName}
              <div style="font-size: 12px; color: #888;">${address}</div>
            </div>
          `;
          const overlay = new window.kakao.maps.CustomOverlay({
            position: coords,
            content: overlayContent,
            xAnchor: 0.5,
            yAnchor: 1.5,
          });

          // 마커 클릭 시 오버레이 표시
          window.kakao.maps.event.addListener(marker, "click", () => {
            overlay.setMap(mapInstance);
          });
        } else {
          console.warn("주소 검색 결과가 없습니다.");
        }
      });
    });
  }, [token, address]);


  // 확인 버튼 클릭시 뒤로가기
  const Cancel = () => {
    navigate(-1); // 이전 페이지로 이동
  };  



  return (
    <div>
      <div className="flex flex-col items-center mt-20">
        <section>
          <h2 className="text-2xl font-bold">보호소 주소</h2>
        </section>
        <section className="flex flex-col items-center w-full max-w-lg my-3">
          <div className="flex flex-wrap justify-center gap-10 p-5">
            <div className="flex justify-between w-full p-3 border-b border-mainColor">
              <p className="text-xl font-bold">보호기관 이름</p>
              <p className="text-lg">{shelterName}</p>
            </div>
            <div className="flex justify-between w-full p-3 border-b border-mainColor">
              <p className="text-xl font-bold">주소</p>
              <p className="text-lg">{address}</p>
            </div>
          </div>
        </section>
        <section className="flex gap-24 my-3">
          <button className="px-4 py-2 text-lg font-bold text-mainColor hover:text-orange-600" onClick={Cancel}>확인</button>
        </section> 
      </div>
      <div className="flex justify-center m-10">
        <div ref={mapRef} className="w-[600px] h-[300px] rounded-lg border border-black"></div>  
      </div>
    </div>
  );
};

export default ShelterAddress;


