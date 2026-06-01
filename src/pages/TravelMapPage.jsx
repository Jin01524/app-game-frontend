import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import PixelCanvas from '../components/PixelCanvas';
import BottomNav from '../components/BottomNav';
import { toast } from '../utils/toast';
import styles from './TravelMapPage.module.css';

// Distance calculation helper (Haversine Formula)
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  const R = 6371e3; // meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};

// Bearing angle in radians
const getBearingAngle = (lat1, lon1, lat2, lon2) => {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  return Math.atan2(y, x);
};

// Friendly compass directions in Vietnamese
const getDirectionString = (lat1, lon1, lat2, lon2) => {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return '';
  if (lat1 === lat2 && lon1 === lon2) return 'Ở đây 📍';
  
  const angle = (getBearingAngle(lat1, lon1, lat2, lon2) * 180) / Math.PI;
  const bearing = (angle + 360) % 360;

  const directions = [
    { label: 'Bắc ⬆️', min: 337.5, max: 360 },
    { label: 'Bắc ⬆️', min: 0, max: 22.5 },
    { label: 'Đông Bắc ↗️', min: 22.5, max: 67.5 },
    { label: 'Đông ➡️', min: 67.5, max: 112.5 },
    { label: 'Đông Nam ↘️', min: 112.5, max: 157.5 },
    { label: 'Nam ⬇️', min: 157.5, max: 202.5 },
    { label: 'Tây Nam ↙️', min: 202.5, max: 247.5 },
    { label: 'Tây ⬅️', min: 247.5, max: 292.5 },
    { label: 'Tây Bắc ↖️', min: 292.5, max: 337.5 }
  ];

  const match = directions.find(d => {
    if (d.min > d.max) {
      return bearing >= d.min || bearing < d.max;
    }
    return bearing >= d.min && bearing < d.max;
  });

  return match ? match.label : 'Chỉ hướng...';
};

const MOCK_COORDS = [
  { lat: 16.0669, lng: 108.2201 }, // Dragon Bridge
  { lat: 16.0601, lng: 108.2234 }, // near Dragon Bridge
  { lat: 16.0504, lng: 108.2255 }, // near Marble Mountains road
  { lat: 16.0401, lng: 108.2312 }, // further south
  { lat: 16.0305, lng: 108.2389 }, // Ngũ Hành Sơn
  { lat: 16.0152, lng: 108.2524 }  // Danang outskirts / Pass entrance
];

