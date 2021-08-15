import { DEFAULT_TERMINAL_BACKGROUND_COLOR } from "components/terminal";
import create from "zustand";
import {
  TerminalMatrix,
  IMatrixSquare,
  IEditorOptions,
  createMatrixSquare,
} from "./interfaces";

// matrix is a 2d array, filled with holes of undefined
// [_,_,_,a,b,c],
// [d,e,f,_,_,_]
// [_,_,_,_,_,_]
// [_,_,_,h,i,j]
// only rendering filled holes saves us a tonne
// on memory & rendering speed

export const useStore = create<{
  matrix: TerminalMatrix;
  setMatrix: (width: number, height: number) => void;
  setMatrixSquareProperty: (
    x: number,
    y: number,
    data: Partial<IMatrixSquare>
  ) => void;

  editor: IEditorOptions;
  setEditorProperties: (editor: Partial<IEditorOptions>) => void;

  selectedSpecialCharacter: string;
  setSelectedSpecialCharacter: (value: string) => void;

  terminalBackgroundColor: string;
  setTerminalBackgroundColor: (hex: string) => void;
}>((set) => ({
  matrix: [],
  setMatrix: (width, height) =>
    set((state) => {
      let matrix: IMatrixSquare[][] =
        // on initial load, matrix length will be 0x0, so create a fresh matrix
        state.matrix.length == 0
          ? Array.from({ length: height }, () =>
              Array.from({ length: width }, () => undefined)
            )
          : state.matrix;

      // if matrix was not starting from 0x0, then this matrix == state.matrix
      if (matrix == state.matrix) {
        // change in height
        if (height != state.matrix.length) {
          if (height < state.matrix.length) {
            // height decremented
            matrix = state.matrix.slice(0, height);
          } else {
            // height incremented
            matrix = state.matrix.concat(
              Array.from({ length: height - state.matrix.length }, () =>
                Array.from({ length: width }, () => undefined)
              )
            );
          }
        }

        // change in width
        if (width != state.matrix[0].length) {
          for (let y = 0; y < matrix.length - 1; y++) {
            if (width < matrix[y].length) {
              // width decremented
              matrix[y] = state.matrix[y].slice(0, width);
            } else {
              // width incremented
              matrix[y] = state.matrix[y].concat(
                Array.from(
                  { length: width - state.matrix[y].length },
                  () => undefined
                )
              );
            }
          }
        }
      }

      return {
        ...state,
        matrix,
      };
    }),
  setMatrixSquareProperty: (x, y, data) =>
    set((state) => {
      state.matrix[y][x] = state.matrix[y][x]
        ? {
            ...state.matrix[y][x],
            underline: state.editor.underline,
            bold: state.editor.bold,
            strikeout: state.editor.strikeout,
            italic: state.editor.italic,
            foreground:
              state.editor.depth == "foreground"
                ? state.editor.color
                : state.matrix[y][x].foreground,
            background:
              state.editor.depth == "background"
                ? state.editor.color
                : state.matrix[y][x].background,
            ...data,
          }
        : createMatrixSquare(data);
      return state;
    }),

  editor: {
    bold: false,
    italic: false,
    underline: false,
    strikeout: false,
    color: "#fff",
    depth: "foreground",
  },
  setEditorProperties: (editor) =>
    set((state) => ({
      ...state,
      editor: {
        ...state.editor,
        ...editor,
      },
    })),

  selectedSpecialCharacter: "",
  setSelectedSpecialCharacter: (value) =>
    set((state) => ({ ...state, selectedSpecialCharacter: value })),

  terminalBackgroundColor: DEFAULT_TERMINAL_BACKGROUND_COLOR,
  setTerminalBackgroundColor: (hex) =>
    set((state) => ({ ...state, terminalBackgroundColor: hex })),
}));
