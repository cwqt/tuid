import {
  FormControl,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Input,
  InputGroup,
  InputRightAddon,
  InputLeftAddon,
} from "@chakra-ui/react";
import { DEFAULT_TERMINAL_BACKGROUND_COLOR } from "components/terminal";
import { useStore } from "data/store";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";

export default function TerminalSidebar(props: { className?: string }) {
  const {
    matrix,
    setMatrix,
    terminalBackgroundColor,
    setTerminalBackgroundColor,
  } = useStore();

  const [MAX_WIDTH, MAX_HEIGHT] = [202, 64];

  // store local copy of hex code to display error state of input
  const [hexCode, setHexCode] = useState<string>(
    terminalBackgroundColor.slice(1, terminalBackgroundColor.length)
  );
  const hexCodeRegex = /^([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/i;

  useEffect(() => {
    // check the code is valid before actually setting the terminal background
    if (hexCodeRegex.test(hexCode)) {
      setTerminalBackgroundColor(`#${hexCode}`);
    } else {
      setTerminalBackgroundColor(DEFAULT_TERMINAL_BACKGROUND_COLOR);
    }
  }, [hexCode]);

  return (
    <div>
      <div className="flex">
        <FormControl id="terminal-height">
          <FormLabel>Width</FormLabel>
          <NumberInput
            max={MAX_WIDTH}
            min={10}
            defaultValue={matrix[0]?.length || 0}
            onChange={(_, v) =>
              v > 0 && v <= MAX_WIDTH && setMatrix(v, matrix.length)
            }
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl id="terminal-height" className="ml-2">
          <FormLabel>Height</FormLabel>
          <NumberInput
            max={MAX_HEIGHT}
            min={10}
            defaultValue={matrix.length}
            onChange={(_, v) =>
              v > 0 && v <= MAX_HEIGHT && setMatrix(matrix[0].length || 0, v)
            }
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      </div>
      <p className="mt-2 text-sm">
        Max Width: {MAX_WIDTH}, Max Height: {MAX_HEIGHT}
        <span className="opacity-50">
          <b>n.b.</b> altering this value will destroy values beyond borders of
          previous dimensions
        </span>
      </p>

      <FormControl id="terminal-height" className="mt-4">
        <FormLabel>Terminal background color</FormLabel>
        <InputGroup>
          <InputLeftAddon>#</InputLeftAddon>
          <Input
            placeholder="Hex code"
            defaultValue={hexCode}
            isInvalid={!hexCodeRegex.test(hexCode)}
            onChange={(e) => setHexCode(e.target.value)}
          />
        </InputGroup>
      </FormControl>
    </div>
  );
}
