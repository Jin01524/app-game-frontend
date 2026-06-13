import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './MyMoviesPage.module.css';

export default function MyMoviesPage() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'az' | 'popular'

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDetail, setMovieDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [activeEpisodeIndex, setActiveEpisodeIndex] = useState(0);
  
  const [theaterMode, setTheaterMode] = useState(false);
  const [isFloating, setIsFloating] = useState(false);
  const [seekMsg, setSeekMsg] = useState('');

  // Refs for tracking play duration on server
  const playerRef = useRef(null);
  const startTimeRef = useRef(null);
  const activeEpisodeRef = useRef(null);
  const activePartIndexRef = useRef(0);
  const activeEpisodeIndexRef = useRef(0);
  const movieRef = useRef(null);
  const playerAnchorRef = useRef(null);
  const ytPlayerContainerRef = useRef(null);

  // Load list of movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await authFetch('/api/movies');
        if (res.ok) {
          setMovies(await res.json());
        }
      } catch (err) {
        console.error('Failed to load movies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [authFetch]);

  // Load detail movie including user watchLogs
  const loadMovieDetail = async (movieId) => {
    setDetailLoading(true);
    try {
      const res = await authFetch(`/api/movies/${movieId}`);
      if (res.ok) {
        const data = await res.json();
        setMovieDetail(data);
        movieRef.current = data;
        
        // Find default episode to play
        let pIdx = 0;
        let eIdx = 0;
        
        // If has parts, try to play the last watched episode
        if (data.watchLogs && data.watchLogs.length > 0) {
          // Find the watch log with latest lastWatchedAt or just find one
          if (data.watchLogs[0]) {
            pIdx = data.watchLogs[0].partIndex;
            eIdx = data.watchLogs[0].episodeIndex;
          }
        }
        
        setActivePartIndex(pIdx);
        activePartIndexRef.current = pIdx;
        setActiveEpisodeIndex(eIdx);
        activeEpisodeIndexRef.current = eIdx;
        
        if (data.parts && data.parts[pIdx] && data.parts[pIdx].episodes && data.parts[pIdx].episodes[eIdx]) {
          activeEpisodeRef.current = data.parts[pIdx].episodes[eIdx];
        }
      }
    } catch (err) {
      console.error('Failed to load movie detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Helper to extract YouTube ID
  const extractYoutubeId = (url) => {
    if (!url) return '';
    const reg = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(reg);
    return match ? match[1] : '';
  };

  // Save watch duration
  const saveWatchTime = useCallback((playerInstance) => {
    if (!startTimeRef.current || !activeEpisodeRef.current || !movieRef.current) return;
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
    startTimeRef.current = null; // Reset
    
    if (duration <= 0) return;
    
    const lastPosition = Math.round(playerInstance ? playerInstance.getCurrentTime() : 0);
    
    const payload = {
      movieId: movieRef.current.id,
      partIndex: activePartIndexRef.current,
      episodeIndex: activeEpisodeIndexRef.current,
      duration: duration,
      lastPosition: lastPosition
    };
    
    const token = localStorage.getItem('tl42_token');
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/movies/watch-time`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(err => console.error('Failed to save watch-time:', err));
  }, []);

  // Initialize YT Player API
  const initPlayer = useCallback((videoId, resumeSecs) => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {}
      playerRef.current = null;
    }
    
    const createPlayer = () => {
      if (!ytPlayerContainerRef.current) return;
      ytPlayerContainerRef.current.innerHTML = '';
      const playerDiv = document.createElement('div');
      ytPlayerContainerRef.current.appendChild(playerDiv);

      playerRef.current = new window.YT.Player(playerDiv, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          start: resumeSecs || 0
        },
        events: {
          onReady: (event) => {
            if (resumeSecs > 0) {
              setSeekMsg(`Tiếp tục xem từ ${formatTimeLabel(resumeSecs)}`);
              // Clear message after 3s
              setTimeout(() => setSeekMsg(''), 3000);
            }
          },
          onStateChange: (event) => {
            // PLAYING
            if (event.data === window.YT.PlayerState.PLAYING) {
              startTimeRef.current = Date.now();
            } 
            // PAUSED or ENDED
            else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              saveWatchTime(event.target);
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      // Set up global callback
      window.onYouTubeIframeAPIReady = createPlayer;
      
      // Load script if not already loaded
      if (!document.getElementById('yt-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }
  }, [saveWatchTime]);

  // Handle unload events
  useEffect(() => {
    const handleUnload = () => {
      if (playerRef.current) {
        saveWatchTime(playerRef.current);
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && playerRef.current) {
        saveWatchTime(playerRef.current);
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveWatchTime]);

  // Handle movie selection
  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    loadMovieDetail(movie.id);
  };

  // Handle episode change
  const handleSelectEpisode = (pIdx, eIdx) => {
    // Save current progress if playing
    if (playerRef.current) {
      saveWatchTime(playerRef.current);
    }
    
    setActivePartIndex(pIdx);
    activePartIndexRef.current = pIdx;
    setActiveEpisodeIndex(eIdx);
    activeEpisodeIndexRef.current = eIdx;
    
    const ep = movieDetail.parts[pIdx].episodes[eIdx];
    activeEpisodeRef.current = ep;

    // Find if has resume position
    const log = movieDetail.watchLogs.find(l => l.partIndex === pIdx && l.episodeIndex === eIdx);
    const resumeSecs = log ? log.lastPositionSeconds : 0;

    const videoId = extractYoutubeId(ep.url);
    
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      try {
        playerRef.current.loadVideoById({
          videoId: videoId,
          startSeconds: resumeSecs || 0
        });
        if (resumeSecs > 0) {
          setSeekMsg(`Tiếp tục xem từ ${formatTimeLabel(resumeSecs)}`);
          setTimeout(() => setSeekMsg(''), 3000);
        }
      } catch (err) {
        initPlayer(videoId, resumeSecs);
      }
    } else {
      initPlayer(videoId, resumeSecs);
    }
  };

  // Initialize player when details finish loading
  useEffect(() => {
    if (movieDetail && movieDetail.parts && movieDetail.parts[activePartIndex] && movieDetail.parts[activePartIndex].episodes && movieDetail.parts[activePartIndex].episodes[activeEpisodeIndex]) {
      const ep = movieDetail.parts[activePartIndex].episodes[activeEpisodeIndex];
      const videoId = extractYoutubeId(ep.url);
      
      const log = movieDetail.watchLogs.find(l => l.partIndex === activePartIndex && l.episodeIndex === activeEpisodeIndex);
      const resumeSecs = log ? log.lastPositionSeconds : 0;
      
      initPlayer(videoId, resumeSecs);
    }
    
    return () => {
      // Destroy player on exit details
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
    };
  }, [movieDetail, initPlayer]);

  // Picture in picture / floating player on scroll down
  useEffect(() => {
    if (!selectedMovie || !movieDetail) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsFloating(!entry.isIntersecting);
    }, {
      threshold: 0.1
    });
    
    const anchor = playerAnchorRef.current;
    if (anchor) {
      observer.observe(anchor);
    }
    
    return () => {
      if (anchor) {
        observer.unobserve(anchor);
      }
    };
  }, [selectedMovie, movieDetail]);

  const handleBackToCatalog = () => {
    // Save watch time if playing
    if (playerRef.current) {
      saveWatchTime(playerRef.current);
    }
    
    // Reset player
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {}
      playerRef.current = null;
    }
    
    setSelectedMovie(null);
    setMovieDetail(null);
    setIsFloating(false);
    setTheaterMode(false);
  };

  // Filter & Sort Logic
  const genres = [...new Set(movies.map(m => m.genre).filter(Boolean))];
  const countries = [...new Set(movies.map(m => m.country).filter(Boolean))];

  const filteredMovies = movies
    .filter(m => {
      const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                          (m.tags || '').toLowerCase().includes(search.toLowerCase());
      const matchGenre = !selectedGenre || m.genre === selectedGenre;
      const matchCountry = !selectedCountry || m.country === selectedCountry;
      return matchSearch && matchGenre && matchCountry;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return b.id - a.id;
      } else if (sortBy === 'az') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'popular') {
        return b.episodesCount - a.episodesCount;
      }
      return 0;
    });

  const formatTimeLabel = (totalSecs) => {
    if (!totalSecs) return '00:00';
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getWatchLog = (pIdx, eIdx) => {
    if (!movieDetail || !movieDetail.watchLogs) return null;
    return movieDetail.watchLogs.find(l => l.partIndex === pIdx && l.episodeIndex === eIdx);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        
        {/* CATALOG VIEW */}
        {!selectedMovie && (
          <>
            <header className={styles.header}>
              <button className={styles.backBtn} onClick={() => navigate('/utilities')}>
                ← Quay lại tiện ích
              </button>
              <h1 className={styles.title}>🎬 PHIM CỦA TÔI</h1>
            </header>

            {/* Catalog Filters */}
            <div className={styles.filterSection}>
              <div className={styles.searchBox}>
                <input
                  className={styles.searchInput}
                  placeholder="Tìm tên phim hoặc nhãn..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <select
                className={styles.selectBox}
                value={selectedGenre}
                onChange={e => setSelectedGenre(e.target.value)}
              >
                <option value="">-- Tất cả Thể loại --</option>
                {genres.map((g, idx) => (
                  <option key={idx} value={g}>{g}</option>
                ))}
              </select>

              <select
                className={styles.selectBox}
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
              >
                <option value="">-- Tất cả Quốc gia --</option>
                {countries.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>

              <select
                className={styles.selectBox}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="az">Tên A-Z</option>
                <option value="popular">Xem nhiều nhất</option>
              </select>
            </div>

            {/* Movie Grid */}
            {loading ? (
              <div className={styles.loadingCenter}>
                <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
              </div>
            ) : filteredMovies.length === 0 ? (
              <div className={styles.emptyState}>
                Không tìm thấy phim nào khớp với bộ lọc của bạn.
              </div>
            ) : (
              <div className={styles.grid}>
                {filteredMovies.map(movie => (
                  <div
                    key={movie.id}
                    className={styles.movieCard}
                    onClick={() => handleSelectMovie(movie)}
                  >
                    <div className={styles.coverContainer}>
                      {movie.coverUrl ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL || ''}${movie.coverUrl}`}
                          alt={movie.title}
                          className={styles.coverImg}
                        />
                      ) : (
                        <div className={styles.placeholderCover}>🎬</div>
                      )}
                    </div>
                    <div className={styles.movieInfo}>
                      <h3 className={styles.movieTitle}>{movie.title}</h3>
                      <div className={styles.movieMeta}>
                        {movie.genre && <span className={styles.badge}>{movie.genre}</span>}
                        {movie.country && <span className={styles.badge}>{movie.country}</span>}
                        <span className={styles.badge}>
                          {movie.partsCount} Phần • {movie.episodesCount} Tập
                        </span>
                      </div>
                      {movie.tags && (
                        <div className={styles.tagsContainer}>
                          {movie.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3).map((t, idx) => (
                            <span key={idx} className={styles.tag}>#{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* DETAIL VIEW */}
        {selectedMovie && (
          <>
            <header className={styles.header}>
              <button className={styles.backBtn} onClick={handleBackToCatalog}>
                ← Quay lại danh sách phim
              </button>
            </header>

            {detailLoading || !movieDetail ? (
              <div className={styles.loadingCenter}>
                <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
              </div>
            ) : (
              <div className={styles.detailGrid}>
                {/* Main Player Column */}
                <div className={styles.playerSection}>
                  <div
                    ref={playerAnchorRef}
                    className={`${styles.playerPlaceholder} ${theaterMode ? styles.playerPlaceholderWide : ''}`}
                  >
                    <div
                      className={`${styles.playerWrapper} ${theaterMode ? styles.playerWrapperWide : ''} ${isFloating ? styles.playerWrapperFloating : ''}`}
                    >
                      {seekMsg && <div className={styles.seekNotification}>{seekMsg}</div>}
                      <div ref={ytPlayerContainerRef} className={styles.playerIframe}></div>
                    </div>
                  </div>

                  <div className={styles.playerControls}>
                    <button
                      className={styles.theaterBtn}
                      onClick={() => setTheaterMode(!theaterMode)}
                    >
                      {theaterMode ? '📺 Chế độ thường' : '🖥️ Chế độ rạp chiếu'}
                    </button>
                  </div>

                  <div className={styles.movieMetaDetails}>
                    <h1 className={styles.movieTitleLarge}>{movieDetail.title}</h1>
                    <div className={styles.movieMeta}>
                      {movieDetail.genre && <span className={styles.badge}>{movieDetail.genre}</span>}
                      {movieDetail.country && <span className={styles.badge}>{movieDetail.country}</span>}
                      {movieDetail.tags && movieDetail.tags.split(',').map(t => t.trim()).filter(Boolean).map((t, idx) => (
                        <span key={idx} className={styles.tag} style={{ fontSize: '0.8rem' }}>#{t}</span>
                      ))}
                    </div>
                    {movieDetail.description && (
                      <p className={styles.descriptionText}>{movieDetail.description}</p>
                    )}
                  </div>
                </div>

                {/* Sidebar Episodes Column */}
                <div className={styles.sidebarSection}>
                  <div className={styles.partsContainer}>
                    <h2 className={styles.sidebarTitle}>Danh sách tập phim</h2>
                    
                    {/* Part Switcher tabs */}
                    {movieDetail.parts && movieDetail.parts.length > 1 && (
                      <div className={styles.partSelector}>
                        {movieDetail.parts.map((part, pIdx) => (
                          <button
                            key={pIdx}
                            className={`${styles.partTab} ${activePartIndex === pIdx ? styles.partTabActive : ''}`}
                            onClick={() => setActivePartIndex(pIdx)}
                          >
                            {part.title || `Phần ${pIdx + 1}`}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Episodes of selected part */}
                    <div className={styles.episodesList}>
                      {movieDetail.parts && movieDetail.parts[activePartIndex] && movieDetail.parts[activePartIndex].episodes.map((ep, eIdx) => {
                        const isActive = activePartIndex === activePartIndexRef.current && eIdx === activeEpisodeIndexRef.current;
                        const watchLog = getWatchLog(activePartIndex, eIdx);
                        
                        return (
                          <div
                            key={eIdx}
                            className={`${styles.episodeItem} ${isActive ? styles.episodeItemActive : ''}`}
                            onClick={() => handleSelectEpisode(activePartIndex, eIdx)}
                          >
                            <span className={styles.epTitle}>{ep.title}</span>
                            {watchLog && watchLog.watchedSeconds > 0 && (
                              <div className={styles.epProgress}>
                                <span>Đã xem: {formatTimeLabel(watchLog.watchedSeconds)}</span>
                                {watchLog.lastPositionSeconds > 0 && (
                                  <span>Dừng ở: {formatTimeLabel(watchLog.lastPositionSeconds)}</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
