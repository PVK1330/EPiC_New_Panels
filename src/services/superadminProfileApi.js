import api from './api';

export const getSuperadminProfile = () =>
  api.get('/api/superadmin/profile');

export const updateSuperadminProfile = (data) =>
  api.patch('/api/superadmin/profile', data);

export const uploadSuperadminAvatar = (file) => {
  const form = new FormData();
  form.append('avatar', file);
  return api.post('/api/superadmin/profile/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const changeSuperadminPassword = (data) =>
  api.patch('/api/superadmin/profile/password', data);

export const setup2FAForSuperadmin = () =>
  api.post('/api/superadmin/profile/2fa/setup');

export const verify2FASetupForSuperadmin = (data) =>
  api.post('/api/superadmin/profile/2fa/verify', data);

export const disable2FAForSuperadmin = (data) =>
  api.post('/api/superadmin/profile/2fa/disable', data);
