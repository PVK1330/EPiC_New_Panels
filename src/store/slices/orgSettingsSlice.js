import { createSlice } from "@reduxjs/toolkit";

/**
 * Org-wide display settings (timezone + date format).
 *
 * The admin picks these once for the whole organisation; the backend ships
 * them on every auth response (`user.organisation`). Every panel reads from
 * here so all dates/times render in the organisation's timezone & format.
 * See src/utils/datetime.js for the formatting helpers that consume this.
 */
const orgSettingsSlice = createSlice({
  name: "orgSettings",
  initialState: {
    timezone: "Europe/London",
    date_format: "DD/MM/YYYY",
  },
  reducers: {
    setOrgSettings: (state, action) => {
      const { timezone, date_format } = action.payload || {};
      if (timezone) state.timezone = timezone;
      if (date_format) state.date_format = date_format;
    },
  },
});

export const { setOrgSettings } = orgSettingsSlice.actions;
export const selectOrgTimezone = (state) => state.orgSettings.timezone;
export const selectOrgDateFormat = (state) => state.orgSettings.date_format;
export default orgSettingsSlice.reducer;
