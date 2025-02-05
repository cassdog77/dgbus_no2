import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function BusStopApp() {
  const [busStops, setBusStops] = useState([]);
  const [arrivalInfo, setArrivalInfo] = useState({});
  const [error, setError] = useState(null);

  const xPos = 128.640765;
  const yPos = 35.8681438;

  useEffect(() => {
    const fetchBusStops = async () => {
      try {
        const response = await fetch(
          `https://businfo.daegu.go.kr:8095/dbms_web_api/bs/nearby?xPos=${xPos}&yPos=${yPos}&radius=500`
        );
        const data = await response.json();

        const savedOrder = localStorage.getItem('busStopOrder');
        if (savedOrder) {
          const orderedStops = JSON.parse(savedOrder).map((bsId) =>
            data.body.find((stop) => stop.bsId === bsId)
          );
          setBusStops(orderedStops.filter(Boolean)); // 저장된 순서에 따라 정류장 배열 설정
        } else {
          setBusStops(data.body); // 기본 순서로 설정
        }
      } catch (err) {
        setError('버스 정류장 정보를 가져오는 중 오류가 발생했습니다.');
      }
    };

    fetchBusStops();
  }, []);

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

  const saveOrder = (newBusStops) => {
    const busStopOrder = newBusStops.map((stop) => stop.bsId);
    localStorage.setItem('busStopOrder', JSON.stringify(busStopOrder));
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return; // 드래그가 취소된 경우

    const reorderedBusStops = Array.from(busStops);
    const [removed] = reorderedBusStops.splice(source.index, 1);
    reorderedBusStops.splice(destination.index, 0, removed);

    setBusStops(reorderedBusStops);
    saveOrder(reorderedBusStops);
  };

  if (!busStops.length) return <div>버스 정류장을 불러오는 중...</div>;

  return (
    <div style={{ textAlign: 'center', padding: '16px' }}>
      <h1>주변 버스 정류장</h1>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="busStopsList">
            {(provided) => (
              <table
                style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <thead>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '8px' }}>정류장 이름</th>
                    <th style={{ padding: '8px' }}>거리</th>
                    <th style={{ padding: '8px' }}>버스 도착 정보</th>
                  </tr>
                </thead>
                <tbody>
                  {busStops.map((stop, index) => (
                    <Draggable key={stop.bsId} draggableId={stop.bsId} index={index}>
                      {(provided) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            borderBottom: '1px solid #ddd',
                            ...provided.draggableProps.style,
                          }}
                        >
                          <td style={{ padding: '8px' }}>{stop.bsNm}</td>
                          <td style={{ padding: '8px' }}>{Math.floor(stop.dist)}m</td>
                          <td style={{ padding: '8px' }}>
                            {arrivalInfo[stop.bsId] ? (
                              <ul style={{ listStyleType: 'none', padding: 0 }}>
                                {arrivalInfo[stop.bsId].map((bus, index) => (
                                  <li key={index}>
                                    <strong>{bus.routeNo}번 버스</strong>:
                                    {bus.arrList.length > 0 ? (
                                      bus.arrList.map((arr, idx) => (
                                        <span key={idx}>
                                          {arr.arrState} ({arr.bsGap} 정류소 전, {arr.bsNm})
                                          {idx < bus.arrList.length - 1 && ', '}
                                        </span>
                                      ))
                                    ) : (
                                      <span> 도착 정보가 없습니다.</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>도착 정보를 불러오는 중...</p>
                            )}
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                </tbody>
              </table>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}