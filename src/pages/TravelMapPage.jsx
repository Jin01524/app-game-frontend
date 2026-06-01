import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import PixelCanvas from '../components/PixelCanvas';
import BottomNav from '../components/BottomNav';
import { toast } from '../utils/toast';
import styles from './TravelMapPage.module.css';

const MOCK_COORDS = [
  { lat: 16.0669, lng: 108.2201 }, // Dragon Bridge
  { lat: 16.0601, lng: 108.2234 }, // near Dragon Bridge
  { lat: 16.0504, lng: 108.2255 }, // near Marble Mountains road
  { lat: 16.0401, lng: 108.2312 }, // further south
  { lat: 16.0305, lng: 108.2389 }, // Ngũ Hành Sơn
  { lat: 16.0152, lng: 108.2524 }  // Danang outskirts / Pass entrance
];

const googleDarkStyles = [
  { elementType: "geometry", stylers: [{ color: "#1f2937" }] }, // Gray-800
  { elementType: "labels.text.stroke", stylers: [{ color: "#111827" }] }, // Gray-900
  { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] }, // Gray-400
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#fbbf24" }] // Yellow-400
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca3af" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#111827" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4b5563" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#374151" }] // Gray-700
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#111827" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca3af" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#1f2937" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#111827" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#fbbf24" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1f2937" }]
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#fbbf24" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0f172a" }] // Slate-900 water
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4b5563" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#0f172a" }]
  }
];

let HTMLMapMarkerClass = null;

// Dynamically create a custom HTML Marker class for Google Maps after google.maps is loaded
function getHTMLMapMarkerClass() {
  if (HTMLMapMarkerClass) return HTMLMapMarkerClass;
  if (!window.google || !window.google.maps) return null;

  class HTMLMapMarker extends window.google.maps.OverlayView {
    constructor(latlng, html, map, username, displayName, status) {
      super();
      this.latlng = latlng;
      this.html = html;
      this.username = username;
      this.displayName = displayName;
      this.status = status;
      this.setMap(map);
    }
    onAdd() {
      this.div = document.createElement('div');
      this.div.style.position = 'absolute';
      this.div.style.zIndex = '100';
      this.div.innerHTML = this.html;
      
      // Simple tooltip on click
      this.div.addEventListener('click', () => {
        const statTxt = this.status === 'emergency' ? '🚨 CẦN CỨU HỘ KHẨN CẤP' :
                        this.status === 'gas' ? '⛽ ĐANG ĐỔ XĂNG' :
                        this.status === 'lost' ? '🌀 LẠC ĐOÀN' : '✅ AN TOÀN';
        toast.info(`${this.displayName || this.username}: Trạng thái ${statTxt}`);
      });

      const panes = this.getPanes();
      panes.overlayImage.appendChild(this.div);
    }
    draw() {
      if (!this.div) return;
      const projection = this.getProjection();
      if (!projection) return;
      const position = projection.fromLatLngToDivPixel(this.latlng);
      if (position) {
        // Adjust div anchor position (half of marker width/height)
        this.div.style.left = (position.x - 18) + 'px';
        this.div.style.top = (position.y - 18) + 'px';
      }
    }
    onRemove() {
      if (this.div) {
        this.div.parentNode.removeChild(this.div);
        this.div = null;
      }
    }
    setPosition(latlng) {
      this.latlng = latlng;
      this.draw();
    }
    setContent(html, status) {
      this.html = html;
      this.status = status;
      if (this.div) this.div.innerHTML = html;
    }
  }

  HTMLMapMarkerClass = HTMLMapMarker;
  return HTMLMapMarkerClass;
}

