export function formatNumber(n: number) {
  return (n * 100).toFixed(1);
}

export function normalizePos({ x, y }: { x: number; y: number }) {
  return {
    x: (x + 1) / 468,
    y: 1 - (y + 1) / 468,
  };
}
