export function drawHead(g, image, cx, bottom, height) {
  const ratio = image.width / image.height;
  const width = height * ratio;
  g.drawImage(image, cx - width / 2, bottom - height, width, height);
  return width;
}

export function shadow(g, x, y, radius) {
  g.fillStyle = "rgba(0,0,0,0.32)";
  g.beginPath();
  g.ellipse(x, y + 2, radius, radius * 0.32, 0, 0, Math.PI * 2);
  g.fill();
}

export function limb(g, x1, y1, x2, y2, width, color) {
  g.strokeStyle = color;
  g.lineWidth = width;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
}
