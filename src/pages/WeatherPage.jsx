import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelCanvas from '../components/PixelCanvas';
import BottomNav from '../components/BottomNav';
import styles from './WeatherPage.module.css';

// WMO standard weather code helper
const getWeatherInfo = (code) => {
  switch (code) {
    case 0:
      return { label: 'Trời quang đãng', emoji: '☀️', theme: 'sunny' };
    case 1:
      return { label: 'Ít mây, nắng nhẹ', emoji: '🌤️', theme: 'sunny' };
    case 2:
      return { label: 'Nhiều mây rải rác', emoji: '⛅', theme: 'cloudy' };
    case 3:
      return { label: 'Trời u ám', emoji: '☁️', theme: 'cloudy' };
    case 45:
    case 48:
      return { label: 'Có sương mù', emoji: '🌫️', theme: 'cloudy' };
    case 51:
    case 53:
    case 55:
      return { label: 'Mưa phùn nhẹ/vừa', emoji: '🌧️', theme: 'rainy' };
    case 56:
    case 57:
      return { label: 'Mưa phùn buốt giá', emoji: '🌧️', theme: 'rainy' };
    case 61:
    case 63:
    case 65:
      return { label: 'Mưa rào nhẹ/vừa', emoji: '🌧️', theme: 'rainy' };
    case 66:
    case 67:
      return { label: 'Mưa lạnh đông đá', emoji: '🌧️', theme: 'rainy' };
    case 71:
    case 73:
    case 75:
      return { label: 'Tuyết rơi nhẹ/mạnh', emoji: '❄️', theme: 'snowy' };
    case 77:
      return { label: 'Hạt tuyết rơi', emoji: '❄️', theme: 'snowy' };
    case 80:
    case 81:
    case 82:
      return { label: 'Mưa rào nặng hạt', emoji: '🌧️', theme: 'rainy' };
    case 85:
    case 86:
      return { label: 'Mưa tuyết', emoji: '❄️', theme: 'snowy' };
    case 95:
      return { label: 'Giông bão kèm sấm sét', emoji: '🌩️', theme: 'rainy' };
    case 96:
    case 99:
      return { label: 'Giông kèm mưa đá', emoji: '🌩️', theme: 'rainy' };
    default:
      return { label: 'Thời tiết ôn hòa', emoji: '🌤️', theme: 'sunny' };
  }
};

// Farming suggestions based on temperature, WMO code and UV index
const getFarmingAdvice = (temp, code, uv) => {
  if (code >= 95) {
    return "🌩️ GIÔNG BÃO LỚN! Hãy lập tức che chắn chuồng bò bằng rơm khô, gia cố hàng rào ruộng lúa và KHÔNG ra ngoài đồng lúc này kẻo sét đánh!";
  }
  if (code >= 51) {
    return "🌧️ TRỜI ĐANG MƯA! Đất đang rất ẩm ướt, bò lười ra ngoài nên hãy cho ăn rơm trong chuồng. Thời tiết rất tốt để trồng lúa mới, không cần tưới nước!";
  }
  if (temp >= 33 || uv >= 8) {
    return "🔥 NẮNG NÓNG CỰC ĐỘ! Nhiệt độ cao và chỉ số UV rất nguy hiểm. Đừng quên ghé ruộng tưới nước nhiều lần kẻo ruộng lúa khô héo và bò bị say nắng!";
  }
  if (temp <= 18) {
    return "❄️ TRỜI TRỞ LẠNH! Bò cần được ủ ấm bằng chăn vải hoặc rơm dày. Lúa sinh trưởng chậm hơn, hãy kiên nhẫn chăm sóc nhé!";
  }
  if (code === 0 || code === 1) {
    return "☀️ THỜI TIẾT ĐẸP TRỜI! Nắng rực rỡ, gió mát rượi. Mau mang liềm ra đồng gieo hạt gặt lúa và dắt bò đi dạo xung quanh kiếm thêm sữa thôi!";
  }
  return "🌤️ THỜI TIẾT ÔN HÒA! Khí hậu lý tưởng để làm mọi việc. Hãy ghé thăm sảnh trò chơi giao lưu hoặc đi chợ bán nông sản kiếm thêm xu vàng!";
};

const getDayName = (dateStr) => {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return 'Hôm nay';
  }
  return days[d.getDay()];
};

