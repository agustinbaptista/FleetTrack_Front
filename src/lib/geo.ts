const R = 6371;

function toRad(d: number) {
  return (d * Math.PI) / 180;
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function pathLengthKm(path: [number, number][]): number {
  if (path.length < 2) return 0;
  let km = 0;
  for (let i = 1; i < path.length; i++) {
    const [a, b] = path[i - 1]!;
    const [c, d] = path[i]!;
    km += haversineKm(a, b, c, d);
  }
  return km;
}
