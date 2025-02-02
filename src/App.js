import { useState, useEffect } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

// 환경 변수에서 Google Maps API 키 가져오기
const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
console.log('Google Maps API Key:', googleMapsApiKey);

// Card 컴포넌트 생성
const Card = ({ children }) => (
  <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
    {children}
  </div>
);

// Button 컴포넌트 생성
const Button = ({ onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      backgroundColor: '#007BFF',
      color: 'white',
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginTop: '8px',
    }}
  >
    {children}
  </button>
);

export default function BusStopApp() {
  const [busStops, setBusStops] = useState([]);
  const [error, setError] = useState(null);

  // 지정된 좌표
  const xPos = 128.640765;
  const yPos = 35.8681438;



  const { isLoaded } = useLoadScript({
    googleMapsApiKey,
  });

  useEffect(() => {
    const fetchBusStops = async () => {
      try {
        const response = await fetch(
          `https://businfo.daegu.go.kr:8095/dbms_web_api/bs/nearby?xPos=${xPos}&yPos=${yPos}&radius=500`
        );
        const text = await response.text();

        // 데이터를 파싱하여 화면에 표시
        const busStopData = parseBusStopData(text);
        setBusStops(busStopData);
      } catch (err) {
        setError('버스 정류장 정보를 가져오는 중 오류가 발생했습니다.');
      }
    };

    fetchBusStops();
  }, []);

  // 데이터를 파싱하는 함수
  const parseBusStopData = (data) => {
    const parsedData = data
      .split(/(\d{10}[가-힣]+)/) // 정류장 ID로 데이터를 분리
      .filter((item) => item.trim().length > 0) // 빈 항목 제거
      .map((item) => {
        const stopId = item.match(/\d{10}/)[0];
        const stopName = item.split(stopId)[1].match(/[가-힣]+/)[0];
        const distance = item.split(stopId)[1].match(/\d+\.\d+/)[0];
        return { stopId, stopName, distance };
      });

    return parsedData;
  };

  if (!isLoaded) return <div>지도를 불러오는 중...</div>;

  return (
    <div style={{ textAlign: 'center', padding: '16px' }}>
      <Card>
        <h1>주변 버스 정류장</h1>
        {error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : busStops.length > 0 ? (
          <div>
            {busStops.map((stop) => (
              <div key={stop.stopId} style={{ marginBottom: '16px' }}>
                <p>정류장 이름: {stop.stopName}</p>
                <p>거리: {stop.distance}m</p>
              </div>
            ))}
          </div>
        ) : (
          <p>버스 정류장을 불러오는 중...</p>
        )}
      </Card>

      {/* Google 지도 */}
      <div style={{ height: '500px', width: '100%', marginTop: '16px' }}>
        <GoogleMap
          center={{ lat: yPos, lng: xPos }}
          zoom={15}
          mapContainerStyle={{ width: '100%', height: '100%' }}
        >
          {/* 사용자 주변의 버스 정류장을 마커로 표시 */}
          {busStops.map((stop, index) => (
            <Marker
              key={index}
              position={{
                lat: yPos + (Math.random() - 0.5) * 0.001, // 예시 좌표. 실제로는 정류장의 정확한 좌표 필요
                lng: xPos + (Math.random() - 0.5) * 0.001,
              }}
              title={stop.stopName}
            />
          ))}
        </GoogleMap>
      </div>

      <Button onClick={() => window.location.reload()}>
        정류장 새로고침
      </Button>
    </div>
  );
}