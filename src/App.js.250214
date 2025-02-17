import React, { useState, useEffect } from 'react';

export default function BusStopApp() {
  const [busStops, setBusStops] = useState([]);
  const [arrivalInfo, setArrivalInfo] = useState({});
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
            `https://businfo.daegu.go.kr:8095/dbms_web_api/bs/nearby?xPos=${position.xPos}&yPos=${position.yPos}&radius=400`
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

  useEffect(() => {
    const fetchArrivalInfo = async (bsId) => {
      try {
        const response = await fetch(`https://businfo.daegu.go.kr:8095/dbms_web_api/realtime/arr2/${bsId}`);
        const data = await response.json();
        return data.header.success && data.body.list ? data.body.list : [];
      } catch {
        return [];
      }
    };

    const fetchAllArrivalInfo = async () => {
      const newArrivalInfo = {};
      for (const stop of busStops) {
        newArrivalInfo[stop.bsId] = await fetchArrivalInfo(stop.bsId);
      }
      setArrivalInfo(newArrivalInfo);
    };

    if (busStops.length) fetchAllArrivalInfo();
  }, [busStops]);

  if (!busStops.length && !error) return <div>버스 정류장을 불러오는 중...</div>;

  const renderBusStopTable = () => (
    busStops.map((stop) => {
      const buses = arrivalInfo[stop.bsId] || [];
      if (!buses.length) {
        return (
          <tr key={stop.bsId}>
            <td colSpan="4" style={{ padding: '8px', textAlign: 'center', border: '1px solid #ccc' }}>
              {stop.bsNm} - 도착 정보 없음
            </td>
          </tr>
        );
      }
      return buses.map((bus, index) => {
        const { arrList = [] } = bus;
        const firstBusArr = arrList[0] || {};

        // 도착 상태가 '전' 또는 '전전'일 경우 빨간색으로 표시하는 조건
        const isDelayed = (arrState) => {
          return arrState === '전' || arrState === '전전';
        };
        return (
          <tr key={`${stop.bsId}-${index}`}>
            {index === 0 && (
              <td rowSpan={buses.length} style={{ padding: '8px', textAlign: 'center', border: '1px solid #ccc' }}>
                <a href={`https://businfo.daegu.go.kr:8095/dbms_web/map?mapMode=0&searchText=${stop.bsNm}`} target="_blank" rel="noopener noreferrer">
                  {stop.bsNm}
                </a>
              </td>
            )}
            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ccc' }}><strong>{bus.routeNo}</strong></td>
            <td style={{ padding: '8px', textAlign: 'center', color: isDelayed(firstBusArr.arrState) ? 'red' : 'black', border: '1px solid #ccc' }}>
              {firstBusArr.arrState || '정보 없음'}
            </td>
            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ccc' }}>{firstBusArr.bsGap || '정보 없음'}</td>
            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ccc' }}>{firstBusArr.bsNm || '정보 없음'}</td>
          </tr>
        );
      });
    })
  );

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>근처버스</h1>
      {error ? (
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', textAlign: 'center', border: '1px solid #ccc' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', backgroundColor: '#f2f2f2', border: '1px solid #ccc' }}>정류장</th>
              <th style={{ padding: '8px', backgroundColor: '#f2f2f2', border: '1px solid #ccc' }}>버스</th>
              <th style={{ padding: '8px', backgroundColor: '#f2f2f2', border: '1px solid #ccc' }}>도착</th>
              <th style={{ padding: '8px', backgroundColor: '#f2f2f2', border: '1px solid #ccc' }}>X</th>
              <th style={{ padding: '8px', backgroundColor: '#f2f2f2', border: '1px solid #ccc' }}>현재</th>
            </tr>
          </thead>
          <tbody>
            {renderBusStopTable()}
          </tbody>
        </table>
      )}
    </div>
  );
}