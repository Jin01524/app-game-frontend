import React from 'react';
import { EnergyBar, BackpackHotbar, SelectedItemActions } from './GameHud';
import coinIcon from '../../assets/coin-tl4.2.png';

import eatIcon from '../../assets/eat-icon.png';
import drinkIcon from '../../assets/drink.png';

export default function UnifiedHUD({
  pageTitle,
  pageSubtitle,
  onExit,
  xu = 0,
  energy = 6,
  backpack = [],
  selectedSlotIdx = null,
  onSelectSlot,
  
  // Movement
  showMovement = true,
  keysRef, // ref to store { left, right, jump } for mobile touch controls

  // Hotbar
  showHotbar = true,

  // Selection & Item Use
  selectedItem = null,
  canConsume = false,
  isDrinkable = false,
  onConsume,
  onDiscard,
  actionLoading = false,
  eatCooldown = false,

  // Contextual Interaction
  showInteraction = false,
  interactionIcon = null,
  onInteract,
  interactionActive = false,

  // Custom Extra Header elements (e.g. Storage/Kho button in Farm)
  extraHeaderElements = null
}) {
  return (
    <>
      {/* Top Header Controls */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', fontFamily: 'var(--font-pixel)', color: 'white', textShadow: '2px 2px 0 #000', pointerEvents: 'none', zIndex: 10 }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--px-amber)' }}>{pageTitle}</h2>
        {pageSubtitle && <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem' }}>{pageSubtitle}</p>}
      </div>

      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '8px', zIndex: 10, alignItems: 'center' }}>
        {extraHeaderElements}
        
        {/* Coin Display */}
        <div className="pixel-btn" style={{ height: '44px', padding: '0 16px', background: 'white', border: '4px solid #f59e0b', borderRadius: '0', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default', fontFamily: 'var(--font-pixel)', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', color: '#d97706', fontWeight: 'bold' }}>
          <img src={coinIcon} alt="Xu" style={{ width: '20px', height: '20px', imageRendering: 'pixelated' }} />
          <span>{xu.toLocaleString('vi-VN')} Xu</span>
        </div>

        {/* Energy Bar */}
        <EnergyBar energy={energy} style={{ position: 'static' }} />

        {/* Exit Button */}
        {onExit && (
          <button 
            onClick={onExit}
            className="pixel-btn"
            style={{ padding: '10px 16px', fontSize: '1rem', background: '#dc2626', color: 'white', border: '4px solid var(--px-border)' }}>
            [ THOÁT ]
          </button>
        )}
      </div>

      {/* Bottom Controls / Hotbar / Interactions */}
      {showMovement && (
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', gap: '16px', zIndex: 10 }}>
          <button 
            onPointerDown={(e) => { e.preventDefault(); if (keysRef) keysRef.current.left = true; }}
            onPointerUp={(e) => { e.preventDefault(); if (keysRef) keysRef.current.left = false; }}
            onPointerLeave={() => { if (keysRef) keysRef.current.left = false; }}
            onContextMenu={(e) => e.preventDefault()}
            className="pixel-btn" 
            style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: 'rgba(0,0,0,0.5)', border: '4px solid var(--px-border)', color: 'white', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
            ◄
          </button>
          <button 
            onPointerDown={(e) => { e.preventDefault(); if (keysRef) keysRef.current.right = true; }}
            onPointerUp={(e) => { e.preventDefault(); if (keysRef) keysRef.current.right = false; }}
            onPointerLeave={() => { if (keysRef) keysRef.current.right = false; }}
            onContextMenu={(e) => e.preventDefault()}
            className="pixel-btn" 
            style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: 'rgba(0,0,0,0.5)', border: '4px solid var(--px-border)', color: 'white', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
            ►
          </button>
        </div>
      )}

      {/* Hotbar (Backpack Slots) */}
      {showHotbar && (
        <BackpackHotbar
          backpack={backpack}
          selectedSlotIdx={selectedSlotIdx}
          onSelectSlot={onSelectSlot}
          onLongPressSlot={onDiscard}
        />
      )}

      {/* Right Side Interactions / Actions */}
      {showMovement && (
        <button 
          onPointerDown={(e) => { e.preventDefault(); if (keysRef) keysRef.current.jump = true; }}
          onPointerUp={(e) => { e.preventDefault(); if (keysRef) keysRef.current.jump = false; }}
          onPointerLeave={() => { if (keysRef) keysRef.current.jump = false; }}
          onContextMenu={(e) => e.preventDefault()}
          className="pixel-btn" 
          style={{ 
            position: 'absolute',
            bottom: '104px', 
            right: '24px', 
            width: '60px', 
            height: '60px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '1.2rem', 
            background: 'rgba(0,0,0,0.5)', 
            border: '4px solid var(--px-border)', 
            color: 'white', 
            touchAction: 'none', 
            userSelect: 'none', 
            WebkitUserSelect: 'none', 
            WebkitTouchCallout: 'none',
            zIndex: 20 
          }}>
          ▲
        </button>
      )}

      {/* Main Interaction Button or Eat/Drink Button */}
      {((selectedItem && canConsume) || showInteraction) && (
        <button 
          onPointerDown={(e) => {
            e.preventDefault();
            if (selectedItem && canConsume) {
              if (!actionLoading && !eatCooldown) {
                onConsume();
              }
            } else {
              onInteract();
            }
          }}
          disabled={(selectedItem && canConsume) ? actionLoading || eatCooldown : false}
          className="pixel-btn"
          style={{ 
            position: 'absolute',
            bottom: '20px', 
            right: '20px',
            width: '68px', 
            height: '68px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: (selectedItem && canConsume) ? '#16a34a' : 'rgb(59, 130, 246)', 
            border: (selectedItem && canConsume) ? '4px solid #15803d' : '4px solid #1e3a8a', 
            padding: '0',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            animation: (!(selectedItem && canConsume) && interactionActive) ? 'pulse 1s infinite' : 'none',
            cursor: ((selectedItem && canConsume) && (actionLoading || eatCooldown)) ? 'default' : 'pointer',
            overflow: 'hidden',
            zIndex: 20
          }}>
          {(selectedItem && canConsume) ? (
            <>
              <img src={isDrinkable ? drinkIcon : eatIcon} alt={isDrinkable ? 'Uống' : 'Ăn'} style={{ width: '36px', height: '36px', imageRendering: 'pixelated' }} />
              {eatCooldown && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    animation: 'cooldown-swipe 0.2s linear forwards'
                  }}
                />
              )}
            </>
          ) : typeof interactionIcon === 'string' ? (
            <img src={interactionIcon} alt="Tương Tác" style={{ width: '36px', height: '36px', imageRendering: 'pixelated' }} />
          ) : (
            interactionIcon
          )}
        </button>
      )}
    </>
  );
}
