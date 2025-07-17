// Navigation debugging utility
export const debugNavigation = (action: string, path: string) => {
  console.log(`[Navigation Debug] ${action}: ${path}`);
  console.log(`[Navigation Debug] Current location: ${window.location.href}`);
  console.log(`[Navigation Debug] Hash: ${window.location.hash}`);
};

// Force navigation refresh
export const forceNavigationRefresh = () => {
  // Trigger a custom event to force component re-render
  window.dispatchEvent(new Event('forcedNavigation'));
};

// Listen for navigation events
export const setupNavigationListeners = () => {
  // Listen for hash changes
  window.addEventListener('hashchange', () => {
    debugNavigation('hashchange', window.location.hash);
  });

  // Listen for popstate (back/forward)
  window.addEventListener('popstate', () => {
    debugNavigation('popstate', window.location.pathname);
  });

  // Listen for forced navigation
  window.addEventListener('forcedNavigation', () => {
    debugNavigation('forcedNavigation', window.location.pathname);
  });
};
