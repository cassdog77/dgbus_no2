import { useState, useEffect } from 'react';

// Card 컴포넌트 생성
const Card = ({ children }) => (
  <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
    {children}
  </div>
);
//aaaa
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

export default function LocationMapApp() {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          setError(err.message);
        }
      );
    } else {
      setError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
    }
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '16px' }}>
      <Card>
        <h1>내 위치</h1>
        {error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : location.lat && location.lng ? (
          <div>
            <p>위도: {location.lat}</p>
            <p>경도: {location.lng}</p>
            <iframe
              src={`https://www.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
              width="100%"
              height="400"
              allowFullScreen
              loading="lazy"
              title="My Current Location Map"
            ></iframe>
          </div>
        ) : (
          <p>위치를 불러오는 중...</p>
        )}
      </Card>
      <Button onClick={() => window.location.reload()}>
        위치 새로고침
      </Button>
    </div>
  );
}