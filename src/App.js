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
          (position) => {
            const { latitude, longitude } = position.coords;
            setPosition({ xPos: longitude, yPos: latitude });
          },
          (error) => {
            setError('사용자의 위치를 가져올 수 없습니다.');
          }
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

          const savedOrder = localStorage.getItem('busStopOrder');
          if (savedOrder) {
            const orderedStops = JSON.parse(savedOrder).map((bsId) =>
              data.body.find((stop) => stop.bsId === bsId)
            );
            setBusStops(orderedStops.filter(Boolean));
          } else {
            setBusStops(data.body);
          }
        } catch (err) {
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
        if (data.header.success && data.body.list) {
          return data.body.list;
        } else {
          return [];
        }
      } catch (err) {
        return [];
      }
    };

    const fetchAllArrivalInfo = async () => {
      const newArrivalInfo = {};
      for (const stop of busStops) {
        const info = await fetchArrivalInfo(stop.bsId);
        newArrivalInfo[stop.bsId] = info;
      }
      setArrivalInfo(newArrivalInfo);
    };

    if (busStops.length > 0) {
      fetchAllArrivalInfo();
    }
  }, [busStops]);

  if (!busStops.length && !error) return <div>버스 정류장을 불러오는 중...</div>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
      <h1>출근</h1>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px',
            border: '1px solid #ddd',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '8px', backgroundColor: '#f2f2f2' }}>정류장</th>
              <th style={{ padding: '8px', backgroundColor: '#f2f2f2' }}>버스</th>
              <th style={{ padding: '8px', backgroundColor: '#f2f2f2' }}>도착</th>
              <th style={{ padding: '8px', backgroundColor: '#f2f2f2' }}>현재</th>
              <th style={{ padding: '8px', backgroundColor: '#f2f2f2' }}>.</th>
            </tr>
          </thead>
          <tbody>
            {busStops.map((stop) => (
              <React.Fragment key={stop.bsId}>
                {arrivalInfo[stop.bsId]?.map((bus, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px' }}>
                      <a
                        href={`https://businfo.daegu.go.kr:8095/dbms_web/map?mapMode=0&searchText=${stop.bsNm}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {stop.bsNm}
                      </a>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <strong>{bus.routeNo}</strong>
                    </td>
                    <td style={{ padding: '8px' }}>
                      {bus.arrList.length > 0 ? (
                        bus.arrList.map((arr, idx) => (
                          <div key={idx}>
                            {arr.arrState}
                          </div>
                        ))
                      ) : (
                        <div>도착 정보 없음</div>
                      )}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {bus.arrList.length > 0 ? (
                        bus.arrList.map((arr, idx) => (
                          <div key={idx}>
                            {arr.bsNm}
                          </div>
                        ))
                      ) : (
                        <div>정보 없음</div>
                      )}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {bus.arrList.length > 0 ? (
                        bus.arrList.map((arr, idx) => (
                          <div key={idx}>
                            {arr.bsGap}
                          </div>
                        ))
                      ) : (
                        <div>정보 없음</div>
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}