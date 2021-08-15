import create from "zustand";
import {
  TerminalMatrix,
  IMatrixSquare,
  IEditorOptions,
  createMatrixSquare,
} from "./interfaces";

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
}>((set) => ({
  matrix: [],
  setMatrix: (width, height) =>
    set((state) => ({
      ...state,
      matrix: Array.from({ length: height }, () =>
        Array.from({ length: width }, createMatrixSquare)
      ),
    })),
  setMatrixSquareProperty: (x, y, data) =>
    set((state) => {
      state.matrix[y][x] = {
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
      };
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
}));
