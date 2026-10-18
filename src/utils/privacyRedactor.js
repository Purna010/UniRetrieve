/**
 * Privacy & PII Redaction Utility (Canvas API & OpenCV Integration)
 * Automatically redacts student ID card faces, bar codes, and sensitive personal details.
 */

export const privacyRedactor = {
  /**
   * Client-side Canvas API Face & PII Redactor
   * Applies Gaussian/box blur or privacy bars directly on an image before transmission.
   */
  async redactImageClientSide(base64Image, options = { blurFaces: true, maskCardId: true }) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original
        ctx.drawImage(img, 0, 0);

        const w = canvas.width;
        const h = canvas.height;

        // 1. If ID card mask requested, redact standard ID photo zone (typically top-right or top-left quadrant)
        if (options.blurFaces) {
          // Standard student card photo placeholder area (heuristic bounding box: top-left 25% area)
          const photoBox = {
            x: Math.round(w * 0.08),
            y: Math.round(h * 0.15),
            w: Math.round(w * 0.30),
            h: Math.round(h * 0.45),
          };

          // Apply heavy canvas pixelation blur
          ctx.filter = 'blur(16px)';
          ctx.drawImage(canvas, photoBox.x, photoBox.y, photoBox.w, photoBox.h, photoBox.x, photoBox.y, photoBox.w, photoBox.h);
          ctx.filter = 'none';

          // Privacy overlay border
          ctx.strokeStyle = '#00f5ff';
          ctx.lineWidth = 3;
          ctx.strokeRect(photoBox.x, photoBox.y, photoBox.w, photoBox.h);

          ctx.fillStyle = 'rgba(3, 7, 18, 0.7)';
          ctx.fillRect(photoBox.x, photoBox.y + photoBox.h - 24, photoBox.w, 24);
          ctx.fillStyle = '#00f5ff';
          ctx.font = 'bold 12px monospace';
          ctx.fillText('🛡️ FACE REDACTED', photoBox.x + 8, photoBox.y + photoBox.h - 8);
        }

        // 2. Mask student ID number / barcode band at bottom
        if (options.maskCardId) {
          const idBand = {
            x: Math.round(w * 0.08),
            y: Math.round(h * 0.78),
            w: Math.round(w * 0.84),
            h: Math.round(h * 0.14),
          };

          ctx.fillStyle = '#030712';
          ctx.fillRect(idBand.x, idBand.y, idBand.w, idBand.h);

          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1;
          ctx.strokeRect(idBand.x, idBand.y, idBand.w, idBand.h);

          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 11px monospace';
          ctx.fillText('🔒 SENSITIVE ID NUMBERS PROTECTED (PII MASKED)', idBand.x + 12, idBand.y + 20);
        }

        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = (err) => reject(err);
      img.src = base64Image;
    });
  },

  /**
   * Server-side OpenCV Haar Cascade Face Redaction proxy
   */
  async redactImageViaOpenCV(base64Image) {
    try {
      const base64Data = base64Image.split(';base64,').pop();
      const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const blob = new Blob([buffer], { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('image', blob, 'claim_proof.jpg');

      const response = await fetch('http://localhost:5001/redact-pii', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('OpenCV redaction service unreachable');
      }

      const data = await response.json();
      return data.redactedImage;
    } catch (err) {
      console.warn('Falling back to client-side Canvas API redaction:', err.message);
      return this.redactImageClientSide(base64Image);
    }
  }
};
