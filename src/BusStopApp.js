import React, { useState, useEffect } from 'react';

export default function BusStopApp() {
  const [busStops, setBusStops] = useState([]);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState({ xPos: null, yPos: null });

  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => setPosition({ xPos: coords.longitude, yPos: coords.latitude }),
          () => setError('사용자의 위치를 가져올 수 없습니다.')
        );
      } else {
        setError('Geolocation을 지원하지 않는 브라우저입니다.');
      }
    };
    getUserLocation();
  }, []);

  useEffect(() => {
    if (position.xPos && position.yPos) {
      const fetchBusStops = async () => {
        try {
          const response = await fetch(
            `https://businfo.daegu.go.kr:8095/dbms_web_api/bs/nearby?xPos=${position.xPos}&yPos=${position.yPos}&radius=1000`
          );
          const data = await response.json();
          setBusStops(data.body);
        } catch {
          setError('버스 정류장 정보를 가져오는 중 오류가 발생했습니다.');
        }
      };
      fetchBusStops();
    }
  }, [position]);

  if (!busStops.length && !error) return <div>버스 정류장을 불러오는 중...</div>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', margin: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>근처버스 정류장</h1>
      {error ? (
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', border: '1px solid #ccc' }}>
          <thead>
            <tr>
              <th style={{ padding: '6px', backgroundColor: '#f2f2f2', border: '1px solid #ccc' }}>거리 (m)</th>
              <th style={{ padding: '6px', backgroundColor: '#f2f2f2', border: '1px solid #ccc' }}>버스 정류장</th>
            </tr>
          </thead>
          <tbody>
            {busStops.map((stop) => (
              <tr key={stop.bsId}>
                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{stop.dist}m</td>
                <td style={{ padding: '6px', border: '1px solid #ccc' }}>
                  <a href={`/${encodeURIComponent(stop.bsNm)}`} style={{ textDecoration: 'none', color: '#0066cc' }}>
                    {stop.bsNm}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}