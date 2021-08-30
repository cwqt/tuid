import { DEFAULT_TERMINAL_BACKGROUND_COLOR } from './interfaces';
import FileSaver from 'file-saver';
import create from 'zustand';
import update from 'immutability-helper';
import compression from './compression';
import {
  ExportedState,
  IEditorOptions,
  IMatrixSquare,
  Area,
  TerminalMatrix
} from './interfaces';
import Matrices from '../components/matrix/methods';

// matrix is a 2d array, filled with holes of undefined
// [_,_,_,a,b,c],
// [d,e,f,_,_,_]
// [_,_,_,_,_,_]
// [_,_,_,h,i,j]
// only rendering filled holes saves us a tonne
// on memory & rendering speed

export interface IStore {
  fileTitle: string;
  setFileTitle: (title: string) => void;

  matrix: TerminalMatrix;
  setMatrix: (matrix: IMatrixSquare[][]) => void;
  setMatrixSquareProperty: (
    x: number,
    y: number,
    data: Partial<IMatrixSquare> | null
  ) => void;

  editor: IEditorOptions;
  setEditorProperties: (editor: Partial<IEditorOptions>) => void;

  terminalBackgroundColor: string;
  setTerminalBackgroundColor: (hex: string) => void;

  // selection area: x,y,width,height
  selection: Area | undefined;
  setSelection: (region: Area) => void;

  // import & export
  exportState: () => void;
  importState: (exportedState: ExportedState) => void;
}

export const useStore = create<IStore>(set => ({
  fileTitle: '',
  setFileTitle: title => set(state => ({ fileTitle: title })),

  matrix: [],
  setMatrix: matrix =>
    set(state => ({
      ...state,
      matrix
    })),
  setMatrixSquareProperty: (x, y, data) =>
    set(state => ({
      // immutably update 2d array
      matrix: update(state.matrix, {
        [y]: {
          [x]: {
            $set: Matrices.squares.set(x, y, data, state.matrix, state.editor)
          }
        }
      })
    })),

  editor: {
    bold: false,
    italic: false,
    underline: false,
    strikeout: false,
    foreground: '#fff',
    background: DEFAULT_TERMINAL_BACKGROUND_COLOR
  },
  setEditorProperties: editor =>
    set(state => ({
      editor: {
        ...state.editor,
        ...editor
      }
    })),

  terminalBackgroundColor: DEFAULT_TERMINAL_BACKGROUND_COLOR,
  setTerminalBackgroundColor: hex =>
    set(state => ({ terminalBackgroundColor: hex })),

  selection: undefined,
  setSelection: area => set(state => ({ selection: area })),

  exportState: () =>
    set(state => {
      const exportedState: ExportedState = {
        file_title: state.fileTitle,
        matrix: compression.matrix.compress(state.matrix),
        settings: {
          terminal_background_color: state.terminalBackgroundColor
        }
      };

      FileSaver.saveAs(
        new Blob([JSON.stringify(exportedState)], { type: 'application/json' }),
        `${
          exportedState.file_title
            ? exportedState.file_title.replace(' ', '-')
            : new Date().toISOString()
        }.tui.json`
      );

      return state;
    }),

  importState: exportedState =>
    set(state => {
      if (!exportedState.matrix) {
        throw new Error(`Invalid exported state file`);
      }

      return {
        fileTitle: exportedState.file_title || '',
        matrix: compression.matrix.decompress(exportedState.matrix),
        terminalBackgroundColor:
          exportedState.settings.terminal_background_color ||
          DEFAULT_TERMINAL_BACKGROUND_COLOR
      };
    })
}));
