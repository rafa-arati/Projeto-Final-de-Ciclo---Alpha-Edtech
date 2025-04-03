describe('Validação de Links de Vídeo', () => {
    test('Deve rejeitar links inválidos', () => {
      const invalidUrls = [
        'https://malicious-site.com/video',
        'javascript:alert(1)',
        'https://vimeo.com/123'
      ];
      expect(validateVideoUrls(invalidUrls)).toBe(false);
    });
  
    test('Deve aceitar links válidos', () => {
      const validUrls = [
        'https://youtu.be/dQw4w9WgXcQ',
        'https://www.tiktok.com/@user/video/123456789',
        'https://youtube.com/shorts/abc123'
      ];
      expect(validateVideoUrls(validUrls)).toBe(true);
    });
  });