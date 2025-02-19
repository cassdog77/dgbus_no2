import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet'; // Helmet을 import

export default function BusStopDetails() {
  const { stopName } = useParams(); // URL에서 stopName을 가져옴
  const [busStops, setBusStops] = useState({}); // 연관 배열
  const [arrivalInfo, setArrivalInfo] = useState([]); // 도착 정보
  const [error, setError] = useState(null); // 에러 상태

  // API에서 버스 정류장 정보를 가져와 연관 배열을 만든 후 상태에 저장
  useEffect(() => {
    const fetchBusStops = async () => {
      try {
        const response = await fetch('https://businfo.daegu.go.kr:8095/dbms_web_api/autocomplete');
        const data = await response.json();

        if (data.header.success) {
          // 연관 배열 형태로 변환, value와 wincId를 함께 저장
          const stopsMap = data.body.reduce((acc, item) => {
            if (item.type === 'bs') {
              // item.text 값을 key로, item.value와 item.wincId를 객체로 저장
              acc[item.text] = {
                value: item.value,
                wincId: item.wincId
              };
            }
            return acc;
          }, {});

          setBusStops(stopsMap); // 상태에 저장
        } else {
          console.error('API 요청 실패');
        }
      } catch (error) {
        console.error('데이터 가져오기 실패:', error);
        setError('버스 정류장 정보를 가져오는데 실패했습니다.');
      }
    };

    fetchBusStops(); // 컴포넌트가 마운트될 때 API 호출
  }, []); // 빈 배열을 넣어 한 번만 호출

  // stopName과 일치하는 bsId와 wincId를 가져옴
  const stopDetails = busStops[stopName];
  const bsId = stopDetails ? stopDetails.value : null;
  const wincId = stopDetails ? stopDetails.wincId : null;

  // bsId로 도착 정보 가져오기
  useEffect(() => {
    if (!bsId) return; // bsId가 없으면 요청하지 않음

    const fetchArrivalInfo = async () => {
      try {
        const response = await fetch(`https://businfo.daegu.go.kr:8095/dbms_web_api/realtime/arr2/${bsId}`);
        const data = await response.json();

        if (data.body.list) {
          setArrivalInfo(data.body.list); // 도착 정보 저장
        } else {
          setError('도착 정보가 없습니다.');
        }
      } catch (err) {
        console.error('도착 정보 가져오기 실패:', err);
        setError('도착 정보를 가져오는데 실패했습니다.');
      }
    };

    fetchArrivalInfo(); // bsId가 있으면 도착 정보 요청
  }, [bsId]); // bsId가 변경되면 실행

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', margin: '20px' }}>
      <Helmet>
        <title>{stopName}</title> {/* 웹 페이지 제목을 stopName으로 설정 */}
      </Helmet>
      <h1 style={{ textAlign: 'center' }}>
        <a href={`https://businfo.daegu.go.kr:8095/dbms_web/map?mapMode=0&searchText=${stopName}&wincId=${wincId}`} target="_blank" rel="noopener noreferrer">
            {stopName}
        </a>
      </h1> {/* stopName을 제목에 표시 */}
      {error ? (
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', border: '1px solid #ccc' }}>
            <thead>
              <tr>
                <th style={{ padding: '6px', backgroundColor: '#f2f2f2', border: '1px solid #ccc' }}>버스 번호</th>
                <th style={{ padding: '6px', backgroundColor: '#f2f2f2', border: '1px solid #ccc' }}>도착 정보</th>
                <th style={{ padding: '6px', backgroundColor: '#f2f2f2', border: '1px solid #ccc' }}>남은 정류장</th>
              </tr>
            </thead>
            <tbody>
              {arrivalInfo.map((bus, index) => (
                <tr key={index}>
                  <td style={{ padding: '6px', border: '1px solid #ccc' }}>{bus.routeNo}</td>
                  <td style={{ padding: '6px', border: '1px solid #ccc' }}>{bus.arrivalTime || '정보 없음'}</td>
                  <td style={{ padding: '6px', border: '1px solid #ccc' }}>{bus.remainingStops || '정보 없음'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}