export default function TravelMapPage() {
  const navigate = useNavigate();
  const { authFetch, user } = useAuth();

  // Loading and General state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Trip specific states
  const [activeTrip, setActiveTrip] = useState(null);
  const [members, setMembers] = useState([]);

  // Form inputs
  const [tripName, setTripName] = useState('');
  const [tripCode, setTripCode] = useState('');
  const [newCheckpointName, setNewCheckpointName] = useState('');

  // Real-time states
  const [isLeader, setIsLeader] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [statusAlert, setStatusAlert] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('active'); // active, gas, emergency, lost
  const [routeWaypoints, setRouteWaypoints] = useState([]);

  // Geolocation and simulator states
  const [gpsTracking, setGpsTracking] = useState(false);
  const [simulationIndex, setSimulationIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Socket references
  const socketRef = useRef(null);
  const locationWatcherRef = useRef(null);

  // Synthesize alarm sound using browser Web Audio API
  const playAlertSound = useCallback((status) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (status === 'emergency') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.3);
        osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.6);
        osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.9);
        osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + 1.2);

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);

        osc.start();
        osc.stop(ctx.currentTime + 1.5);
      } else if (status === 'gas') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.12);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);

        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (status === 'lost') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);

        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch (e) {
      console.warn('[Travel Synth] Failed to play audio alert:', e);
    }
  }, []);

  // Fetch active trip details from HTTP API
  const fetchActiveTrip = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/profile/travel/active');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.group) {
          const tripId = data.group.id;
          const groupRes = await authFetch(`/api/profile/travel/group/${tripId}`);
          if (groupRes.ok) {
            const groupData = await groupRes.json();
            if (groupData.success) {
              setActiveTrip(groupData.group);
              setMembers(groupData.members);
              setIsLeader(groupData.group.leader_username === user.username);

              const waypoints = JSON.parse(groupData.group.route_waypoints || '[]');
              setRouteWaypoints(waypoints);

              const me = groupData.members.find((m) => m.username === user.username);
              if (me) {
                setCurrentStatus(me.status);
              }
            }
          }
        } else {
          setActiveTrip(null);
        }
      } else {
        setError('Không thể tải thông tin nhóm phượt.');
      }
    } catch (e) {
      console.error(e);
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  }, [authFetch, user.username]);

  useEffect(() => {
    fetchActiveTrip();
  }, [fetchActiveTrip]);

  // WebSockets Real-time Communications
  useEffect(() => {
    if (!activeTrip) return;

    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '3001');
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // Join room
    socket.emit('join_trip_room', {
      groupId: activeTrip.id,
      username: user.username
    });

    // Listeners
    socket.on('location_updated', (data) => {
      setMembers((prev) => {
        const index = prev.findIndex((m) => m.username === data.username);
        let updated = [...prev];

        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            lat: data.lat,
            lng: data.lng,
            char_head_color: data.charColors ? data.charColors.head : updated[index].char_head_color,
            char_hair_color: data.charColors ? data.charColors.hair : updated[index].char_hair_color,
            char_body_color: data.charColors ? data.charColors.body : updated[index].char_body_color,
            char_legs_color: data.charColors ? data.charColors.legs : updated[index].char_legs_color,
            char_shoe_color: data.charColors ? data.charColors.shoe : updated[index].char_shoe_color,
            last_updated: new Date().toISOString()
          };
        } else {
          updated.push({
            username: data.username,
            display_name: data.displayName,
            lat: data.lat,
            lng: data.lng,
            status: 'active',
            char_head_color: data.charColors?.head || '#ffccaa',
            char_hair_color: data.charColors?.hair || '#8b4513',
            char_body_color: data.charColors?.body || '#3b82f6',
            char_legs_color: data.charColors?.legs || '#1e293b',
            char_shoe_color: data.charColors?.shoe || '#000000',
            last_updated: new Date().toISOString()
          });
        }

        return updated;
      });
    });

    socket.on('status_alert_received', (data) => {
      // Trigger Audio Alarm
      if (data.status !== 'active') {
        playAlertSound(data.status);

        // Trigger emergency overlay
        if (data.status === 'emergency') {
          setStatusAlert({
            username: data.username,
            displayName: data.displayName,
            status: data.status
          });
        }
      }

      setMembers((prev) => {
        const index = prev.findIndex((m) => m.username === data.username);
        if (index === -1) return prev;
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          status: data.status,
          last_updated: data.timestamp
        };
        return updated;
      });

      // Show warning toast
      const alertMsg =
        data.status === 'emergency'
          ? `🚨 CỨU HỘ SOS: ${data.displayName} cần trợ giúp khẩn cấp!`
          : data.status === 'gas'
          ? `⛽ ĐỔ XĂNG: ${data.displayName} dừng lại đổ xăng!`
          : data.status === 'lost'
          ? `🌀 LẠC ĐOÀN: ${data.displayName} lạc đoàn!`
          : `✅ AN TOÀN: ${data.displayName} đã tiếp tục hành trình.`;

      if (data.status === 'emergency') toast.error(alertMsg);
      else if (data.status === 'active') toast.success(alertMsg);
      else toast.warning(alertMsg);
    });

    socket.on('route_updated', (data) => {
      setRouteWaypoints(data.waypoints);
      toast.success('🗺️ Lộ trình chung đã được trưởng đoàn cập nhật!');
    });

    socket.on('member_joined_room', (data) => {
      toast.info(`BIKE 🏍️ ${data.username} đang định vị trực tuyến!`);
    });

    socket.on('member_left_room', (data) => {
      toast.warning(`🔌 ${data.username} đã mất kết nối định vị.`);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeTrip, playAlertSound, user.username]);

  // GPS Geolocation Tracking Core
  useEffect(() => {
    if (!activeTrip || isSimulating) return;

    if (!navigator.geolocation) {
      toast.error('Trình duyệt của bạn không hỗ trợ GPS Geolocation!');
      return;
    }

    let highAccuracy = true;

    const startGPSTracking = () => {
      setGpsTracking(true);

      const onSuccess = (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Emit location to socket
        if (socketRef.current) {
          socketRef.current.emit('update_location', {
            groupId: activeTrip.id,
            username: user.username,
            lat: latitude,
            lng: longitude
          });
        }
      };

      const onError = (err) => {
        console.error('[Travel GPS] Geolocation watcher error:', err);
        setGpsTracking(false);

        // Timeout fallback (Code 3): try low-accuracy Wi-Fi/IP location if GPS chips are missing
        if (err.code === 3 && highAccuracy) {
          console.log('[Travel GPS] High accuracy timed out. Falling back to low accuracy Wi-Fi/IP...');
          highAccuracy = false;

          if (locationWatcherRef.current !== null) {
            navigator.geolocation.clearWatch(locationWatcherRef.current);
          }

          locationWatcherRef.current = navigator.geolocation.watchPosition(
            onSuccess,
            (lowAccErr) => {
              console.error('[Travel GPS] Low accuracy also failed:', lowAccErr);
              toast.warning(
                "Không lấy được GPS tự động. Hãy bật 'MÔ PHỎNG GPS' ở bảng bên phải để test."
              );
            },
            { enableHighAccuracy: false, maximumAge: 10000, timeout: 12000 }
          );
          setGpsTracking(true);
          return;
        }

        // Permission denied (Code 1)
        if (err.code === 1) {
          toast.warning(
            "Quyền định vị bị chặn! Hãy bật 'MÔ PHỎNG GPS' ở bảng bên phải để chạy thử nghiệm."
          );
        } else {
          toast.error("Lỗi định vị! Hãy dùng 'MÔ PHỎNG GPS' để thử nghiệm.");
        }
      };

      locationWatcherRef.current = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 6000
      });
    };

    startGPSTracking();

    return () => {
      if (locationWatcherRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatcherRef.current);
        locationWatcherRef.current = null;
        setGpsTracking(false);
      }
    };
  }, [activeTrip, isSimulating, user.username]);

  // Trip Management Actions (API Calls)
  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!tripName.trim()) {
      toast.error('Nhập tên chuyến đi!');
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch('/api/profile/travel/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tripName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Tạo nhóm phượt "${tripName}" thành công!`);
        setActiveTrip(data.group);
        setIsLeader(true);
        setRouteWaypoints([]);
        setSimulationIndex(0);

        fetchActiveTrip();
      } else {
        toast.error(data.error || 'Lỗi khi tạo nhóm phượt.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi kết nối mạng.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTrip = async (e) => {
    e.preventDefault();
    if (!tripCode.trim()) {
      toast.error('Nhập mã nhóm!');
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch('/api/profile/travel/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: tripCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Đã gia nhập thành công nhóm phượt!`);
        setActiveTrip(data.group);
        setIsLeader(false);
        setSimulationIndex(0);

        fetchActiveTrip();
      } else {
        toast.error(data.error || 'Sai mã nhóm hoặc nhóm không tồn tại.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi kết nối mạng.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTrip = async () => {
    if (
      !window.confirm(
        'Bạn có chắc muốn rời nhóm phượt hiện tại? Vị trí định vị của bạn sẽ bị hủy.'
      )
    )
      return;

    setLoading(true);
    try {
      const res = await authFetch('/api/profile/travel/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: activeTrip.id })
      });
      if (res.ok) {
        toast.success('Đã rời nhóm phượt thành công!');

        setIsSimulating(false);
        setGpsTracking(false);

        setActiveTrip(null);
        setMembers([]);
        setIsLeader(false);
        setUserLocation(null);
        setCurrentStatus('active');
        setRouteWaypoints([]);
      } else {
        toast.error('Lỗi khi rời nhóm.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi kết nối mạng.');
    } finally {
      setLoading(false);
    }
  };

  // Change emergency panel states
  const handleStatusChange = async (newStatus) => {
    if (!activeTrip) return;

    playAlertSound(newStatus);
    setCurrentStatus(newStatus);

    if (socketRef.current) {
      socketRef.current.emit('send_status_alert', {
        groupId: activeTrip.id,
        username: user.username,
        status: newStatus
      });
    }

    setMembers((prev) => {
      const index = prev.findIndex((m) => m.username === user.username);
      if (index === -1) return prev;
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        status: newStatus,
        last_updated: new Date().toISOString()
      };
      return updated;
    });
  };

  // Checkpoints logic
  const handleAddCheckpoint = (e) => {
    e.preventDefault();
    if (!newCheckpointName.trim()) return;

    const newCp = {
      name: newCheckpointName.trim(),
      lat: userLocation ? userLocation.lat : null,
      lng: userLocation ? userLocation.lng : null
    };

    setRouteWaypoints((prev) => {
      const next = [...prev, newCp];
      if (socketRef.current) {
        socketRef.current.emit('update_route', {
          groupId: activeTrip.id,
          waypoints: next
        });
      }
      return next;
    });

    setNewCheckpointName('');
    toast.success(`📍 Đã thêm điểm chặng: "${newCp.name}"`);
  };

  const handleRemoveCheckpoint = (idx) => {
    if (!isLeader) return;

    setRouteWaypoints((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (socketRef.current) {
        socketRef.current.emit('update_route', {
          groupId: activeTrip.id,
          waypoints: next
        });
      }
      return next;
    });
    toast.info('🧹 Đã xóa điểm chặng.');
  };

  const handleClearRoute = () => {
    if (!isLeader || !window.confirm('Xác nhận xóa sạch toàn bộ lộ trình chặng dừng?')) return;

    setRouteWaypoints([]);

    if (socketRef.current) {
      socketRef.current.emit('update_route', {
        groupId: activeTrip.id,
        waypoints: []
      });
    }
    toast.info('🧹 Đã xóa toàn bộ lộ trình chặng dừng.');
  };

  // GPS Simulation Trigger
  const toggleGPSSimulator = () => {
    if (isSimulating) {
      setIsSimulating(false);
      setGpsTracking(false);
      toast.info('🔌 Đã ngắt mô phỏng GPS.');
    } else {
      setIsSimulating(true);
      setGpsTracking(true);
      toast.success('🎮 Đã kích hoạt mô phỏng định vị di chuyển phượt!');

      const first = MOCK_COORDS[0];
      setUserLocation(first);

      if (socketRef.current) {
        socketRef.current.emit('update_location', {
          groupId: activeTrip.id,
          username: user.username,
          lat: first.lat,
          lng: first.lng
        });
      }
      setSimulationIndex(1);
    }
  };

  // Move simulation forward
  const moveSimulatorForward = () => {
    if (!isSimulating) return;

    if (simulationIndex >= MOCK_COORDS.length) {
      toast.info('🏆 Bạn đã phượt hoàn thành chặng đèo mô phỏng!');
      setSimulationIndex(0);
      return;
    }

    const nextCoord = MOCK_COORDS[simulationIndex];
    setUserLocation(nextCoord);

    if (socketRef.current) {
      socketRef.current.emit('update_location', {
        groupId: activeTrip.id,
        username: user.username,
        lat: nextCoord.lat,
        lng: nextCoord.lng
      });
    }

    toast.info(`🛵 Di chuyển đến trạm ${simulationIndex + 1}/${MOCK_COORDS.length}`);
    setSimulationIndex((prev) => prev + 1);
  };

  // Normalize waypoint format helper
  const parseWaypoint = (wp, idx) => {
    if (Array.isArray(wp)) {
      return {
        name: `Trạm dừng chân ${idx + 1}`,
        lat: wp[0],
        lng: wp[1]
      };
    }
    return {
      name: wp.name || `Trạm dừng chân ${idx + 1}`,
      lat: wp.lat || null,
      lng: wp.lng || null
    };
  };

  return (
    <div className={styles.page}>
      <PixelCanvas />

      <main className={styles.main}>
        {/* Header */}
        <header className={`${styles.header} rpg-box fade-in`}>
          <div
            className="px-titlebar"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <span>◄ ĐỒNG ĐỘI ĐÂU RỒI? 🏍️ (HUD RADAR CHỈ ĐƯỜNG) ►</span>
            <button
              className="pixel-btn"
              onClick={() => navigate('/utilities')}
              style={{ padding: '3px 8px', fontSize: '0.65rem' }}
            >
              [ THOÁT ]
            </button>
          </div>
        </header>

        {loading && !activeTrip ? (
          <div
            className="rpg-box fade-in"
            style={{ padding: '32px', textAlign: 'center', backgroundColor: '#1e293b' }}
          >
            <div className={styles.blinkText}>[ 🌐 ĐANG ĐỒNG BỘ PHƯỢT THỜI GIAN THỰC... ]</div>
          </div>
        ) : error ? (
          <div
            className="rpg-box fade-in"
            style={{ padding: '24px', backgroundColor: '#7f1d1d', border: '3px solid #ef4444' }}
          >
            <div style={{ color: '#fca5a5', fontWeight: 'bold', marginBottom: '8px' }}>
              ⚠️ {error}
            </div>
            <button className="btn btn-outline" onClick={() => fetchActiveTrip()}>
              Thử lại
            </button>
          </div>
        ) : !activeTrip ? (
          /* Lobby Mode: Join or Create Group */
          <div className={`${styles.lobbyCard} rpg-box fade-in`}>
            <div className={styles.lobbySection}>
              <h2 className={styles.sectionTitle}>🗺️ Khởi Tạo Nhóm Phượt Mới</h2>
              <form onSubmit={handleCreateTrip} className={styles.inputGroup}>
                <label>Tên chuyến đi (ví dụ: Đà Nẵng - Đèo Hải Vân):</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className={styles.pixelInput}
                    placeholder="Nhập tên chuyến đi..."
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ backgroundColor: '#10b981', border: '3px solid #047857' }}
                  >
                    [ TẠO NHÓM ]
                  </button>
                </div>
              </form>
            </div>

            <div className={styles.lobbySection}>
              <h2 className={styles.sectionTitle}>🔑 Gia Nhập Nhóm Đang Phượt</h2>
              <form onSubmit={handleJoinTrip} className={styles.inputGroup}>
                <label>Nhập mã nhóm phượt (Mã 6 chữ số):</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className={styles.pixelInput}
                    placeholder="Mã CODE phượt..."
                    value={tripCode}
                    onChange={(e) => setTripCode(e.target.value)}
                    style={{ flex: 1, textTransform: 'uppercase' }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ backgroundColor: '#3b82f6', border: '3px solid #1d4ed8' }}
                  >
                    [ GIA NHẬP ]
                  </button>
                </div>
              </form>
            </div>

            {/* General Advice Bubble */}
            <div className={styles.npcAdvice}>
              <div className={styles.npcAvatar}>🛵</div>
              <div className={styles.speechBubble}>
                <span className={styles.npcName}>[ NPC BÁC XE ÔM ĐÀ THÀNH 👴 ]</span>
                <p className={styles.speechText}>
                  "Bản đồ bản đồ chi cho nặng máy các cháu ơi! Chỉ cần bật cái HUD Radar định vị
                  xe máy này lên là thấy rõ các bạn cách mình mấy mét, đi hướng nào, có ai bị lạc
                  đường hay dừng đổ xăng không. Vừa nhẹ vừa nhanh, lái xe an toàn nhé!"
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Active Trip Mode */
          <div className={styles.tripGrid}>
            {/* 1. Radar Panel */}
            <div className={`${styles.mapBox} rpg-box fade-in`}>
              <div className={styles.mapTitleBar}>
                <span>📡 RADAR ĐỊNH VỊ PHƯỢT KHÔNG CẦN BẢN ĐỒ (SIÊU NHẸ)</span>
                <span>{gpsTracking ? '🟢 LIVE GPS' : '🔵 CHỜ GPS...'}</span>
              </div>

              {/* HUD CSS RADAR SCREEN */}
              <div className={styles.radarScreen}>
                <div className={styles.radarSweeper} />

                {/* Radar grid markings */}
                <div className={styles.radarGridCircle} style={{ width: '60px', height: '60px' }} />
                <div
                  className={styles.radarGridCircle}
                  style={{ width: '120px', height: '120px' }}
                />
                <div
                  className={styles.radarGridCircle}
                  style={{ width: '180px', height: '180px' }}
                />
                <div
                  className={styles.radarGridCircle}
                  style={{ width: '240px', height: '240px' }}
                />

                {/* Vertical & Horizontal Crosshairs */}
                <div
                  style={{
                    position: 'absolute',
                    top: '0',
                    left: '50%',
                    width: '1px',
                    height: '100%',
                    background: 'rgba(16,185,129,0.15)',
                    pointerEvents: 'none'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '0',
                    width: '100%',
                    height: '1px',
                    background: 'rgba(16,185,129,0.15)',
                    pointerEvents: 'none'
                  }}
                />

                {/* User Center Blip */}
                <div className={styles.radarCenterBlip}>
                  <div
                    style={{
                      fontSize: '11px',
                      background: '#10b981',
                      color: '#fff',
                      padding: '2px 4px',
                      border: '1px solid #fff',
                      borderRadius: '3px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    BẠN 🏍️
                  </div>
                </div>

                {/* Render Blips for Teammates */}
                {members
                  .filter((m) => m.username !== user.username && m.lat !== null && m.lng !== null)
                  .map((m) => {
                    // Maximum radar range is 3.5 km
                    const MAX_RANGE = 3500;
                    if (!userLocation) return null;

                    const distance = getDistance(
                      userLocation.lat,
                      userLocation.lng,
                      m.lat,
                      m.lng
                    );
                    if (distance === null) return null;

                    // Compute bearing angle in radians
                    const bearing = getBearingAngle(
                      userLocation.lat,
                      userLocation.lng,
                      m.lat,
                      m.lng
                    );

                    // Clamp distance to MAX_RANGE and map to radar radius (120px)
                    const radius = Math.min((distance / MAX_RANGE) * 120, 120);

                    // Calculate X & Y offsets from radar center
                    const dx = radius * Math.sin(bearing);
                    const dy = -radius * Math.cos(bearing); // SVG/Screen Y inversion

                    return (
                      <div
                        key={m.username}
                        className={styles.radarBlip}
                        style={{
                          left: `calc(50% + ${dx}px)`,
                          top: `calc(50% + ${dy}px)`,
                          backgroundColor: m.char_head_color || '#ef4444',
                          borderColor:
                            m.status === 'emergency'
                              ? '#ef4444'
                              : m.status === 'gas'
                              ? '#f59e0b'
                              : m.status === 'lost'
                              ? '#a855f7'
                              : '#fff'
                        }}
                        title={`${m.display_name} (${Math.round(distance)}m)`}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: '-16px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0,0,0,0.8)',
                            color: '#fff',
                            fontSize: '6px',
                            padding: '1px 3px',
                            border: '1px solid #475569',
                            whiteSpace: 'nowrap',
                            zIndex: 10
                          }}
                        >
                          {m.display_name}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div
                style={{
                  fontSize: '0.65rem',
                  color: '#94a3b8',
                  textAlign: 'center',
                  marginBottom: '10px'
                }}
              >
                📡 Bán kính Radar tương ứng: <strong>3.5 Kilômét (3500m)</strong>. Tâm quét là vị
                trí của bạn.
              </div>

              {/* Route Waypoints Checkpoints list (No-Map Quest line style!) */}
              <div style={{ marginTop: '12px', borderTop: '2px dashed #334155', paddingTop: '12px' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#10b981', margin: '0 0 8px 0' }}>
                  📍 LỘ TRÌNH CHẶNG DỪNG PHƯỢT ({routeWaypoints.length})
                </h4>

                {routeWaypoints.length === 0 ? (
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontStyle: 'italic' }}>
                    Chưa có chặng dừng chân nào được đặt cho chuyến đi này.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {routeWaypoints.map((wp, idx) => {
                      const cp = parseWaypoint(wp, idx);
                      let distInfo = '';
                      if (userLocation && cp.lat !== null && cp.lng !== null) {
                        const meters = getDistance(
                          userLocation.lat,
                          userLocation.lng,
                          cp.lat,
                          cp.lng
                        );
                        distInfo =
                          meters > 1000
                            ? `Cách bạn: ${(meters / 1000).toFixed(1)} km`
                            : `Cách bạn: ${Math.round(meters)} m`;
                      }

                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#0f172a',
                            border: '2px solid #334155',
                            padding: '6px 10px',
                            fontSize: '0.7rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>🏁 {idx + 1}.</span>
                            <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{cp.name}</span>
                            {distInfo && (
                              <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>({distInfo})</span>
                            )}
                          </div>

                          {isLeader && (
                            <button
                              onClick={() => handleRemoveCheckpoint(idx)}
                              className="pixel-btn"
                              style={{
                                padding: '2px 6px',
                                fontSize: '0.55rem',
                                backgroundColor: '#7f1d1d'
                              }}
                            >
                              [ XÓA ]
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add checkpoint tool */}
                {isLeader && (
                  <form
                    onSubmit={handleAddCheckpoint}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '8px',
                      alignItems: 'center'
                    }}
                  >
                    <input
                      type="text"
                      className={styles.pixelInput}
                      placeholder="Thêm điểm mốc..."
                      value={newCheckpointName}
                      onChange={(e) => setNewCheckpointName(e.target.value)}
                      style={{ flex: 1, padding: '4px 8px', fontSize: '0.7rem' }}
                    />
                    <button
                      type="submit"
                      className="pixel-btn"
                      style={{
                        padding: '6px 10px',
                        fontSize: '0.65rem',
                        backgroundColor: '#10b981'
                      }}
                    >
                      [ + THÊM CHẶNG ]
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* 2. Control & Info Sidebar */}
            <div className={`${styles.sidebarCard} rpg-box fade-in`}>
              <div className={styles.groupMeta}>
                <div className={styles.metaRow}>
                  <span>Nhóm:</span>
                  <span className={styles.metaValue}>{activeTrip.name}</span>
                </div>
                <div className={styles.metaRow}>
                  <span>MÃ PHÒNG GIA NHẬP:</span>
                  <span className={`${styles.metaValue} ${styles.code}`}>{activeTrip.code}</span>
                </div>
                <div className={styles.metaRow}>
                  <span>Trưởng đoàn:</span>
                  <span className={styles.metaValue}>👑 {activeTrip.leader_username}</span>
                </div>
              </div>

              {/* Status SOS Panel */}
              <div>
                <h3 className={styles.controlTitle}>🚨 TRẠNG THÁI CỦA BẠN:</h3>
                <div className={styles.alertGrid}>
                  <button
                    className={`${styles.sosBtn} ${styles.btnEmergency} ${
                      currentStatus === 'emergency' ? 'active-alert' : ''
                    }`}
                    onClick={() => handleStatusChange('emergency')}
                  >
                    <span>🚨 KHẨN CẤP</span>
                    <span style={{ fontSize: '7px' }}>HỎNG XE / TAI NẠN</span>
                  </button>
                  <button
                    className={`${styles.sosBtn} ${styles.btnGas} ${
                      currentStatus === 'gas' ? 'active-alert' : ''
                    }`}
                    onClick={() => handleStatusChange('gas')}
                  >
                    <span>⛽ ĐỔ XĂNG</span>
                    <span style={{ fontSize: '7px' }}>DỪNG LẠI TÝ</span>
                  </button>
                  <button
                    className={`${styles.sosBtn} ${styles.btnLost} ${
                      currentStatus === 'lost' ? 'active-alert' : ''
                    }`}
                    onClick={() => handleStatusChange('lost')}
                  >
                    <span>🌀 LẠC ĐOÀN</span>
                    <span style={{ fontSize: '7px' }}>KHÔNG THẤY AI</span>
                  </button>
                  <button
                    className={`${styles.sosBtn} ${styles.btnActive} ${
                      currentStatus === 'active' ? 'active-alert' : ''
                    }`}
                    onClick={() => handleStatusChange('active')}
                  >
                    <span>✅ BÌNH THƯỜNG</span>
                    <span style={{ fontSize: '7px' }}>TIẾP TỤC ĐI</span>
                  </button>
                </div>
              </div>

              {/* Active Members HUD list showing exact distances */}
              <div>
                <h3 className={styles.controlTitle}>🏍️ THÀNH VIÊN ({members.length}):</h3>
                <div className={styles.membersBox}>
                  {members.map((member) => {
                    const isSelf = member.username === user.username;
                    let distanceText = '';
                    let directionText = '';

                    if (isSelf) {
                      distanceText = '[ BẠN ]';
                    } else if (
                      userLocation &&
                      member.lat !== null &&
                      member.lng !== null
                    ) {
                      const distMeters = getDistance(
                        userLocation.lat,
                        userLocation.lng,
                        member.lat,
                        member.lng
                      );
                      distanceText =
                        distMeters > 1000
                          ? `Cách: ${(distMeters / 1000).toFixed(1)} km`
                          : `Cách: ${Math.round(distMeters)} m`;

                      directionText = getDirectionString(
                        userLocation.lat,
                        userLocation.lng,
                        member.lat,
                        member.lng
                      );
                    } else {
                      distanceText = 'Mất định vị ⚠️';
                    }

                    return (
                      <div key={member.username} className={styles.memberItem}>
                        <div className={styles.memberLeft}>
                          <div
                            className={styles.colorIndicator}
                            style={{ backgroundColor: member.char_head_color || '#ffccaa' }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className={styles.memberName}>
                              {member.display_name}
                              {member.username === activeTrip.leader_username && (
                                <span className={styles.leaderTag}>[👑]</span>
                              )}
                            </span>
                            <span style={{ fontSize: '7px', color: '#94a3b8' }}>
                              {distanceText} {directionText && `| ${directionText}`}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`${styles.memberStatusBadge} ${
                            styles[`badge_${member.status}`]
                          }`}
                        >
                          {member.status === 'emergency'
                            ? 'SOS'
                            : member.status === 'gas'
                            ? 'XĂNG'
                            : member.status === 'lost'
                            ? 'LẠC'
                            : 'AN TOÀN'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simulator & Leader panel tools */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  style={{
                    padding: '8px',
                    border: '1px dashed #475569',
                    backgroundColor: '#0f172a'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}
                  >
                    <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>🎮 MÔ PHỎNG GPS:</span>
                    <button
                      onClick={toggleGPSSimulator}
                      className="pixel-btn"
                      style={{
                        padding: '2px 6px',
                        fontSize: '0.55rem',
                        backgroundColor: isSimulating ? '#ef4444' : '#10b981'
                      }}
                    >
                      {isSimulating ? 'TẮT SIM' : 'BẬT SIM'}
                    </button>
                  </div>
                  {isSimulating && (
                    <button
                      onClick={moveSimulatorForward}
                      className="pixel-btn"
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.6rem',
                        backgroundColor: '#3b82f6'
                      }}
                    >
                      [ 🏍️ DI CHUYỂN PHƯỢT TIẾP ]
                    </button>
                  )}
                </div>

                {isLeader && routeWaypoints.length > 0 && (
                  <button
                    onClick={handleClearRoute}
                    className="pixel-btn"
                    style={{
                      backgroundColor: '#78350f',
                      border: '2px solid #b45309',
                      padding: '4px 8px',
                      fontSize: '0.65rem'
                    }}
                  >
                    [ 🧹 XÓA LỘ TRÌNH CHUNG ]
                  </button>
                )}

                <button
                  onClick={handleLeaveTrip}
                  className="btn btn-outline"
                  style={{ width: '100%', borderColor: '#ef4444', color: '#fca5a5' }}
                >
                  [ RỜI NHÓM PHƯỢT ]
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* SOS Alert Modal dialog */}
      {statusAlert && (
        <div className={styles.sosAlertOverlay}>
          <div className={`${styles.sosModal} rpg-box`}>
            <div className={styles.sosTitle}>🚨 BÁO CÁO CỨU HỘ KHẨN CẤP!</div>
            <div className={styles.sosDesc}>
              Thành viên <strong>{statusAlert.displayName} ({statusAlert.username})</strong> vừa
              gửi tín hiệu SOS khẩn cấp! Cần dừng đoàn để cứu trợ gấp.
            </div>
            <button
              className="pixel-btn"
              onClick={() => setStatusAlert(null)}
              style={{
                padding: '6px 16px',
                backgroundColor: '#ef4444',
                border: '3px solid #991b1b',
                color: '#fff',
                fontWeight: 'bold'
              }}
            >
              [ ĐÃ NHẬN TIN ]
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
