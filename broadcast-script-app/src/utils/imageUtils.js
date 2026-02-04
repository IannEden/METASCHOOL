export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Return full data URL (includes mime type)
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function extractBase64Data(dataUrl) {
  // Extract just the base64 part from data URL
  if (dataUrl.includes(',')) {
    return dataUrl.split(',')[1];
  }
  return dataUrl;
}

export function getMimeType(dataUrl) {
  // Extract mime type from data URL
  const match = dataUrl.match(/data:([^;]+);/);
  return match ? match[1] : 'image/jpeg';
}

export function isValidImageFile(file) {
  // Check by MIME type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (file.type && validTypes.includes(file.type)) {
    return true;
  }

  // Fallback: check by file extension if MIME type is empty
  const fileName = file.name?.toLowerCase() || '';
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return validExtensions.some(ext => fileName.endsWith(ext));
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