export default function TravelMapPage() {
  const navigate = useNavigate();
  const { authFetch, user } = useAuth();

  // Dual Map loading, Configurations and General state
  const [mapProvider, setMapProvider] = useState('leaflet'); // 'google' or 'leaflet'
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Trip specific states
  const [activeTrip, setActiveTrip] = useState(null);
  const [members, setMembers] = useState([]);
  
  // Form inputs
  const [tripName, setTripName] = useState('');
  const [tripCode, setTripCode] = useState('');
  
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

  // Socket & Map references
  const socketRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);
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

  // 1. Fetch Secure Config (Google Maps API Key) from Backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await authFetch('/api/profile/travel/config');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.googleMapsApiKey) {
            setGoogleApiKey(data.googleMapsApiKey);
            setMapProvider('google');
            console.log('[Travel Config] Found Google Maps API Key. Activating Google Map.');
          } else {
            setMapProvider('leaflet');
            console.log('[Travel Config] No API Key. Falling back to OpenStreetMap.');
          }
        }
      } catch (err) {
        console.error('Error fetching travel map config:', err);
        setMapProvider('leaflet');
      }
    };
    fetchConfig();
  }, [authFetch]);

  // 2. Dynamic Script Loader for Map Providers
  useEffect(() => {
    if (mapProvider === 'google' && googleApiKey) {
      if (window.google && window.google.maps) {
        setMapReady(true);
        return;
      }
      
      const jsScript = document.createElement('script');
      jsScript.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=geometry`;
      jsScript.id = 'google-maps-js';
      jsScript.onload = () => {
        setMapReady(true);
      };
      jsScript.onerror = () => {
        console.warn('Google Maps script failed to load. Falling back to Leaflet.');
        setMapProvider('leaflet');
      };
      document.body.appendChild(jsScript);
    } else if (mapProvider === 'leaflet') {
      if (window.L) {
        setMapReady(true);
        return;
      }

      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      cssLink.id = 'leaflet-css';
      document.head.appendChild(cssLink);

      const jsScript = document.createElement('script');
      jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      jsScript.id = 'leaflet-js';
      jsScript.onload = () => {
        setMapReady(true);
      };
      document.body.appendChild(jsScript);
    }
  }, [mapProvider, googleApiKey]);

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
              
              const me = groupData.members.find(m => m.username === user.username);
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

  // Unified Map Marker drawer supporting both Google Maps OverlayView & Leaflet L.divIcon
  const updateMapMarker = useCallback((member) => {
    if (!mapRef.current || member.lat === null || member.lng === null) return;
    
    const isSelf = member.username === user.username;
    
    const markerHtml = `
      <div class="${styles.customMarker} ${styles[member.status]}">
        <div class="${styles.pixelPin}">
          <div class="${styles.avatarDot}" style="background-color: ${member.char_head_color || '#ffccaa'}">
            ${isSelf ? '🏍️' : '👤'}
          </div>
        </div>
        <div class="${styles.markerLabel}" style="border-color: ${member.char_body_color || '#3b82f6'}">
          ${isSelf ? '[BẠN] ' : ''}${member.display_name || member.username}
        </div>
      </div>
    `;

    if (mapProvider === 'google' && window.google) {
      const HTMLMapMarker = getHTMLMapMarkerClass();
      if (!HTMLMapMarker) return;

      const latlng = new window.google.maps.LatLng(member.lat, member.lng);

      if (markersRef.current[member.username]) {
        markersRef.current[member.username].setPosition(latlng);
        markersRef.current[member.username].setContent(markerHtml, member.status);
      } else {
        markersRef.current[member.username] = new HTMLMapMarker(
          latlng,
          markerHtml,
          mapRef.current,
          member.username,
          member.display_name,
          member.status
        );
      }
    } else if (mapProvider === 'leaflet' && window.L) {
      const L = window.L;
      const icon = L.divIcon({
        html: markerHtml,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      if (markersRef.current[member.username]) {
        markersRef.current[member.username].setLatLng([member.lat, member.lng]);
        markersRef.current[member.username].setIcon(icon);
      } else {
        const marker = L.marker([member.lat, member.lng], { icon }).addTo(mapRef.current);
        
        marker.bindPopup(`
          <div style="font-family: 'Space Mono', monospace; font-size: 11px; color: #000;">
            <strong>${member.display_name}</strong><br/>
            Trạng thái: <span style="font-weight:bold; color:${
              member.status === 'emergency' ? 'red' : 
              member.status === 'gas' ? 'orange' : 
              member.status === 'lost' ? 'purple' : 'green'
            }">${
              member.status === 'emergency' ? '🚨 SOS KHẨN CẤP' : 
              member.status === 'gas' ? '⛽ ĐANG ĐỔ XĂNG' : 
              member.status === 'lost' ? '🌀 LẠC ĐOÀN' : '✅ AN TOÀN'
            }</span><br/>
            Cập nhật: ${new Date(member.last_updated || Date.now()).toLocaleTimeString()}
          </div>
        `);
        markersRef.current[member.username] = marker;
      }
    }
  }, [user.username, mapProvider]);

  // Unified Route drawing tool supporting Google maps Polyline & Leaflet Polyline
  const updateMapRoute = useCallback((waypoints) => {
    if (!mapRef.current) return;

    if (mapProvider === 'google' && window.google) {
      const googlePaths = waypoints.map(w => ({ lat: w[0], lng: w[1] }));
      
      if (polylineRef.current) {
        polylineRef.current.setPath(googlePaths);
      } else {
        polylineRef.current = new window.google.maps.Polyline({
          path: googlePaths,
          geodesic: true,
          strokeColor: '#10b981',
          strokeOpacity: 0.9,
          strokeWeight: 5,
          map: mapRef.current
        });
      }
    } else if (mapProvider === 'leaflet' && window.L) {
      const L = window.L;
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(waypoints);
      } else {
        polylineRef.current = L.polyline(waypoints, {
          color: '#10b981',
          weight: 5,
          dashArray: '5, 8',
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(mapRef.current);
      }
    }
  }, [mapProvider]);

  // 3. Initialize Map (Google Maps or Leaflet Fallback)
  useEffect(() => {
    if (!mapReady || !activeTrip || mapRef.current) return;

    const mapId = 'travel-map-canvas';
    const defaultCenter = [16.0544, 108.2022]; // Da Nang coordinates

    if (mapProvider === 'google' && window.google) {
      const googleMap = new window.google.maps.Map(document.getElementById(mapId), {
        center: { lat: defaultCenter[0], lng: defaultCenter[1] },
        zoom: 13,
        styles: googleDarkStyles,
        disableDoubleClickZoom: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      mapRef.current = googleMap;

      // Draw route
      const existingWaypoints = JSON.parse(activeTrip.route_waypoints || '[]');
      if (existingWaypoints.length > 0) {
        updateMapRoute(existingWaypoints);
      }

      // Double click to draw route (Leader only)
      googleMap.addListener('dblclick', (e) => {
        if (activeTrip.leader_username === user.username) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          setRouteWaypoints((prev) => {
            const next = [...prev, [lat, lng]];
            updateMapRoute(next);
            if (socketRef.current) {
              socketRef.current.emit('update_route', {
                groupId: activeTrip.id,
                waypoints: next
              });
            }
            return next;
          });
        }
      });

    } else if (mapProvider === 'leaflet' && window.L) {
      const L = window.L;
      const map = L.map(mapId, {
        doubleClickZoom: false
      }).setView(defaultCenter, 13);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      mapRef.current = map;

      const existingWaypoints = JSON.parse(activeTrip.route_waypoints || '[]');
      if (existingWaypoints.length > 0) {
        updateMapRoute(existingWaypoints);
      }

      map.on('dblclick', (e) => {
        if (activeTrip.leader_username === user.username) {
          const { lat, lng } = e.latlng;
          setRouteWaypoints((prev) => {
            const next = [...prev, [lat, lng]];
            updateMapRoute(next);
            if (socketRef.current) {
              socketRef.current.emit('update_route', {
                groupId: activeTrip.id,
                waypoints: next
              });
            }
            return next;
          });
        }
      });
    }

    return () => {
      // Clear markers and shapes on destroy
      if (mapProvider === 'google' && mapRef.current) {
        mapRef.current = null;
        markersRef.current = {};
        polylineRef.current = null;
      } else if (mapProvider === 'leaflet' && mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = {};
        polylineRef.current = null;
      }
    };
  }, [mapReady, activeTrip, mapProvider, updateMapRoute, user.username]);

  // 4. WebSockets Real-time Communications
  useEffect(() => {
    if (!activeTrip) return;

    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '3001');
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });
    
    socketRef.current = socket;

    socket.emit('join_trip_room', {
      groupId: activeTrip.id,
      username: user.username
    });

    socket.on('location_updated', (data) => {
      setMembers((prev) => {
        const index = prev.findIndex(m => m.username === data.username);
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
        
        const targetMember = updated.find(m => m.username === data.username);
        if (targetMember) updateMapMarker(targetMember);
        
        return updated;
      });
    });

    socket.on('status_alert_received', (data) => {
      if (data.status !== 'active') {
        playAlertSound(data.status);
        
        if (data.status === 'emergency') {
          setStatusAlert({
            username: data.username,
            displayName: data.displayName,
            status: data.status
          });
        }
      }

      setMembers((prev) => {
        const index = prev.findIndex(m => m.username === data.username);
        if (index === -1) return prev;
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          status: data.status,
          last_updated: data.timestamp
        };
        
        updateMapMarker(updated[index]);
        return updated;
      });

      const alertMsg = data.status === 'emergency' ? `🚨 CỨU HỘ SOS: ${data.displayName} cần trợ giúp khẩn cấp!`
                    : data.status === 'gas' ? `⛽ ĐỔ XĂNG: ${data.displayName} dừng lại đổ xăng!`
                    : data.status === 'lost' ? `🌀 LẠC ĐOÀN: ${data.displayName} lạc đoàn!`
                    : `✅ AN TOÀN: ${data.displayName} đã tiếp tục hành trình.`;
      
      if (data.status === 'emergency') toast.error(alertMsg);
      else if (data.status === 'active') toast.success(alertMsg);
      else toast.warning(alertMsg);
    });

    socket.on('route_updated', (data) => {
      setRouteWaypoints(data.waypoints);
      updateMapRoute(data.waypoints);
      toast.success("🗺️ Lộ trình chung đã được trưởng đoàn cập nhật!");
    });

    socket.on('member_joined_room', (data) => {
      toast.info(`🏍️ ${data.username} đang định vị trực tuyến!`);
    });

    socket.on('member_left_room', (data) => {
      toast.warning(`🔌 ${data.username} đã mất kết nối định vị.`);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeTrip, updateMapMarker, updateMapRoute, playAlertSound, user.username]);

  // 5. GPS Geolocation Tracking Core with fallbacks
  useEffect(() => {
    if (!activeTrip || !mapReady || isSimulating) return;

    if (!navigator.geolocation) {
      toast.error("Trình duyệt của bạn không hỗ trợ GPS Geolocation!");
      return;
    }

    let highAccuracy = true;

    const startGPSTracking = () => {
      setGpsTracking(true);

      const onSuccess = (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Center map on user's first location fetch
        if (mapRef.current && !userLocation) {
          if (mapProvider === 'google') {
            mapRef.current.setCenter({ lat: latitude, lng: longitude });
            mapRef.current.setZoom(15);
          } else {
            mapRef.current.setView([latitude, longitude], 15);
          }
        }

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
              toast.warning("Không lấy được GPS tự động. Hãy bật 'MÔ PHỎNG GPS' ở bảng điều khiển bên phải để test.");
            },
            { enableHighAccuracy: false, maximumAge: 10000, timeout: 12000 }
          );
          setGpsTracking(true);
          return;
        }

        // Permission denied (Code 1)
        if (err.code === 1) {
          toast.warning("Quyền định vị bị chặn! Bạn hãy bật 'MÔ PHỎNG GPS' ở bảng bên phải để chạy thử nghiệm.");
        } else {
          toast.error("Lỗi định vị! Hãy dùng 'MÔ PHỎNG GPS' nếu test trên máy tính laptop/PC.");
        }
      };

      locationWatcherRef.current = navigator.geolocation.watchPosition(
        onSuccess,
        onError,
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 6000 }
      );
    };

    startGPSTracking();

    return () => {
      if (locationWatcherRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatcherRef.current);
        locationWatcherRef.current = null;
        setGpsTracking(false);
      }
    };
  }, [activeTrip, mapReady, isSimulating, user.username, userLocation, mapProvider]);

  // Initial plot of all members once coordinates load
  useEffect(() => {
    if (!mapRef.current || members.length === 0) return;
    members.forEach(member => {
      if (member.lat !== null && member.lng !== null) {
        updateMapMarker(member);
      }
    });
  }, [members, updateMapMarker]);

  // 6. Trip Management Actions (API Calls)
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
    if (!window.confirm('Bạn có chắc muốn rời nhóm phượt hiện tại? Vị trí định vị của bạn sẽ bị hủy.')) return;

    setLoading(true);
    try {
      const res = await authFetch('/api/profile/travel/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: activeTrip.id })
      });
      if (res.ok) {
        toast.success('Đã rời nhóm phượt thành công!');
        
        if (mapRef.current) {
          markersRef.current = {};
        }
        
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
      const index = prev.findIndex(m => m.username === user.username);
      if (index === -1) return prev;
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        status: newStatus,
        last_updated: new Date().toISOString()
      };
      
      updateMapMarker(updated[index]);
      return updated;
    });
  };

  // Double-click route drawing leader tool resets
  const handleClearRoute = () => {
    if (!isLeader || !window.confirm('Xác nhận xóa sạch lộ trình vẽ trên bản đồ?')) return;
    
    setRouteWaypoints([]);
    if (polylineRef.current) {
      if (mapProvider === 'google') {
        polylineRef.current.setPath([]);
      } else {
        polylineRef.current.setLatLngs([]);
      }
    }
    
    if (socketRef.current) {
      socketRef.current.emit('update_route', {
        groupId: activeTrip.id,
        waypoints: []
      });
    }
    toast.info("🧹 Đã xóa toàn bộ lộ trình chung.");
  };

  // GPS Simulation Trigger (For desktops/environments without true high-accuracy GPS)
  const toggleGPSSimulator = () => {
    if (isSimulating) {
      setIsSimulating(false);
      setGpsTracking(false);
      toast.info("🔌 Đã ngắt mô phỏng GPS.");
    } else {
      setIsSimulating(true);
      setGpsTracking(true);
      toast.success("🎮 Đã kích hoạt mô phỏng định vị di chuyển phượt!");
      
      const first = MOCK_COORDS[0];
      setUserLocation(first);
      
      if (mapRef.current) {
        if (mapProvider === 'google') {
          mapRef.current.setCenter({ lat: first.lat, lng: first.lng });
          mapRef.current.setZoom(15);
        } else {
          mapRef.current.setView([first.lat, first.lng], 15);
        }
      }
      
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
      toast.info("🏆 Bạn đã phượt hoàn thành chặng đèo mô phỏng!");
      setSimulationIndex(0);
      return;
    }

    const nextCoord = MOCK_COORDS[simulationIndex];
    setUserLocation(nextCoord);
    
    if (mapRef.current) {
      if (mapProvider === 'google') {
        mapRef.current.panTo({ lat: nextCoord.lat, lng: nextCoord.lng });
      } else {
        mapRef.current.panTo([nextCoord.lat, nextCoord.lng]);
      }
    }

    if (socketRef.current) {
      socketRef.current.emit('update_location', {
        groupId: activeTrip.id,
        username: user.username,
        lat: nextCoord.lat,
        lng: nextCoord.lng
      });
    }
    
    toast.info(`🛵 Di chuyển đến trạm ${simulationIndex + 1}/${MOCK_COORDS.length}`);
    setSimulationIndex(prev => prev + 1);
  };

  return (
    <div className={styles.page}>
      <PixelCanvas />

      <main className={styles.main}>
        {/* Header */}
        <header className={`${styles.header} rpg-box fade-in`}>
          <div className="px-titlebar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span>◄ ĐỒNG ĐỘI ĐÂU RỒI? 🏍️ ►</span>
            <button className="pixel-btn" onClick={() => navigate('/utilities')} style={{ padding: '3px 8px', fontSize: '0.65rem' }}>
              [ THOÁT ]
            </button>
          </div>
        </header>

        {loading && !activeTrip ? (
          <div className="rpg-box fade-in" style={{ padding: '32px', textAlign: 'center', backgroundColor: '#1e293b' }}>
            <div className={styles.blinkText}>[ 🌐 ĐANG ĐỒNG BỘ PHƯỢT THỜI GIAN THỰC... ]</div>
          </div>
        ) : error ? (
          <div className="rpg-box fade-in" style={{ padding: '24px', backgroundColor: '#7f1d1d', border: '3px solid #ef4444' }}>
            <div style={{ color: '#fca5a5', fontWeight: 'bold', marginBottom: '8px' }}>⚠️ {error}</div>
            <button className="btn btn-outline" onClick={() => fetchActiveTrip()}>Thử lại</button>
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
                    onChange={e => setTripName(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#10b981', border: '3px solid #047857' }}>
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
                    onChange={e => setTripCode(e.target.value)}
                    style={{ flex: 1, textTransform: 'uppercase' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#3b82f6', border: '3px solid #1d4ed8' }}>
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
                  "Hỡi các bạn trẻ thích chinh phục cung đường! Chuyến đi chơi xa chỉ thực sự trọn vẹn khi tất cả cùng trở về an toàn. Sử dụng bảng liên lạc định vị này để không ai bị bỏ lại phía sau nhé!"
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Active Trip Mode */
          <div className={styles.tripGrid}>
            
            {/* 1. Map Panel */}
            <div className={`${styles.mapBox} rpg-box fade-in`}>
              <div className={styles.mapTitleBar}>
                <span>📍 BẢN ĐỒ ĐỊNH VỊ NHÓM PHƯỢT LIVE ({mapProvider === 'google' ? 'GOOGLE MAPS 🌐' : 'OPENSTREETMAP 🗺️'})</span>
                <span>{gpsTracking ? '🟢 ĐANG BÁO VỊ TRÍ...' : '🔵 CHỜ TÍN HIỆU...'}</span>
              </div>
              
              {/* Map Mount Target */}
              <div id="travel-map-canvas" className={styles.leafletContainer}></div>

              {/* Informative OSM fallback alert box */}
              {mapProvider === 'leaflet' && (
                <div style={{
                  padding: '8px',
                  backgroundColor: '#7c2d12',
                  border: '2px solid #ea580c',
                  fontSize: '0.65rem',
                  color: '#ffedd5',
                  marginTop: '8px',
                  lineHeight: '1.4'
                }}>
                  ⚠️ Bản đồ đang chạy ở chế độ dự phòng **OpenStreetMap** vì chưa có khóa `GOOGLE_MAPS_API_KEY` ở backend. Hãy thêm Key để mở khóa bản đồ Google Maps đầy đủ nhà nghỉ, hàng quán, cây xăng!
                </div>
              )}

              {isLeader && (
                <div style={{ fontSize: '0.6rem', color: '#cbd5e1', marginTop: '8px', textAlign: 'center' }}>
                  💡 Trưởng đoàn: <strong>Click đúp (Double-click)</strong> trên bản đồ để nối thêm các điểm lộ trình chung!
                </div>
              )}
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
                    className={`${styles.sosBtn} ${styles.btnEmergency} ${currentStatus === 'emergency' ? 'active-alert' : ''}`}
                    onClick={() => handleStatusChange('emergency')}
                  >
                    <span>🚨 KHẨN CẤP</span>
                    <span style={{ fontSize: '7px' }}>HỎNG XE / TAI NẠN</span>
                  </button>
                  <button 
                    className={`${styles.sosBtn} ${styles.btnGas} ${currentStatus === 'gas' ? 'active-alert' : ''}`}
                    onClick={() => handleStatusChange('gas')}
                  >
                    <span>⛽ ĐỔ XĂNG</span>
                    <span style={{ fontSize: '7px' }}>DỪNG LẠI TÝ</span>
                  </button>
                  <button 
                    className={`${styles.sosBtn} ${styles.btnLost} ${currentStatus === 'lost' ? 'active-alert' : ''}`}
                    onClick={() => handleStatusChange('lost')}
                  >
                    <span>🌀 LẠC ĐOÀN</span>
                    <span style={{ fontSize: '7px' }}>KHÔNG THẤY AI</span>
                  </button>
                  <button 
                    className={`${styles.sosBtn} ${styles.btnActive} ${currentStatus === 'active' ? 'active-alert' : ''}`}
                    onClick={() => handleStatusChange('active')}
                  >
                    <span>✅ BÌNH THƯỜNG</span>
                    <span style={{ fontSize: '7px' }}>TIẾP TỤC ĐI</span>
                  </button>
                </div>
              </div>

              {/* Active Members Checklist */}
              <div>
                <h3 className={styles.controlTitle}>🏍️ THÀNH VIÊN ({members.length}):</h3>
                <div className={styles.membersBox}>
                  {members.map(member => (
                    <div key={member.username} className={styles.memberItem}>
                      <div className={styles.memberLeft}>
                        <div className={styles.colorIndicator} style={{ backgroundColor: member.char_head_color || '#ffccaa' }} />
                        <span className={styles.memberName}>
                          {member.display_name}
                          {member.username === activeTrip.leader_username && <span className={styles.leaderTag}>[👑]</span>}
                        </span>
                      </div>
                      <span className={`${styles.memberStatusBadge} ${styles[`badge_${member.status}`]}`}>
                        {member.status === 'emergency' ? 'SOS' :
                         member.status === 'gas' ? 'XĂNG' :
                         member.status === 'lost' ? 'LẠC' : 'AN TOÀN'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulator & Leader panel tools */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '8px', border: '1px dashed #475569', backgroundColor: '#0f172a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>🎮 MÔ PHỎNG GPS:</span>
                    <button onClick={toggleGPSSimulator} className="pixel-btn" style={{ padding: '2px 6px', fontSize: '0.55rem', backgroundColor: isSimulating ? '#ef4444' : '#10b981' }}>
                      {isSimulating ? 'TẮT SIM' : 'BẬT SIM'}
                    </button>
                  </div>
                  {isSimulating && (
                    <button onClick={moveSimulatorForward} className="pixel-btn" style={{ width: '100%', padding: '4px', fontSize: '0.6rem', backgroundColor: '#3b82f6' }}>
                      [ 🏍️ DI CHUYỂN PHƯỢT TIẾP ]
                    </button>
                  )}
                </div>

                {isLeader && routeWaypoints.length > 0 && (
                  <button onClick={handleClearRoute} className="pixel-btn" style={{ backgroundColor: '#78350f', border: '2px solid #b45309', padding: '4px 8px', fontSize: '0.65rem' }}>
                    [ 🧹 XÓA LỘ TRÌNH CHUNG ]
                  </button>
                )}

                <button onClick={handleLeaveTrip} className="btn btn-outline" style={{ width: '100%', borderColor: '#ef4444', color: '#fca5a5' }}>
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
              Thành viên <strong>{statusAlert.displayName} ({statusAlert.username})</strong> vừa gửi tín hiệu SOS khẩn cấp! Cần dừng đoàn để cứu trợ gấp.
            </div>
            <button className="pixel-btn" onClick={() => setStatusAlert(null)} style={{ padding: '6px 16px', backgroundColor: '#ef4444', border: '3px solid #991b1b', color: '#fff', fontWeight: 'bold' }}>
              [ ĐÃ NHẬN TIN ]
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
