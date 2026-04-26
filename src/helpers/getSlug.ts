import slugify from 'slugify';

export function getSlug(name: string) {
  return slugify(name, {
    lower: true,
    trim: true,
    replacement: '-',
    remove: undefined,
  });
}
