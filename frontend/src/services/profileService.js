import api from '../utils/api';

export const getProfile = async () => {
  const { data } = await api.get('/profile');
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await api.put('/profile', payload);
  return data;
};

export const changePassword = (payload) => api.put('/profile/password', payload);

export const updateSettings = async (payload) => {
  const { data } = await api.put('/profile/settings', payload);
  return data;
};

/**
 * Upload profile picture
 * @param {File} file - Image file to upload from local system
 * 
 * Uses the same approach as product image upload:
 * 1. Uploads file to backend /profile/avatar endpoint
 * 2. Backend saves file to uploads/avatars/{userId}/ directory
 * 3. Backend returns profile with avatarUrl pointing to /api/images/avatars/{userId}/avatar.{ext}
 */
export const uploadProfilePicture = async (file) => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file (JPG, PNG, etc.)');
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('Image size must be less than 10MB. Please compress the image and try again.');
  }

  // Create FormData - same as product image upload
  const formData = new FormData();
  formData.append('avatar', file);
  
  try {
    // Upload to backend endpoint - backend will save file and return profile with avatarUrl
    const { data } = await api.put('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    // Provide helpful error messages
    if (error.response?.status === 400) {
      throw new Error('Invalid image file. Please select a valid image (JPG, PNG, etc.)');
    } else if (error.response?.status === 413) {
      throw new Error('Image file is too large. Please use an image smaller than 10MB.');
    } else if (error.response?.status === 500) {
      throw new Error('Server error while uploading image. Please try again later.');
    } else {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to upload profile picture. Please try again.'
      );
    }
  }
};

