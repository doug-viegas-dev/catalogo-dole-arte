export async function convertToWebP(file: File, maxWidth = 1200, quality = 0.85): Promise<Blob> {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);

  let width = image.width;
  let height = image.height;

  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Nao foi possivel preparar a imagem.');
  }

  context.drawImage(image, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error('Nao foi possivel converter a imagem para WebP.'));
      },
      'image/webp',
      quality,
    );
  });
}

const readFileAsDataUrl = (file: File): Promise<string> => (
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Nao foi possivel ler a imagem.'));
    reader.readAsDataURL(file);
  })
);

const loadImage = (src: string): Promise<HTMLImageElement> => (
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Nao foi possivel carregar a imagem.'));
    image.src = src;
  })
);
