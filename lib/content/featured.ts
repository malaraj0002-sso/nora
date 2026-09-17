export function takeForHome<T extends { visible: boolean; featured?: boolean }>(
  items: T[],
  limit: number,
  preferredSlugs?: string[],
  slugOf?: (item: T) => string,
): T[] {
  const visible = items.filter((item) => item.visible);
  if (preferredSlugs?.length && slugOf) {
    const picked = preferredSlugs
      .map((slug) => visible.find((item) => slugOf(item) === slug))
      .filter((item): item is T => Boolean(item));
    if (picked.length) return picked.slice(0, limit);
  }
  const featured = visible.filter((item) => item.featured);
  if (featured.length) {
    const rest = visible.filter((item) => !item.featured);
    return [...featured, ...rest].slice(0, limit);
  }
  return visible.slice(0, limit);
}
