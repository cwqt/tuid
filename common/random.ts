import { createMatrixSquare, IMatrixSquare } from './interfaces';

export const randomMatrixSquare = (): IMatrixSquare =>
  createMatrixSquare({
    character: (x => x.split('')[Math.floor(Math.random() * x.length - 1)])(
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    ),
    bold: Math.random() < 0.5,
    underline: Math.random() < 0.5,
    strikeout: Math.random() < 0.5,
    italic: Math.random() < 0.5,
    background: '#' + Math.floor(Math.random() * 16777215).toString(16),
    foreground: '#' + Math.floor(Math.random() * 16777215).toString(16)
  });
