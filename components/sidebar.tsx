import { Heading } from "@chakra-ui/react";
import { css, cx } from "@emotion/css";
import color from "data/color";
import specialCharacters from "data/special-characters";
import { useStore } from "data/store";
import { Button, ButtonGroup } from "@chakra-ui/react";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import { Switch, FormControl, FormLabel } from "@chakra-ui/react";

export default function Sidebar(props: { className?: string }) {
  const {
    editor,
    setEditorProperties,
    selectedSpecialCharacter,
    setSelectedSpecialCharacter,
  } = useStore();

  const grid = color.grid(14, 8);

  return (
    <div className={cx(props.className, "bg-white")}>
      <Heading as="h1">tui designer</Heading>

      <p className="my-2">https://gitlab.com/cxss/tui-designer</p>

      <div className="flex items-center justify-between">
        <Heading as="h2" size="lg">
          Colors
        </Heading>

        <div className="flex items-center justify-between">
          <span className="opacity-90 center">Active colour</span>
          <div
            className={cx(
              "ml-2 w-6 h-6 rounded",
              css({
                backgroundColor: editor.color,
              })
            )}
          ></div>
        </div>
      </div>

      <div className="flex flex-col my-2">
        {grid.map((row, ridx) => {
          return (
            <div key={ridx} className="flex">
              {row.map((column, cidx) => {
                return (
                  <div
                    onClick={() => setEditorProperties({ color: column })}
                    key={ridx + cidx}
                    className={cx(
                      "w-5 h-5 hover:scale-150 hover:z-10 overflow-visible transform transition duration-150 cursor-pointer",
                      css({
                        backgroundColor: column,
                      })
                    )}
                  ></div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center">
        <span>Foreground</span>
        <Switch
          mx="4"
          id="depth-switch"
          onChange={() =>
            setEditorProperties({
              depth: editor.depth == "foreground" ? "background" : "foreground",
            })
          }
        />
        <span>Background</span>
      </div>

      <Heading as="h2" size="lg" className="mb-2 mt-2">
        Text options
      </Heading>

      <div className="grid grid-cols-2 mb-2">
        <Checkbox
          onChange={() => setEditorProperties({ bold: !editor.bold })}
          isDisabled={editor.depth == "background"}
          isChecked={editor.bold}
        >
          Bold
        </Checkbox>
        <Checkbox
          onChange={() => setEditorProperties({ italic: !editor.italic })}
          isDisabled={editor.depth == "background"}
          isChecked={editor.italic}
        >
          Italic
        </Checkbox>
        <Checkbox
          onChange={() => setEditorProperties({ underline: !editor.underline })}
          isDisabled={editor.depth == "background"}
          isChecked={editor.underline}
        >
          Underlined
        </Checkbox>
        <Checkbox
          onChange={() => setEditorProperties({ strikeout: !editor.strikeout })}
          isDisabled={editor.depth == "background"}
          isChecked={editor.strikeout}
        >
          Strikeout
        </Checkbox>
      </div>

      <Heading as="h2" size="lg" className="mb-2">
        Special Characters
      </Heading>

      <div className="grid grid-cols-2 gap-y-4">
        {Object.entries(specialCharacters).map(([key, value]) => {
          return (
            <div key={key}>
              <Heading as="h3" size="md" className="mb-2 text-center">
                {key}
              </Heading>

              {value.map((row, ridx) => {
                return (
                  <div className="flex w-full justify-center" key={ridx}>
                    {row.map((character, cidx) => (
                      <Button
                        key={ridx + cidx}
                        onClick={() => setSelectedSpecialCharacter(character)}
                        size="xs"
                        colorScheme="teal"
                        variant={
                          character == selectedSpecialCharacter
                            ? "solid"
                            : "ghost"
                        }
                      >
                        <span className="w-4 text-lg font-mono">
                          {character}
                        </span>
                      </Button>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <br />
    </div>
  );
}
