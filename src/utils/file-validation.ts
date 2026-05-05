export const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];

export function isImage(file: Express.Multer.File) {
  return imageTypes.includes(file.mimetype);
}
