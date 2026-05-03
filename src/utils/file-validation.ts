export const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
export const videoTypes = ['video/mp4'];

export function isImage(file: Express.Multer.File) {
  return imageTypes.includes(file.mimetype);
}

export function isImageOrVideo(file: Express.Multer.File) {
  return [...imageTypes, ...videoTypes].includes(file.mimetype);
}
