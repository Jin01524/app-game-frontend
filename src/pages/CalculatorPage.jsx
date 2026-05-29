import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelCanvas from '../components/PixelCanvas';
import BottomNav from '../components/BottomNav';
import styles from './CalculatorPage.module.css';

export default function CalculatorPage() {
  const navigate = useNavigate();
  const [display, setDisplay] = useState('0');
  const [formula, setFormula] = useState('');
  const [resetOnNext, setResetOnNext] = useState(false);

  const handlePress = (label) => {
    if (label === 'C') {
      setDisplay('0');
      setFormula('');
      setResetOnNext(false);
    } else if (label === 'DEL') {
      if (resetOnNext) {
        setDisplay('0');
        setResetOnNext(false);
      } else {
        setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
      }
    } else if (['+', '-', '*', '/'].includes(label)) {
      setFormula(`${display} ${label} `);
      setResetOnNext(true);
    } else if (label === '.') {
      if (resetOnNext) {
        setDisplay('0.');
        setResetOnNext(false);
      } else if (!display.includes('.')) {
        setDisplay(prev => prev + '.');
      }
    } else if (label === '=') {
      if (formula && formula.includes(' ') && !formula.includes('=')) {
        const parts = formula.trim().split(' ');
        const op1 = parseFloat(parts[0]);
        const op = parts[1];
        const op2 = parseFloat(display);
        
        let res = 0;
        switch (op) {
          case '+': res = op1 + op2; break;
          case '-': res = op1 - op2; break;
          case '*': res = op1 * op2; break;
          case '/': res = op2 !== 0 ? op1 / op2 : 'Error'; break;
          default: res = op2;
        }
        
        // Format result to avoid very long decimals (like 0.1 + 0.2 precision bugs)
        if (typeof res === 'number') {
          res = parseFloat(res.toFixed(8));
        }
        
        setDisplay(res.toString());
        setFormula(`${formula}${display} =`);
        setResetOnNext(true);
      }
    } else {
      // Digit keys
      if (display === '0' || resetOnNext) {
        setDisplay(label);
        setResetOnNext(false);
      } else {
        setDisplay(prev => prev + label);
      }
    }
  };

  const keys = [
    { label: 'C',   style: { background: '#ef4444', color: '#fff' } },
    { label: 'DEL', style: { background: '#f97316', color: '#fff' } },
    { label: '/',   style: { background: '#3b82f6', color: '#fff' } },
    { label: '*',   style: { background: '#3b82f6', color: '#fff' } },
    
    { label: '7' }, { label: '8' }, { label: '9' },
    { label: '-',   style: { background: '#3b82f6', color: '#fff' } },
    
    { label: '4' }, { label: '5' }, { label: '6' },
    { label: '+',   style: { background: '#3b82f6', color: '#fff' } },
    
    { label: '1' }, { label: '2' }, { label: '3' },
    { label: '=',   style: { background: '#10b981', color: '#fff', gridRow: 'span 2', height: '100%' } },
    
    { label: '0',   style: { gridColumn: 'span 2' } },
    { label: '.' }
  ];

  return (
    <div className={styles.page}>
      <PixelCanvas />
      
      <main className={styles.main}>
        {/* Header */}
        <header className={`${styles.header} rpg-box fade-in`}>
          <div className="px-titlebar">
            <span>◄ MÁY TÍNH RETRO ►</span>
          </div>
        </header>

        {/* Calculator Body Card */}
        <div className={`${styles.calcCard} rpg-box fade-in fade-in-delay-1`}>
          {/* LCD Screen */}
          <div className={styles.screen}>
            <div className={styles.formula}>{formula}</div>
            <div className={styles.value}>{display}</div>
          </div>

          {/* Grid Layout of Keys */}
          <div className={styles.grid}>
            {keys.map((k, idx) => (
              <button
                key={idx}
                className={styles.key}
                style={k.style}
                onClick={() => handlePress(k.label)}
              >
                {k.label}
              </button>
            ))}
          </div>

          {/* Back Button */}
          <button 
            className="btn btn-outline" 
            style={{ marginTop: '12px' }}
            onClick={() => navigate('/utilities')}
          >
            [ QUAY LẠI TIỆN ÍCH ]
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