export default function WeatherPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState('Đang quét vị trí...');
  const [weatherData, setWeatherData] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [isSearchingCities, setIsSearchingCities] = useState(false);

  // Auto detect GPS on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    setLoading(true);
    setError(null);
    setShowSearch(false);
    setLocationName('Đang định vị GPS...');

    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ Geolocation.');
      setLoading(false);
      setShowSearch(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetchWeatherAndLocality(latitude, longitude);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setError('Không thể tự động truy cập GPS (Vui lòng cấp quyền định vị hoặc nhập thủ công).');
        setLoading(false);
        setShowSearch(true);
      },
      { timeout: 10000 }
    );
  };

  const fetchWeatherAndLocality = async (lat, lon, customName = null) => {
    setLoading(true);
    try {
      // 1. Get Reverse Geocoding Name from BigDataCloud if no customName is provided
      let name = customName;
      if (!name) {
        try {
          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=vi`
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const city = geoData.city || geoData.principalSubdivision || '';
            const locality = geoData.locality || '';
            name = locality && city && locality !== city ? `${locality}, ${city}` : city || geoData.countryName || 'Vị trí hiện tại';
          }
        } catch (geoErr) {
          console.error('Reverse geocode failed, using coordinates name:', geoErr);
          name = `Tọa độ: ${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        }
      }
      setLocationName(name);

      // 2. Fetch Weather Data from Open-Meteo
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,uv_index_max,precipitation_sum&timezone=auto`
      );

      if (!weatherRes.ok) {
        throw new Error('Không thể tải dữ liệu từ máy chủ thời tiết.');
      }

      const weatherData = await weatherRes.json();
      setWeatherData(weatherData);
      setLoading(false);
      setShowSearch(false);
    } catch (err) {
      console.error('Weather load error:', err);
      setError(err.message || 'Lỗi tải dữ liệu thời tiết.');
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingCities(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=vi&format=json`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
      } else {
        setSearchError('Không tìm thấy thành phố này. Hãy kiểm tra lại chính tả nhé!');
      }
    } catch (e) {
      setSearchError('Không thể kết nối tới dịch vụ tìm kiếm địa danh.');
    } finally {
      setIsSearchingCities(false);
    }
  };

  const handleSelectCity = (city) => {
    const cityName = `${city.name}${city.admin1 ? `, ${city.admin1}` : ''}, ${city.country}`;
    fetchWeatherAndLocality(city.latitude, city.longitude, cityName);
  };

  // Determine current weather visual info
  const currentCode = weatherData?.current?.weather_code ?? 0;
  const currentTemp = weatherData?.current?.temperature_2m ?? 0;
  const currentUV = weatherData?.daily?.uv_index_max?.[0] ?? 0;
  const info = getWeatherInfo(currentCode);
  const isDay = weatherData?.current?.is_day ?? 1;

  // Use night theme if sunset / is_day === 0
  const finalTheme = isDay === 0 ? 'night' : info.theme;

  return (
    <div className={styles.page}>
      <PixelCanvas />

      <main className={styles.main}>
        {/* Header */}
        <header className={`${styles.header} rpg-box fade-in`}>
          <div className="px-titlebar">
            <span>◄ THỜI TIẾT RPG 🌤️ ►</span>
          </div>
        </header>

        {loading ? (
          <div className={`${styles.loadingBox} rpg-box fade-in`}>
            <div className={styles.loaderText}>[ {locationName.toUpperCase()} ]</div>
            <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>Xin vui lòng chờ trong giây lát...</div>
          </div>
        ) : showSearch ? (
          /* Geolocation Fallback/Search Card */
          <div className={`${styles.searchCard} rpg-box fade-in`}>
            <div className="px-titlebar">
              <span>◄ TÌM KIẾM ĐỊA DANH ►</span>
              {weatherData && (
                <span 
                  style={{ cursor: 'pointer', fontWeight: 'bold' }} 
                  onClick={() => setShowSearch(false)}
                >
                  [ QUAY LẠI ]
                </span>
              )}
            </div>
            
            <div className={styles.searchHeader}>
              📍 Không thể tự động định vị GPS hoặc bạn muốn kiểm tra nơi khác.
              Vui lòng nhập tên tỉnh/thành phố để xem thời tiết:
            </div>

            <div className={styles.searchGroup}>
              <input
                type="text"
                placeholder="Nhập tên thành phố (vd: Ha Noi, Kon Tum)"
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="btn btn-primary" onClick={handleSearch} disabled={isSearchingCities}>
                {isSearchingCities ? '[ TÌM... ]' : '[ TÌM ]'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className={styles.resultsList}>
                <div className={styles.resultsTitle}>KẾT QUẢ TÌM THẤY:</div>
                {searchResults.map((res, i) => (
                  <div
                    key={i}
                    className={styles.resultItem}
                    onClick={() => handleSelectCity(res)}
                  >
                    📍 {res.name}{res.admin1 ? `, ${res.admin1}` : ''}, {res.country}
                  </div>
                ))}
              </div>
            )}

            {searchError && <div className={styles.noResults}>{searchError}</div>}

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {weatherData && (
                <button
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setShowSearch(false)}
                >
                  [ HỦY ]
                </button>
              )}
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={detectLocation}
              >
                [ 📍 TỰ ĐỘNG ĐỊNH VỊ ]
              </button>
            </div>
          </div>
        ) : (
          /* Main Weather display */
          <div className={`${styles.weatherCard} rpg-box fade-in ${styles[finalTheme]}`}>
            <div className="px-titlebar">
              <span>◄ THỜI TIẾT THỜI GIAN THỰC ►</span>
              <span 
                style={{ cursor: 'pointer', fontWeight: 'bold' }} 
                onClick={() => setShowSearch(true)}
                title="Tìm nơi khác"
              >
                [🔍 TÌM]
              </span>
            </div>

            {/* Location block */}
            <div className={styles.locationSection}>
              <div className={styles.locationTitle}>
                <span>📍</span> {locationName}
              </div>
              <div className={styles.locationSub}>
                Cập nhật lúc: {new Date(weatherData.current.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Current temp & emoji */}
            <div className={styles.tempRow}>
              <div className={styles.emojiWrap}>{info.emoji}</div>
              <div className={styles.tempWrap}>
                <div className={styles.tempNum}>{Math.round(currentTemp)}°C</div>
                <div className={styles.tempDesc}>{info.label.toUpperCase()}</div>
              </div>
            </div>

            {/* RPG Farmer Speech Box */}
            <div className={styles.adviceBubble}>
              <div className={styles.adviceTitle}>
                <span>👨‍🌾</span> LỜI KHUYÊN LÀM NÔNG:
              </div>
              <div>{getFarmingAdvice(currentTemp, currentCode, currentUV)}</div>
            </div>

            {/* Metrics Grid */}
            <div className={styles.metricsGrid}>
              <div className={styles.metricBox}>
                <span className={styles.metricLabel}>🌡️ Cảm nhận</span>
                <span className={styles.metricVal}>{Math.round(weatherData.current.apparent_temperature)}°C</span>
              </div>
              <div className={styles.metricBox}>
                <span className={styles.metricLabel}>💧 Độ ẩm</span>
                <span className={styles.metricVal}>{weatherData.current.relative_humidity_2m}%</span>
              </div>
              <div className={styles.metricBox}>
                <span className={styles.metricLabel}>💨 Tốc độ gió</span>
                <span className={styles.metricVal}>{weatherData.current.wind_speed_10m} km/h</span>
              </div>
              <div className={styles.metricBox}>
                <span className={styles.metricLabel}>☔ Lượng mưa</span>
                <span className={styles.metricVal}>{weatherData.current.precipitation} mm</span>
              </div>
            </div>

            {/* 5-Day Forecast list */}
            <div className={styles.forecastSection}>
              <div className={styles.forecastTitle}>
                <span>📅</span> DỰ BÁO 5 NGÀY TIẾP THEO:
              </div>
              <div className={styles.forecastList}>
                {weatherData.daily.time.slice(1, 6).map((time, i) => {
                  const dayCode = weatherData.daily.weather_code[i + 1];
                  const dayInfo = getWeatherInfo(dayCode);
                  const maxT = weatherData.daily.temperature_2m_max[i + 1];
                  const minT = weatherData.daily.temperature_2m_min[i + 1];
                  return (
                    <div key={time} className={styles.forecastItem}>
                      <span className={styles.forecastDay}>{getDayName(time)}</span>
                      <span className={styles.forecastEmoji} title={dayInfo.label}>
                        {dayInfo.emoji}
                      </span>
                      <span className={styles.forecastTemps}>
                        <span className={styles.tempMax}>{Math.round(maxT)}°C</span>
                        <span className={styles.tempMin}>{Math.round(minT)}°C</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', justifyContent: 'center' }}>
              <button
                className="btn btn-outline"
                style={{ padding: '6px 12px', minWidth: '135px' }}
                onClick={() => setShowSearch(true)}
              >
                [ 🔍 XEM NƠI KHÁC ]
              </button>
              <button
                className="btn btn-outline"
                style={{ padding: '6px 12px', minWidth: '135px' }}
                onClick={detectLocation}
              >
                [ 🔄 CẬP NHẬT ]
              </button>
            </div>
          </div>
        )}

        <button
          className="btn btn-outline"
          onClick={() => navigate('/utilities')}
        >
          [ QUAY LẠI TIỆN ÍCH ]
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
