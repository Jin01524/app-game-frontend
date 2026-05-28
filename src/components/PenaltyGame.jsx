import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './PenaltyGame.module.css';

export default function PenaltyGame({ onGoal, onMiss, xu, previewSettings }) {
  const { authFetch } = useAuth();
  
  const [settings, setSettings] = useState({
    gkBaseSpeed: 1.2,
    goalWidth: 80,
    aimSpeed: 2.0
  });

  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState('BẤM SÚT ĐỂ BẮT ĐẦU');
  const [status, setStatus] = useState('idle'); // idle, shooting, result
  
  const gkXRef = useRef(50);
  const gkDirRef = useRef(1);
  const aimAngleRef = useRef(0);
  const aimDirRef = useRef(1);
  const ballYRef = useRef(0);
  const ballXRef = useRef(50);
  const statusRef = useRef('idle');
  const streakRef = useRef(0);
  
  const [renderGkX, setRenderGkX] = useState(50);
  const [renderBallY, setRenderBallY] = useState(0);
  const [renderBallX, setRenderBallX] = useState(50);
  const [renderAim, setRenderAim] = useState(0);
  const requestRef = useRef();

  // Load settings
  useEffect(() => {
    if (previewSettings) {
      setSettings(previewSettings);
    } else {
      authFetch('/api/profile/game/settings')
        .then(res => res.json())
        .then(data => {
          setSettings({
            gkBaseSpeed: Number(data.gkBaseSpeed) || 1.2,
            goalWidth: Number(data.goalWidth) || 80,
            aimSpeed: Number(data.aimSpeed) || 2.0
          });
        })
        .catch(console.error);
    }
  }, [previewSettings, authFetch]);

  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);

  const update = () => {
    // 1. Update Goalkeeper (Pause if game is in result state)
    if (statusRef.current !== 'result') {
      const gkSpeed = settings.gkBaseSpeed + (streakRef.current * 0.4);
      gkXRef.current += gkDirRef.current * gkSpeed;
      if (gkXRef.current >= 85) { gkXRef.current = 85; gkDirRef.current = -1; }
      if (gkXRef.current <= 15) { gkXRef.current = 15; gkDirRef.current = 1; }
    }
    
    // 2. Update Aim (if idle)
    if (statusRef.current === 'idle') {
      aimAngleRef.current += aimDirRef.current * settings.aimSpeed;
      if (aimAngleRef.current >= 60) { aimAngleRef.current = 60; aimDirRef.current = -1; }
      if (aimAngleRef.current <= -60) { aimAngleRef.current = -60; aimDirRef.current = 1; }
    }
    
    // 3. Update Ball
    if (statusRef.current === 'shooting') {
      ballYRef.current += 4;
      ballXRef.current += (aimAngleRef.current / 45) * 2;
      
      if (ballYRef.current >= 75) {
        statusRef.current = 'result';
        setStatus('result');
        
        const finalX = ballXRef.current;
        const gkDiff = Math.abs(gkXRef.current - finalX);
        const goalLeft = 50 - (settings.goalWidth / 2);
        const goalRight = 50 + (settings.goalWidth / 2);
        
        if (finalX < goalLeft || finalX > goalRight) {
          setStreak(0);
          setMessage('SÚT RA NGOÀI! STREAK = 0');
          if (onMiss) onMiss();
        } else if (gkDiff <= 8) {
          setStreak(0);
          setMessage('THỦ MÔN CẢN PHÁ! STREAK = 0');
          if (onMiss) onMiss();
        } else {
          const xuEarned = (streakRef.current + 1) * 2;
          setStreak(s => s + 1);
          setMessage(`VÀO LƯỚI!!! +${xuEarned} XU`);
          if (onGoal) onGoal(xuEarned);
        }
        
        setTimeout(() => {
          ballYRef.current = 0;
          ballXRef.current = 50;
          statusRef.current = 'idle';
          setStatus('idle');
          setMessage('BẤM SÚT ĐỂ BẮT ĐẦU');
        }, 1500);
      }
    }
    
    setRenderGkX(gkXRef.current);
    setRenderBallY(ballYRef.current);
    setRenderBallX(ballXRef.current);
    setRenderAim(aimAngleRef.current);
    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [settings]);

  const handleShoot = () => {
    if (statusRef.current !== 'idle') return;
    statusRef.current = 'shooting';
    setStatus('shooting');
    setMessage('ĐANG SÚT...');
  };

  const goalLeft = 50 - (settings.goalWidth / 2);
  const goalRight = 50 + (settings.goalWidth / 2);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>STREAK</span>
          <span className={styles.statValue}>{streak}</span>
        </div>
      </div>

      <div className={styles.field}>
        {/* Goal */}
        <div className={styles.goalLine} style={{ left: `${goalLeft}%`, right: `${100 - goalRight}%` }}></div>
        <div className={styles.goalPostLeft} style={{ left: `${goalLeft}%` }}></div>
        <div className={styles.goalPostRight} style={{ right: `${100 - goalRight}%` }}></div>

        {/* Goalkeeper */}
        <div className={styles.goalkeeper} style={{ left: `${renderGkX}%` }}>
          <div className={styles.gkHead}></div>
          <div className={styles.gkBody}></div>
        </div>

        {/* Aim Arrow */}
        {status === 'idle' && (
          <div 
            className={styles.aimArrow} 
            style={{ transform: `translateX(-50%) rotate(${renderAim}deg)` }}
          ></div>
        )}

        {/* Ball */}
        <div 
          className={styles.ball}
          style={{ bottom: `${renderBallY}%`, left: `${renderBallX}%` }}
        >
          ⚽
        </div>
      </div>

      <div className={styles.controls}>
        <div className={`${styles.message} ${status === 'result' && streak > 0 ? styles.msgSuccess : ''} ${status === 'result' && streak === 0 ? styles.msgError : ''}`}>
          {message}
        </div>
        <button 
          className={`btn btn-danger ${styles.shootBtn}`}
          onClick={handleShoot}
          disabled={status !== 'idle'}
        >
          [ SÚT BÓNG ]
        </button>
      </div>
    </div>
  );
}
