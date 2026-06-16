import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './MyMoviesPage.module.css';

// Client-side Google Photos HTML parser to extract streamable video URLs
const extractVideosFromHtmlClient = (html) => {
  let videos = [];
  
  // Method 1: JSON Parsing of ds:1 callback
  try {
    const startKeyword = "AF_initDataCallback({key: 'ds:1'";
    const startIdx = html.indexOf(startKeyword);
    if (startIdx !== -1) {
      const dataKeyword = "data:";
      const dataIdx = html.indexOf(dataKeyword, startIdx);
      if (dataIdx !== -1) {
        const sideChannelKeyword = ", sideChannel:";
        let endIdx = html.indexOf(sideChannelKeyword, dataIdx);
        if (endIdx === -1) {
          endIdx = html.indexOf("});", dataIdx);
        }
        if (endIdx !== -1) {
          const dataStr = html.substring(dataIdx + dataKeyword.length, endIdx).trim();
          const data = JSON.parse(dataStr);
          const items = data[1] || [];
          
          for (const item of items) {
            const id = item[0];
            const itemInfo = item[1];
            const metadata = item[9];
            if (metadata && metadata['76647426']) {
              const baseUrl = itemInfo[0];
              const durationMs = metadata['76647426'][0];
              videos.push({
                id,
                baseUrl,
                videoUrl: `${baseUrl}=m22`,
                durationMs
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Client Parser] JSON parsing failed:', err);
  }
  
  // Method 2: Regex fallback (matches Google User Content links directly)
  if (videos.length === 0) {
    try {
      const guRegex = /(https:\/\/lh3\.googleusercontent\.com\/pw\/[a-zA-Z0-9_-]+)/g;
      const matches = html.match(guRegex);
      if (matches && matches.length > 0) {
        const uniqueUrls = [...new Set(matches)];
        uniqueUrls.forEach((url, idx) => {
          videos.push({
            id: `regex_${idx}`,
            baseUrl: url,
            videoUrl: `${url}=m22`,
            durationMs: 0
          });
        });
      }
    } catch (err) {
      console.error('[Client Parser] Regex extraction failed:', err);
    }
  }
  
  return videos;
};

// Frontend cache helpers for resolved Google Photos URLs
const PHOTOS_CACHE_TTL = 60 * 60 * 1000; // 1 hour — Google CDN URLs typically expire in ~1-2h

const getCachedPhotosData = (url) => {
  try {
    const cached = localStorage.getItem(`gphotos_cache_v2_${url}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.expiresAt > Date.now()) {
        return parsed.data;
      } else {
        localStorage.removeItem(`gphotos_cache_v2_${url}`);
      }
    }
  } catch (e) {
    console.warn('[Cache] Failed to read from localStorage:', e);
  }
  return null;
};

const setCachedPhotosData = (url, data) => {
  try {
    localStorage.setItem(`gphotos_cache_v2_${url}`, JSON.stringify({ data, expiresAt: Date.now() + PHOTOS_CACHE_TTL }));
  } catch (e) {
    console.warn('[Cache] Failed to write to localStorage:', e);
  }
};

const invalidateCachedPhotosData = (url) => {
  try {
    localStorage.removeItem(`gphotos_cache_v2_${url}`);
    localStorage.removeItem(`gphotos_cache_${url}`);
    console.log('[Cache] Invalidated stale URL cache for:', url);
  } catch (e) {}
};

// Client-side Google Photos short-link resolver using free CORS proxies
const resolvePhotosUrlClient = async (url) => {
  // Check local cache first
  const cachedUrl = getCachedPhotosUrl(url);
  if (cachedUrl) {
    console.log('[Client Photos] Loaded resolved stream URL from localStorage cache.');
    return cachedUrl;
  }

  // We only try api.cors.lol on the client side with a strict 4.5s timeout.
  // If it fails or times out, we throw immediately to fall back to the backend.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn('[Client Photos] api.cors.lol resolve timed out. Aborting.');
    controller.abort();
  }, 3000);

  try {
    const proxyUrl = `https://api.cors.lol/?url=${encodeURIComponent(url)}`;
    console.log(`[Client Photos] Resolving URL via api.cors.lol (3s timeout)...`);
    const res = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const text = await res.text();
    const videos = extractVideosFromHtmlClient(text);
    if (videos && videos.length > 0) {
      const streamUrl = videos[0].videoUrl;
      console.log(`[Client Photos] Successfully resolved via api.cors.lol.`);
      setCachedPhotosUrl(url, streamUrl);
      return streamUrl;
    }
    throw new Error('No streamable videos found in HTML');
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`[Client Photos] api.cors.lol failed:`, err.name === 'AbortError' ? 'Timeout' : err.message);
    throw err;
  }
};

export default function MyMoviesPage() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'az' | 'popular' | 'year-desc' | 'year-asc'

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDetail, setMovieDetail] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [activeEpisodeIndex, setActiveEpisodeIndex] = useState(0);
  
  const [theaterMode, setTheaterMode] = useState(false);
  const [isFloating, setIsFloating] = useState(false);
  const [seekMsg, setSeekMsg] = useState('');
  const [photosStreamUrl, setPhotosStreamUrl] = useState('');
  const [photosQualities, setPhotosQualities] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState('720p');
  const [photosLoading, setPhotosLoading] = useState(false);
  const [photosError, setPhotosError] = useState('');
  const [useProxyFallback, setUseProxyFallback] = useState(false);
  const photosSourceUrlRef = useRef('');        // original photos URL of current stream
  const proxyResolvedAttemptRef = useRef(false); // guard: prevent infinite re-resolve loop

  // Refs for tracking play duration on server
  const playerRef = useRef(null);
  const nativePlayerRef = useRef(null);
  const resumeSecsRef = useRef(0);
  const startTimeRef = useRef(null);
  const activeEpisodeRef = useRef(null);
  const activePartIndexRef = useRef(0);
  const activeEpisodeIndexRef = useRef(0);
  const movieRef = useRef(null);
  const playerAnchorRef = useRef(null);
  const ytPlayerContainerRef = useRef(null);
  const initializedUrlRef = useRef('');

  // Load list of movies
  const fetchMovies = useCallback(async () => {
    try {
      const res = await authFetch('/api/movies');
      if (res.ok) {
        setMovies(await res.json());
      }
    } catch (err) {
      console.error('Failed to load movies:', err);
    }
  }, [authFetch]);

  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      await fetchMovies();
      setLoading(false);
    };
    initFetch();
  }, [fetchMovies]);

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

  // Helper to extract Google Drive file ID
  const extractDriveId = (url) => {
    if (!url) return '';
    const reg = /\/file\/d\/([a-zA-Z0-9_-]{25,})|open\?id=([a-zA-Z0-9_-]{25,})/i;
    const match = url.match(reg);
    return match ? (match[1] || match[2]) : '';
  };

  // Save watch duration
  const saveWatchTime = useCallback((playerInstance) => {
    try {
      if (!startTimeRef.current || !activeEpisodeRef.current || !movieRef.current) return;
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      startTimeRef.current = null; // Reset
      
      if (duration <= 0) return;
      
      let lastPosition = 0;
      if (playerInstance) {
        if (typeof playerInstance.getCurrentTime === 'function') {
          try {
            lastPosition = Math.round(playerInstance.getCurrentTime());
          } catch (e) {
            console.error('Error getting current time from player:', e);
          }
        } else if (playerInstance.currentTime !== undefined) {
          lastPosition = Math.round(playerInstance.currentTime);
        }
      }
      
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
    } catch (err) {
      console.error('Error in saveWatchTime:', err);
    }
  }, []);

  // Initialize YT Player or Google Drive Iframe
  const initPlayer = useCallback((url, resumeSecs) => {
    if (!url) {
      console.warn('initPlayer called without URL');
      return;
    }

    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {}
      playerRef.current = null;
    }

    if (nativePlayerRef.current) {
      saveWatchTime(nativePlayerRef.current);
      nativePlayerRef.current = null;
    }
    
    if (!ytPlayerContainerRef.current) return;
    ytPlayerContainerRef.current.innerHTML = '';

    const videoId = extractYoutubeId(url);
    const driveId = extractDriveId(url);
    const isPhotos = url && /photos\.app\.goo\.gl|photos\.google\.com/i.test(url);

    if (videoId) {
      const createPlayer = () => {
        try {
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
        } catch (err) {
          console.error('Error in createPlayer inside initPlayer:', err);
        }
      };

      if (window.YT && window.YT.Player) {
        createPlayer();
      } else {
        // Set up global callback (chaining to avoid overwriting existing callbacks)
        const previousCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (typeof previousCallback === 'function') {
            try {
              previousCallback();
            } catch (e) {
              console.error('Error in previous onYouTubeIframeAPIReady callback:', e);
            }
          }
          createPlayer();
        };
        
        // Load script if not already loaded
        if (!document.getElementById('yt-iframe-api-script')) {
          const tag = document.createElement('script');
          tag.id = 'yt-iframe-api-script';
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
      }
    } else if (driveId) {
      // Create and append Google Drive preview iframe
      const iframe = document.createElement('iframe');
      iframe.src = `https://drive.google.com/file/d/${driveId}/preview`;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = '0';
      iframe.setAttribute('allow', 'autoplay');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('scrolling', 'no');
      
      // Google Drive iframe doesn't support state triggers, so track page visit time
      startTimeRef.current = Date.now();
      
      ytPlayerContainerRef.current.appendChild(iframe);
    } else if (isPhotos) {
      setPhotosLoading(true);
      setPhotosStreamUrl('');
      setPhotosQualities(null);
      setSelectedQuality('720p');
      setPhotosError('');
      setUseProxyFallback(false);
      photosSourceUrlRef.current = url;
      proxyResolvedAttemptRef.current = false; // reset guard for new episode
      resumeSecsRef.current = resumeSecs || 0;
      
      const resolveAndPlay = async () => {
        try {
          let cached = getCachedPhotosData(url);
          let streamUrl;
          let qualities = null;
          
          if (cached) {
            console.log('[Client Photos] Loaded resolved stream URL from cache.');
            streamUrl = cached.streamUrl;
            qualities = cached.qualities;
          } else {
            // Chúng ta luôn phân giải qua backend để kiểm tra chất lượng (HEAD requests)
            const res = await authFetch(`/api/movies/photos-url?url=${encodeURIComponent(url)}`);
            if (!res.ok) throw new Error('Backend resolver failed');
            const data = await res.json();
            streamUrl = data.videoUrl;
            qualities = data.qualities;
            
            // Lưu cache dữ liệu phân giải đầy đủ
            setCachedPhotosData(url, { streamUrl, qualities });
          }
          
          setPhotosStreamUrl(streamUrl);
          setPhotosQualities(qualities);
          
          // Khởi tạo chất lượng hiển thị tương ứng
          if (streamUrl.includes('=m37')) {
            setSelectedQuality('1080p');
          } else if (streamUrl.includes('=m22')) {
            setSelectedQuality('720p');
          } else if (streamUrl.includes('=m18')) {
            setSelectedQuality('360p');
          } else {
            setSelectedQuality('720p');
          }
          
          startTimeRef.current = Date.now();
          
          if (resumeSecs > 0) {
            setSeekMsg(`Tiếp tục xem từ ${formatTimeLabel(resumeSecs)}`);
            setTimeout(() => setSeekMsg(''), 3000);
          }
        } catch (err) {
          console.error('[Photos] Resolution failed:', err);
          setPhotosError('⚠️ Không thể tải video từ Google Photos. Vui lòng đảm bảo quyền chia sẻ liên kết là công khai.');
        } finally {
          setPhotosLoading(false);
        }
      };
      
      resolveAndPlay();
    } else {
      console.warn('Unknown video URL type:', url);
    }
  }, [saveWatchTime, authFetch]);

  // When direct stream fails:
  // 1. If haven't tried re-resolve yet: invalidate cache, get fresh URL, switch to backend proxy
  // 2. If already tried: show error (prevents infinite loop)
  // NOTE: lh3.googleusercontent.com requires Referer header - browser cannot set it,
  //       so direct streaming always fails. The proxy adds proper headers.
  const handlePhotosStreamError = useCallback(() => {
    const sourceUrl = photosSourceUrlRef.current;
    if (!sourceUrl || !photosStreamUrl) return;
    
    // Guard: if we've already attempted a re-resolve+proxy, stop here to prevent infinite loop
    if (proxyResolvedAttemptRef.current) {
      console.warn('[Photos Player] Proxy also failed, giving up.');
      setPhotosError('⚠️ Không thể phát video này. Vui lòng kiểm tra quyền chia sẻ công khai của link Google Photos.');
      setPhotosStreamUrl('');
      return;
    }
    
    proxyResolvedAttemptRef.current = true;
    console.warn('[Photos Player] Direct stream failed — re-resolving fresh URL and switching to backend proxy...');
    invalidateCachedPhotosData(sourceUrl);
    setPhotosLoading(true);
    setPhotosStreamUrl('');
    
    // Get a fresh URL from backend, then serve it via proxy (which adds correct Referer headers)
    authFetch(`/api/movies/photos-url?url=${encodeURIComponent(sourceUrl)}`)
      .then(res => {
        if (!res.ok) throw new Error('Backend resolver failed');
        return res.json();
      })
      .then(data => {
        setCachedPhotosData(sourceUrl, { streamUrl: data.videoUrl, qualities: data.qualities });
        setPhotosStreamUrl(data.videoUrl);
        setPhotosQualities(data.qualities);
        // Khởi tạo chất lượng hiển thị tương ứng
        if (data.videoUrl.includes('=m37')) {
          setSelectedQuality('1080p');
        } else if (data.videoUrl.includes('=m22')) {
          setSelectedQuality('720p');
        } else if (data.videoUrl.includes('=m18')) {
          setSelectedQuality('360p');
        } else {
          setSelectedQuality('720p');
        }
        setUseProxyFallback(true); // switch to proxy mode - DO NOT retry direct stream
        console.log('[Photos Player] Fresh URL obtained, streaming via backend proxy.');
      })
      .catch(err => {
        console.error('[Photos Player] Re-resolution failed:', err);
        setPhotosError('⚠️ Không thể tải video từ Google Photos. Vui lòng đảm bảo quyền chia sẻ liên kết là công khai.');
      })
      .finally(() => setPhotosLoading(false));
  }, [authFetch, photosStreamUrl]);

  // Thay đổi chất lượng phát trực tiếp
  const handleQualityChange = (qualityName) => {
    if (!photosQualities || !photosQualities[qualityName]) return;
    const spec = photosQualities[qualityName];
    if (!spec.available) return;

    // Lưu lại thời gian phát hiện tại để tiếp tục phát sau khi chuyển chất lượng
    const currentTime = nativePlayerRef.current ? nativePlayerRef.current.currentTime : 0;
    resumeSecsRef.current = currentTime;

    setSelectedQuality(qualityName);
    setPhotosStreamUrl(spec.url);
  };

  // Handle unload events
  useEffect(() => {
    const handleUnload = () => {
      if (playerRef.current) {
        saveWatchTime(playerRef.current);
      } else if (nativePlayerRef.current) {
        saveWatchTime(nativePlayerRef.current);
      } else if (startTimeRef.current) {
        saveWatchTime(null);
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (playerRef.current) {
          saveWatchTime(playerRef.current);
        } else if (nativePlayerRef.current) {
          saveWatchTime(nativePlayerRef.current);
        } else if (startTimeRef.current) {
          saveWatchTime(null);
        }
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
    try {
      // Save current progress if playing/watching
      if (playerRef.current) {
        saveWatchTime(playerRef.current);
      } else if (nativePlayerRef.current) {
        saveWatchTime(nativePlayerRef.current);
        nativePlayerRef.current = null;
      } else if (startTimeRef.current) {
        saveWatchTime(null);
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
      const driveId = extractDriveId(ep.url);
      const isPhotos = ep.url && /photos\.app\.goo\.gl|photos\.google\.com/i.test(ep.url);
      
      if (!videoId && !driveId && !isPhotos) {
        console.warn('Invalid URL in episode:', ep.url);
        return;
      }
      
      // If the current video is YouTube and the new video is also YouTube, we can try to reuse the player
      if (videoId && playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        try {
          initializedUrlRef.current = ep.url; // Update ref to new URL since we reuse player
          playerRef.current.loadVideoById({
            videoId: videoId,
            startSeconds: resumeSecs || 0
          });
          if (resumeSecs > 0) {
            setSeekMsg(`Tiếp tục xem từ ${formatTimeLabel(resumeSecs)}`);
            setTimeout(() => setSeekMsg(''), 3000);
          }
        } catch (err) {
          // If reuse failed, let useEffect initialize it (we clear initializedUrlRef first)
          initializedUrlRef.current = '';
        }
      } else {
        // Clear initializedUrlRef to let useEffect initialize it
        initializedUrlRef.current = '';
      }
    } catch (err) {
      console.error('Error in handleSelectEpisode:', err);
    }
  };

  // Initialize player when details finish loading (with duplicate initialization guard)
  useEffect(() => {
    if (!isPlaying) {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
      if (nativePlayerRef.current) {
        saveWatchTime(nativePlayerRef.current);
        nativePlayerRef.current = null;
      }
      initializedUrlRef.current = '';
      return;
    }

    if (movieDetail && movieDetail.parts && movieDetail.parts[activePartIndex] && movieDetail.parts[activePartIndex].episodes && movieDetail.parts[activePartIndex].episodes[activeEpisodeIndex]) {
      const ep = movieDetail.parts[activePartIndex].episodes[activeEpisodeIndex];
      
      // Guard: Skip if this specific URL is already the active initialized player target
      if (initializedUrlRef.current === ep.url) {
        return;
      }
      
      const videoId = extractYoutubeId(ep.url);
      const driveId = extractDriveId(ep.url);
      const isPhotos = ep.url && /photos\.app\.goo\.gl|photos\.google\.com/i.test(ep.url);
      
      const log = movieDetail.watchLogs.find(l => l.partIndex === activePartIndex && l.episodeIndex === activeEpisodeIndex);
      const resumeSecs = log ? log.lastPositionSeconds : 0;
      
      if (videoId || driveId || isPhotos) {
        console.log('[Player Init] Initializing player for URL:', ep.url.substring(0, 60) + '...');
        initializedUrlRef.current = ep.url;
        initPlayer(ep.url, resumeSecs);
      } else {
        console.warn('Could not extract video source for episode:', ep.url);
      }
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
  }, [movieDetail, initPlayer, activePartIndex, activeEpisodeIndex, isPlaying]);

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

  const handleRestorePlayer = () => {
    if (playerAnchorRef.current) {
      playerAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setIsFloating(false);
  };

  const handleBackToCatalog = () => {
    // Save watch time if playing
    if (playerRef.current) {
      saveWatchTime(playerRef.current);
    } else if (nativePlayerRef.current) {
      saveWatchTime(nativePlayerRef.current);
      nativePlayerRef.current = null;
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
    setIsPlaying(false);
    setIsFloating(false);
    setTheaterMode(false);
    setPhotosStreamUrl('');
    setPhotosQualities(null);
    setSelectedQuality('720p');
    initializedUrlRef.current = ''; // Clear player initialized state
    
    // Refresh catalog list to update watch progress
    fetchMovies();
  };

  const handleBackToDetails = () => {
    // Save watch time if playing
    if (playerRef.current) {
      saveWatchTime(playerRef.current);
    } else if (nativePlayerRef.current) {
      saveWatchTime(nativePlayerRef.current);
      nativePlayerRef.current = null;
    }
    
    // Reset player
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {}
      playerRef.current = null;
    }
    
    setIsPlaying(false);
    setIsFloating(false);
    setTheaterMode(false);
    setPhotosStreamUrl('');
    setPhotosQualities(null);
    setSelectedQuality('720p');
    initializedUrlRef.current = ''; // Clear player initialized state
  };

  // Helper to check cover background
  const getCoverBgInfo = (url) => {
    if (!url) return { isYt: false, isImg: false, ytId: '' };
    const trimmed = url.trim();
    const ytId = extractYoutubeId(trimmed);
    if (ytId) {
      return { isYt: true, isImg: false, ytId };
    }
    return { isYt: false, isImg: true, ytId: '' };
  };

  // Filter & Sort Logic
  const genres = [...new Set(
    movies.flatMap(m => m.genre ? m.genre.split(',').map(g => g.trim()) : [])
  )].filter(Boolean).sort();
  
  const countries = [...new Set(movies.map(m => m.country).filter(Boolean))];
  const years = [...new Set(movies.map(m => m.publishYear).filter(Boolean))].sort((a, b) => b - a);

  const filteredMovies = movies
    .filter(m => {
      const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                          (m.tags || '').toLowerCase().includes(search.toLowerCase());
      const matchGenre = !selectedGenre || (m.genre && m.genre.split(',').map(g => g.trim()).includes(selectedGenre));
      const matchCountry = !selectedCountry || m.country === selectedCountry;
      const matchYear = !selectedYear || String(m.publishYear) === String(selectedYear);
      return matchSearch && matchGenre && matchCountry && matchYear;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return b.id - a.id;
      } else if (sortBy === 'az') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'popular') {
        return b.episodesCount - a.episodesCount;
      } else if (sortBy === 'year-desc') {
        if (!a.publishYear) return 1;
        if (!b.publishYear) return -1;
        return b.publishYear - a.publishYear;
      } else if (sortBy === 'year-asc') {
        if (!a.publishYear) return 1;
        if (!b.publishYear) return -1;
        return a.publishYear - b.publishYear;
      }
      return 0;
    });

  const watchedMovies = movies
    .filter(m => m.watchProgress)
    .sort((a, b) => new Date(b.watchProgress.lastWatchedAt) - new Date(a.watchProgress.lastWatchedAt));

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

  const activePart = movieDetail?.parts?.[activePartIndex];
  const activeEpisode = activePart?.episodes?.[activeEpisodeIndex];
  const activeUrl = activeEpisode?.url || '';
  const isDriveVideo = !!extractDriveId(activeUrl);
  const isPhotosVideo = activeUrl && /photos\.app\.goo\.gl|photos\.google\.com/i.test(activeUrl);

  const hasWatchProgress = movieDetail?.watchLogs && movieDetail.watchLogs.length > 0 && movieDetail.watchLogs.some(log => log.watchedSeconds > 0);
  const coverBgInfo = movieDetail ? getCoverBgInfo(movieDetail.coverBackground) : { isYt: false, isImg: false, ytId: '' };

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

            {/* Watched Movies / Continue Watching */}
            {watchedMovies.length > 0 && (
              <section className={styles.watchedSection}>
                <h2 className={styles.watchedSectionTitle}>⏱️ PHIM ĐÃ XEM / ĐANG XEM DỞ</h2>
                <div className={styles.watchedGrid}>
                  {watchedMovies.map(movie => {
                    const progress = movie.watchProgress;
                    return (
                      <div
                        key={movie.id}
                        className={styles.watchedCard}
                        onClick={() => handleSelectMovie(movie)}
                      >
                        <div className={styles.watchedCoverContainer}>
                          {movie.coverUrl ? (
                            <img
                              src={movie.coverUrl && movie.coverUrl.startsWith('data:') ? movie.coverUrl : `${import.meta.env.VITE_API_URL || ''}${movie.coverUrl}`}
                              alt={movie.title}
                              className={styles.watchedCoverImg}
                            />
                          ) : (
                            <div className={styles.placeholderCover}>🎬</div>
                          )}
                          <div className={styles.watchedProgressOverlay}>
                            <span>Đã xem: {formatTimeLabel(progress.totalWatchedSeconds)}</span>
                          </div>
                        </div>
                        <div className={styles.watchedInfo}>
                          <h4 className={styles.watchedTitle}>{movie.title}</h4>
                          <span className={styles.watchedSub}>
                            {progress.lastWatchedEpisodeTitle ? `Đang xem: ${progress.lastWatchedEpisodeTitle}` : `Đang xem: Tập ${progress.lastWatchedEpisodeIndex + 1}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

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
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
              >
                <option value="">-- Tất cả Năm --</option>
                {years.map((y, idx) => (
                  <option key={idx} value={y}>{y}</option>
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
                <option value="year-desc">Năm sản xuất (Mới nhất)</option>
                <option value="year-asc">Năm sản xuất (Cũ nhất)</option>
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
                          src={movie.coverUrl && movie.coverUrl.startsWith('data:') ? movie.coverUrl : `${import.meta.env.VITE_API_URL || ''}${movie.coverUrl}`}
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
                        {movie.publishYear && <span className={styles.badge}>{movie.publishYear}</span>}
                        {movie.genre && movie.genre.split(',').map(g => g.trim()).filter(Boolean).map((g, idx) => (
                          <span key={idx} className={styles.badge}>{g}</span>
                        ))}
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

        {/* DETAIL & PLAYER VIEW */}
        {selectedMovie && (
          <>
            <header className={styles.header}>
              <button 
                className={styles.backBtn} 
                onClick={isPlaying ? handleBackToDetails : handleBackToCatalog}
              >
                {isPlaying ? '← Quay lại thông tin phim' : '← Quay lại danh sách phim'}
              </button>
            </header>

            {detailLoading || !movieDetail ? (
              <div className={styles.loadingCenter}>
                <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
              </div>
            ) : isPlaying ? (
              /* --- VIDEO PLAYER LAYOUT --- */
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
                      
                      <div 
                        ref={ytPlayerContainerRef} 
                        className={styles.playerIframe}
                        style={{ display: isPhotosVideo ? 'none' : 'block' }}
                      ></div>
                      
                      {isPhotosVideo && (
                        <div 
                          className={styles.photosPlaceholder}
                          style={{ background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                          {photosLoading ? (
                            <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
                          ) : photosError ? (
                            <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>
                              {photosError}
                            </div>
                          ) : photosStreamUrl ? (
                            <video
                              key={photosStreamUrl} // Buộc load lại element để seek thời gian chính xác khi chuyển chất lượng
                              ref={el => {
                                  nativePlayerRef.current = el;
                                  if (el && resumeSecsRef.current > 0) {
                                    el.onloadedmetadata = () => {
                                      if (resumeSecsRef.current > 0) {
                                        el.currentTime = resumeSecsRef.current;
                                        resumeSecsRef.current = 0;
                                      }
                                    };
                                  }
                                }}
                              src={`https://app-video-proxy.ngocbinhdt1999.workers.dev/?url=${encodeURIComponent(photosStreamUrl)}`}
                              onError={handlePhotosStreamError}
                              controls
                              autoPlay
                              playsInline
                              className={styles.nativeVideoPlayer}
                              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000', borderRadius: '12px' }}
                            />
                          ) : (
                            <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
                          )}
                        </div>
                      )}
                      
                      {/* Transparent overlays to block accidental redirects to YouTube on mobile */}
                      {!isFloating && !isPhotosVideo && (
                        <>
                          <div className={styles.topRedirectBlocker}></div>
                          <div className={styles.logoRedirectBlocker}></div>
                        </>
                      )}

                      {/* Full-size overlay for floating mode to capture clicks and prevent mobile redirects */}
                      {isFloating && (
                        <div 
                          className={styles.floatingOverlay} 
                          onClick={handleRestorePlayer}
                        >
                          <div className={styles.floatingControls}>
                            <button 
                              className={styles.floatingBtn} 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestorePlayer();
                              }}
                            >
                              🔍 Phóng to
                            </button>
                            <button 
                              className={styles.floatingBtn} 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBackToCatalog();
                              }}
                            >
                              ❌ Đóng
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.playerControls}>
                    <button
                      className={styles.theaterBtn}
                      onClick={() => setTheaterMode(!theaterMode)}
                    >
                      {theaterMode ? '📺 Chế độ thường' : '🖥️ Chế độ rạp chiếu'}
                    </button>
                    {isPhotosVideo && photosQualities && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>Chất lượng:</span>
                        <select
                          value={selectedQuality}
                          onChange={(e) => handleQualityChange(e.target.value)}
                          className={styles.selectBox}
                          style={{ padding: '6px 12px', fontSize: '0.85rem', height: 'auto', background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '6px' }}
                        >
                          {['1080p', '720p', '360p'].map((q) => {
                            const spec = photosQualities[q];
                            const available = spec && spec.available;
                            return (
                              <option key={q} value={q} disabled={!available}>
                                {q} {!available ? ' (Chưa cập nhật)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                    {isDriveVideo && (
                      <a
                        href={activeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.driveOpenBtn}
                      >
                        🚀 Mở bằng Google Drive (Xem mượt hơn)
                      </a>
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

                {/* Movie Details Metadata */}
                <div className={styles.movieMetaDetails}>
                  <h1 className={styles.movieTitleLarge}>{movieDetail.title}</h1>
                  <div className={styles.movieMeta}>
                    {movieDetail.publishYear && <span className={styles.badge}>{movieDetail.publishYear}</span>}
                    {movieDetail.genre && movieDetail.genre.split(',').map(g => g.trim()).filter(Boolean).map((g, idx) => (
                      <span key={idx} className={styles.badge}>{g}</span>
                    ))}
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
            ) : (
              /* --- INFO / DETAILS LAYOUT --- */
              <div className={styles.detailsContainer}>
                {/* Behind Cover Background */}
                <div className={styles.coverBgContainer}>
                  {coverBgInfo.isYt ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${coverBgInfo.ytId}?autoplay=1&mute=1&loop=1&playlist=${coverBgInfo.ytId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1`}
                      className={styles.coverBgYt}
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : coverBgInfo.isImg ? (
                    <img src={movieDetail.coverBackground} className={styles.coverBgImg} alt="Cover Background" />
                  ) : (
                    <div className={styles.coverBgDefault} />
                  )}
                  <div className={styles.coverBgOverlay} />
                </div>

                {/* Details Content Card sitting on top of cover background */}
                <div className={styles.detailsContentCard}>
                  <div className={styles.detailsContentMain}>
                    <div className={styles.detailsPoster}>
                      {movieDetail.coverUrl ? (
                        <img
                          src={movieDetail.coverUrl.startsWith('data:') ? movieDetail.coverUrl : `${import.meta.env.VITE_API_URL || ''}${movieDetail.coverUrl}`}
                          alt={movieDetail.title}
                          className={styles.detailsPosterImg}
                        />
                      ) : (
                        <div className={styles.detailsPosterPlaceholder}>🎬</div>
                      )}
                    </div>

                    <div className={styles.detailsInfo}>
                      <div className={styles.detailsHeader}>
                        <h1 className={styles.detailsTitle}>{movieDetail.title}</h1>
                        {movieDetail.publishYear && (
                          <span className={styles.detailsYear}>({movieDetail.publishYear})</span>
                        )}
                      </div>

                      <div className={styles.detailsMeta}>
                        {movieDetail.genre && movieDetail.genre.split(',').map(g => g.trim()).filter(Boolean).map((g, idx) => (
                          <span key={idx} className={styles.detailsGenreBadge}>{g}</span>
                        ))}
                        {movieDetail.country && <span className={styles.detailsCountryBadge}>{movieDetail.country}</span>}
                      </div>

                      <div className={styles.detailsTags}>
                        {movieDetail.tags && movieDetail.tags.split(',').map(t => t.trim()).filter(Boolean).map((t, idx) => (
                          <span key={idx} className={styles.detailsTag}>#{t}</span>
                        ))}
                      </div>

                      <div className={styles.detailsPlayAction}>
                        <button 
                          className={styles.playButtonMain}
                          onClick={() => setIsPlaying(true)}
                        >
                          {hasWatchProgress ? '▶ XEM TIẾP' : '▶ XEM PHIM'}
                        </button>
                        
                        {hasWatchProgress && (
                          <div className={styles.detailsProgressInfo}>
                            <span>Lịch sử xem dở: <strong>{movieDetail.watchLogs[0] ? (movieDetail.parts[movieDetail.watchLogs[0].partIndex]?.episodes[movieDetail.watchLogs[0].episodeIndex]?.title || `Tập ${movieDetail.watchLogs[0].episodeIndex + 1}`) : ''}</strong></span>
                            <span>Dừng ở: {formatTimeLabel(movieDetail.watchLogs[0]?.lastPositionSeconds || 0)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {movieDetail.description && (
                    <div className={styles.detailsDescriptionSection}>
                      <h3>Mô tả phim</h3>
                      <p>{movieDetail.description}</p>
                    </div>
                  )}

                  {/* Episodes Browser */}
                  <div className={styles.detailsEpisodesSection}>
                    <h3>Danh sách tập phim</h3>
                    
                    {movieDetail.parts && movieDetail.parts.length > 1 && (
                      <div className={styles.detailsPartSelector}>
                        {movieDetail.parts.map((part, pIdx) => (
                          <button
                            key={pIdx}
                            className={`${styles.detailsPartTab} ${activePartIndex === pIdx ? styles.detailsPartTabActive : ''}`}
                            onClick={() => setActivePartIndex(pIdx)}
                          >
                            {part.title || `Phần ${pIdx + 1}`}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className={styles.detailsEpisodesGrid}>
                      {movieDetail.parts && movieDetail.parts[activePartIndex] && movieDetail.parts[activePartIndex].episodes.map((ep, eIdx) => {
                        const watchLog = getWatchLog(activePartIndex, eIdx);
                        const isLastWatched = movieDetail.watchLogs?.[0] && movieDetail.watchLogs[0].partIndex === activePartIndex && movieDetail.watchLogs[0].episodeIndex === eIdx;
                        
                        return (
                          <div
                            key={eIdx}
                            className={`${styles.detailsEpisodeCard} ${isLastWatched ? styles.detailsEpisodeCardLast : ''}`}
                            onClick={() => {
                              handleSelectEpisode(activePartIndex, eIdx);
                              setIsPlaying(true);
                            }}
                          >
                            <div className={styles.detailsEpHeader}>
                              <span className={styles.detailsEpTitle}>{ep.title}</span>
                              {isLastWatched && <span className={styles.lastWatchedBadge}>Đang xem dở</span>}
                            </div>
                            {watchLog && watchLog.watchedSeconds > 0 && (
                              <div className={styles.detailsEpProgress}>
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
