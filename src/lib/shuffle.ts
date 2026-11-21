export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Lấy n phần tử ngẫu nhiên khác `exclude`. */
export function sampleOthers<T>(pool: readonly T[], exclude: T, n: number): T[] {
  return shuffle(pool.filter((x) => x !== exclude)).slice(0, n);
}
