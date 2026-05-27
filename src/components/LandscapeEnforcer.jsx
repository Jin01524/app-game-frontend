import React from 'react';

/**
 * LandscapeEnforcer
 * Reverted to default orientation as requested by user.
 * This is now a pass-through component.
 */
export default function LandscapeEnforcer({ children }) {
  return <>{children}</>;
}
