import React, { useState, useRef } from 'react';
import { ITEM_ASSETS } from './BackpackModal';
import bagIcon from '../../assets/bag.png';

export const MAX_ENERGY = 6;
export const MOVEMENT_DRAIN_SECONDS = 8;

const itemImageCache = {};

export function getItemIcon(itemId) {
  return ITEM_ASSETS[itemId]?.icon || bagIcon;
}

export function getItemName(itemId) {
  return ITEM_ASSETS[itemId]?.name || itemId || 'Vật phẩm';
}

export function getLoadedItemImage(itemId) {
  if (!itemId || typeof Image === 'undefined') return null;
  if (itemImageCache[itemId]) return itemImageCache[itemId];

  const iconPath = getItemIcon(itemId);
  if (!iconPath) return null;

  const img = new Image();
  img.src = iconPath;
  itemImageCache[itemId] = img;
  return img;
}

export function drawMovementDrainBar(ctx, x, y, height, progressSeconds) {
  if (!ctx || progressSeconds <= 0) return;

  const barWidth = 4;
  const barHeight = 20;
  const bx = x - 8;
  const by = y + height / 2 - barHeight / 2;

  ctx.fillStyle = 'black';
  ctx.fillRect(bx - 1, by - 1, barWidth + 2, barHeight + 2);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(bx, by, barWidth, barHeight);
  ctx.fillStyle = '#facc15';

  const progressHeight = Math.min(
    barHeight,
    (progressSeconds / MOVEMENT_DRAIN_SECONDS) * barHeight
  );
  ctx.fillRect(bx, by + barHeight - progressHeight, barWidth, progressHeight);
}

export function drawHeldItem(ctx, itemId, time, offsetX = 20, offsetY = 28) {
  const itemImg = getLoadedItemImage(itemId);
  if (!ctx || !itemImg || !itemImg.complete || itemImg.width <= 0) return;

  let itemW = 25;
  let itemH = 25;
  if (itemImg.width > itemImg.height) {
    itemH = (itemImg.height / itemImg.width) * 25;
  } else if (itemImg.height > itemImg.width) {
    itemW = (itemImg.width / itemImg.height) * 25;
  }

  const heldBounce = Math.sin(time / 150) * 1.5;
  ctx.drawImage(
    itemImg,
    offsetX - itemW / 2,
    offsetY - itemH / 2 + heldBounce,
    itemW,
    itemH
  );
}

