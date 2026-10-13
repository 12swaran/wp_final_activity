export const validateFile = (filename: string, mime: string, base64: string) => {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64) || base64.length % 4 !== 0)
    throw new Error('Invalid file encoding.');
  const content = Buffer.from(base64, 'base64');
  if (!content.length || content.length > 5 * 1024 * 1024)
    throw new Error('File must be between 1 byte and 5 MB.');
  const rules: Record<string, { extensions: RegExp; valid: boolean }> = {
    'image/png': {
      extensions: /\.png$/i,
      valid: content.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    },
    'image/jpeg': {
      extensions: /\.jpe?g$/i,
      valid: content[0] === 255 && content[1] === 216 && content[2] === 255,
    },
    'image/webp': {
      extensions: /\.webp$/i,
      valid:
        content.subarray(0, 4).toString() === 'RIFF' &&
        content.subarray(8, 12).toString() === 'WEBP',
    },
    'application/pdf': {
      extensions: /\.pdf$/i,
      valid: content.subarray(0, 5).toString() === '%PDF-',
    },
  };
  const rule = rules[mime];
  if (!rule || !rule.extensions.test(filename) || !rule.valid)
    throw new Error('File extension, type and contents must match. Use PNG, JPEG, WebP or PDF.');
  return { content, filename: filename.replace(/[^a-zA-Z0-9_.-]/g, '_') };
};
