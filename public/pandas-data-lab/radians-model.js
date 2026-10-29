// The rendered lesson and calculation checks use this same model.
export const TAU = 2 * Math.PI;
export const toRadians = degrees => degrees * Math.PI / 180;
export const toDegrees = radians => radians * 180 / Math.PI;
export function angleModel(degrees, radius = 1) {
  const radians = toRadians(degrees);
  return {degrees, radians, radius, arc: radius * radians,
    sin: Math.sin(radians), cos: Math.cos(radians)};
}
export function formatValue(value, digits = 6) {
  return (Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value).toFixed(digits);
}
export function piLabel(degrees) {
  const labels = new Map([[0,'0'],[30,'π/6'],[45,'π/4'],[60,'π/3'],[90,'π/2'],[120,'2π/3'],[135,'3π/4'],[150,'5π/6'],[180,'π'],[270,'3π/2'],[360,'2π']]);
  return labels.get(degrees) || `${formatValue(degrees / 180, 4)}π (근삿값)`;
}
export function circlePoint(radians, radius, cx = 220, cy = 200) {
  return {x: cx + radius * Math.cos(radians), y: cy - radius * Math.sin(radians)};
}
export function arcPoints(radians, radius, cx = 220, cy = 200, steps = 160) {
  return Array.from({length:steps+1}, (_,i)=>circlePoint(radians*i/steps,radius,cx,cy));
}
// A string of length r bends continuously from a straight tangent to a 1-radian arc.
export function bendPoint(fraction, bend, radius, cx = 225, cy = 220) {
  if (bend < 1e-7) return {x:cx+radius,y:cy-radius*fraction};
  return {x:cx+radius-radius/bend*(1-Math.cos(bend*fraction)),
    y:cy-radius/bend*Math.sin(bend*fraction)};
}
