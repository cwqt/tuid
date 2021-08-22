import { createMatrixSquare, IMatrixSquare } from './interfaces';

function makeid(length) {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const randomMatrixSquare = (): IMatrixSquare =>
  createMatrixSquare({
    character: makeid(1), //(Math.random() + 1).toString(36).substring(1),
    bold: Math.random() < 0.5,
    underline: Math.random() < 0.5,
    strikeout: Math.random() < 0.5,
    italic: Math.random() < 0.5,
    background: '#' + Math.floor(Math.random() * 16777215).toString(16),
    foreground: '#' + Math.floor(Math.random() * 16777215).toString(16)
  });
