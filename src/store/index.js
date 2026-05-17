import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import notificationReducer from './slices/notificationSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
  },
})

export default store
