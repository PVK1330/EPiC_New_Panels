/**
 * platformBrandingSlice.js
 * Holds the platform-level branding values that are shared across the app:
 *   - platform_name  → shown in the sidebar header
 *   - logo_url       → shown in the sidebar header
 *   - favicon_url    → applied to <link rel="icon"> in index.html at runtime
 *
 * Populated once on superadmin app boot (or after identity settings are saved).
 */

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  platform_name: "ElitePic",
  logo_url:      null,   // null = use the bundled static logo
  favicon_url:   null,
  loaded:        false,  // true once fetched from the API at least once
};

const platformBrandingSlice = createSlice({
  name: "platformBranding",
  initialState,
  reducers: {
    setBranding(state, action) {
      const { platform_name, logo_url, favicon_url } = action.payload;
      if (platform_name != null) state.platform_name = platform_name;
      if (logo_url      != null) state.logo_url      = logo_url;
      if (favicon_url   != null) state.favicon_url   = favicon_url;
      state.loaded = true;
    },
    clearBranding(state) {
      Object.assign(state, initialState);
    },
  },
});

export const { setBranding, clearBranding } = platformBrandingSlice.actions;
export default platformBrandingSlice.reducer;

// Selectors
export const selectPlatformName   = (s) => s.platformBranding.platform_name;
export const selectLogoUrl        = (s) => s.platformBranding.logo_url;
export const selectFaviconUrl     = (s) => s.platformBranding.favicon_url;
export const selectBrandingLoaded = (s) => s.platformBranding.loaded;
