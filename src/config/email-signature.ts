/**
 * Spécifications imposées aux concepteurs pour les signatures email (image).
 * Toute image importée doit respecter exactement ces dimensions.
 */
export const EMAIL_SIGNATURE_IMAGE = {
  width: 600,
  height: 150,
  /** Formats acceptés pour l’upload */
  allowedMimeTypes: ['image/png', 'image/jpeg'] as const,
  allowedExtensions: ['.png', '.jpg', '.jpeg'] as const,
  maxFileSizeBytes: 512 * 1024, // 512 Ko
  alt: 'Signature',
} as const;

export const EMAIL_SIGNATURE_DESIGNER_BRIEF = `Format obligatoire : ${EMAIL_SIGNATURE_IMAGE.width} × ${EMAIL_SIGNATURE_IMAGE.height} pixels, PNG ou JPEG, fond transparent ou blanc selon la charte, poids max ${Math.round(EMAIL_SIGNATURE_IMAGE.maxFileSizeBytes / 1024)} Ko.`;
