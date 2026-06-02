import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import notificationReducer from './slices/notificationSlice'
import platformBrandingReducer from './slices/platformBrandingSlice'
import orgSettingsReducer from './slices/orgSettingsSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    platformBranding: platformBrandingReducer,
    orgSettings: orgSettingsReducer,
  },
})

export default store
