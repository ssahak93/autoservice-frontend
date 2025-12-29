export const gradients = {
  hero: {
    base: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    animated: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe)',
    size: '400% 400%',
  },
  primary: {
    light: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #6366f1 100%)',
    medium: 'linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%)',
    dark: 'linear-gradient(135deg, #0369a1 0%, #1e40af 50%, #4338ca 100%)',
  },
  secondary: {
    light: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    medium: 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)',
    dark: 'linear-gradient(135deg, #7e22ce 0%, #be185d 100%)',
  },
  subtle: {
    light: 'linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)',
    warm: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)',
    cool: 'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%)',
  },
} as const;
