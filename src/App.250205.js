import { useState, useEffect } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

// 환경 변수에서 Google Maps API 키 가져오기
const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

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
        const data = await response.json(); // JSON 형식으로 응답을 처리
        console.log('API 응답 JSON 데이터:', data);

        // 성공 시 데이터를 파싱하여 상태로 저장
        if (data.header.success) {
          setBusStops(data.body);
        } else {
          setError('버스 정류장 정보를 가져오지 못했습니다.');
        }
      } catch (err) {
        setError('버스 정류장 정보를 가져오는 중 오류가 발생했습니다.');
      }
    };

    fetchBusStops();
  }, []);

  if (!isLoaded) return <div>지도를 불러오는 중...</div>;

  return (
    <div style={{ textAlign: 'center', padding: '16px' }}>
      <Card>
        <h1>주변 버스 정류장</h1>
        {error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : busStops.length > 0 ? (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '16px',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>정류장 이름</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>거리 (m)</th>
              </tr>
            </thead>
            <tbody>
              {busStops.map((stop) => (
                <tr key={stop.bsId} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px' }}>{stop.bsNm}</td>
                  <td style={{ padding: '8px' }}>{stop.dist}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
          {/* 버스 정류장을 마커로 표시 */}
          {busStops.map((stop, index) => (
            <Marker
              key={index}
              position={{
                lat: yPos + (Math.random() - 0.5) * 0.001, // 좌표 정보를 API에서 제공하지 않기 때문에 임시로 랜덤하게 설정
                lng: xPos + (Math.random() - 0.5) * 0.001,
              }}
              title={stop.bsNm}
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