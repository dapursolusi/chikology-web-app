export function cropImage(base64: string, cropRatio = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const cropW = img.width * cropRatio;
      const cropH = img.height * cropRatio;
      const cropX = (img.width - cropW) / 2;
      const cropY = (img.height - cropH) / 2;

      const canvas = document.createElement('canvas');
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      const cropped = canvas.toDataURL('image/jpeg', 0.95);
      const stripped = cropped.replace(/^data:image\/\w+;base64,/, '');
      resolve(stripped);
    };
    img.onerror = reject;
  });
}