export function EnergyBar({ energy, style }) {
  const value = Math.max(0, Math.min(MAX_ENERGY, energy ?? MAX_ENERGY));

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        padding: '6px 12px',
        background: 'white',
        border: '4px solid #3b82f6',
        borderRadius: '0',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 10,
        fontFamily: 'var(--font-pixel)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        ...style
      }}
    >
      <span style={{ color: '#eab308', fontSize: '16px', fontWeight: 'bold' }}>⚡</span>
      <div style={{ display: 'flex', gap: '3px', background: '#334155', padding: '3px', border: '2px solid #1e293b' }}>
        {Array.from({ length: MAX_ENERGY }).map((_, idx) => (
          <div
            key={idx}
            style={{
              width: '12px',
              height: '16px',
              background: value > idx ? '#22c55e' : '#475569',
              transition: 'background 0.2s'
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e293b' }}>
        {value}/{MAX_ENERGY}
      </span>
    </div>
  );
}

export function BackpackHotbar({ backpack, selectedSlotIdx, onSelectSlot, onLongPressSlot, zIndex = 10 }) {
  const bp = Array.isArray(backpack) ? backpack : [];
  const slots = Array.from({ length: 4 }).map((_, i) => bp[i] || null);

  const [holdingIdx, setHoldingIdx] = useState(null);
  const holdTimerRef = useRef(null);

  const handlePointerDown = (i, hasItem) => {
    if (!hasItem) return;
    setHoldingIdx(i);
    holdTimerRef.current = setTimeout(() => {
      setHoldingIdx(null);
      holdTimerRef.current = null;
      if (onLongPressSlot) {
        onLongPressSlot(i);
      }
    }, 1000);
  };

  const handlePointerUpOrLeave = (i, hasItem, isSelected, isLeave = false) => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdingIdx === i) {
      setHoldingIdx(null);
      if (!isLeave) {
        onSelectSlot(hasItem ? (isSelected ? null : i) : null);
      }
    }
  };

  return (
    <>
      <style>{`
        @keyframes hold-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '12px',
          zIndex
        }}
      >
        {slots.map((slot, i) => {
          const isSelected = selectedSlotIdx === i;
          const hasItem = slot && slot.quantity > 0;
          const isHoldingThis = holdingIdx === i;

          return (
            <div
              key={i}
              onPointerDown={() => handlePointerDown(i, hasItem)}
              onPointerUp={() => handlePointerUpOrLeave(i, hasItem, isSelected)}
              onPointerLeave={() => handlePointerUpOrLeave(i, hasItem, isSelected, true)}
              style={{
                width: '60px',
                height: '60px',
                background: '#e2e8f0',
                border: isSelected ? '4px solid #3b82f6' : '4px solid #94a3b8',
                boxShadow: isSelected ? '0 0 10px rgba(59, 130, 246, 0.8)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: hasItem ? 'pointer' : 'default',
                transition: 'all 0.1s',
                overflow: 'hidden',
                userSelect: 'none',
                touchAction: 'none'
              }}
            >
              {isHoldingThis && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(239, 68, 68, 0.3)',
                    zIndex: 2,
                    pointerEvents: 'none'
                  }}
                >
                  <div
                    style={{
                      height: '4px',
                      background: '#ef4444',
                      width: '100%',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      animation: 'hold-progress 1s linear forwards'
                    }}
                  />
                </div>
              )}
              {hasItem ? (
                <>
                  <img
                    src={getItemIcon(slot.item_id)}
                    alt={slot.item_id}
                    style={{ width: '36px', height: '36px', objectFit: 'contain', imageRendering: 'pixelated' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: '#1e293b',
                      textShadow: '1px 1px 0 #fff'
                    }}
                  >
                    {slot.quantity}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: '10px', color: '#cbd5e1', fontFamily: 'var(--font-pixel)' }}>
                  Trống
                </span>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export function SelectedItemActions({
  item,
  canConsume,
  isDrinkable,
  onConsume,
  onDiscard,
  disabled,
  cooldown
}) {
  if (!item || item.quantity <= 0) return null;

  return (
    <>
      <style>{`
        @keyframes cooldown-swipe {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      <div style={{ display: 'flex', gap: '8px' }}>
        {canConsume && (
          <button
            onClick={onConsume}
            disabled={disabled || cooldown}
            className="pixel-btn"
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '10px 16px',
              background: '#16a34a',
              color: 'white',
              border: '4px solid var(--px-border)',
              fontSize: '11px',
              fontFamily: 'var(--font-pixel)',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              cursor: disabled || cooldown ? 'default' : 'pointer'
            }}
          >
            {isDrinkable ? 'UỐNG' : 'ĂN'}
            {cooldown && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.4)',
                  animation: 'cooldown-swipe 0.2s linear forwards'
                }}
              />
            )}
          </button>
        )}
        <button
          onClick={onDiscard}
          className="pixel-btn"
          style={{
            padding: '10px 16px',
            background: '#dc2626',
            color: 'white',
            border: '4px solid var(--px-border)',
            fontSize: '11px',
            fontFamily: 'var(--font-pixel)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            cursor: 'pointer'
          }}
        >
          VỨT
        </button>
      </div>
    </>
  );
}

export function DiscardItemPrompt({
  itemId,
  maxQty,
  value,
  onChange,
  onConfirm,
  onCancel,
  loading
}) {
  if (!itemId) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
      <div className="rpg-box fade-in" style={{ background: '#fffbeb', border: '4px solid var(--px-border)', padding: '20px', width: '300px', textAlign: 'center', color: '#000' }}>
        <h3 style={{ fontSize: '12px', marginBottom: '12px', fontWeight: 'bold', fontFamily: 'var(--font-pixel)' }}>
          VỨT VẬT PHẨM
        </h3>
        <p style={{ fontSize: '11px', margin: '0 0 12px 0' }}>
          Bạn muốn vứt bao nhiêu <strong>{getItemName(itemId)}</strong>?
        </p>
        <input
          type="number"
          min="1"
          max={maxQty}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '100%', padding: '6px', marginBottom: '15px', textAlign: 'center', border: '2px solid #cbd5e1', borderRadius: '4px', fontSize: '14px' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="pixel-btn"
            disabled={loading}
            onClick={onConfirm}
            style={{ flex: 1, background: '#22c55e', color: '#fff', padding: '8px', cursor: loading ? 'default' : 'pointer' }}
          >
            Xác nhận
          </button>
          <button
            className="pixel-btn"
            disabled={loading}
            onClick={onCancel}
            style={{ flex: 1, background: '#ef4444', color: '#fff', padding: '8px', cursor: loading ? 'default' : 'pointer' }}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
