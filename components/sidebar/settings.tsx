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
  Button,
  Heading
} from '@chakra-ui/react';
import { DEFAULT_TERMINAL_BACKGROUND_COLOR } from 'components/matrix';
import { useStore } from 'common/store';
import React, { ChangeEvent, useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, RepeatIcon } from '@chakra-ui/icons';
import { IconButton } from '@chakra-ui/react';

export const thisIsAnUnusedExport =
  'this export only exists to disable fast refresh for this file';

export default function SettingsSidebar(props: { className?: string }) {
  const {
    matrix,
    setMatrix,
    terminalBackgroundColor,
    setTerminalBackgroundColor,
    exportState,
    importState,
    fileTitle,
    setFileTitle
  } = useStore();

  // max terminal dimensions
  const [MAX_WIDTH, MAX_HEIGHT] = [202, 64];

  // file name
  // store local copy of hex code to display error state of input
  const [hexCode, setHexCode] = useState<string>(
    (terminalBackgroundColor || DEFAULT_TERMINAL_BACKGROUND_COLOR).slice(1)
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

  const fileInputRef = useRef<HTMLInputElement>();
  const requestFileForStateImport = () => {
    fileInputRef.current.click();
  };

  const handleFileSelectChanged = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files[0]) {
      const json = await event.target.files[0].text();
      importState(json);
    }
  };

  return (
    <div>
      <div className="flex">
        <FormControl id="terminal-height">
          <FormLabel>Width</FormLabel>
          <NumberInput
            max={MAX_WIDTH}
            min={10}
            value={matrix[0]?.length || 0}
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
            value={matrix.length}
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
        <br />
        <span className="opacity-50">
          <b>n.b.</b> altering this value will destroy values beyond borders of
          previous dimensions
        </span>
      </p>

      <div className="flex">
        <FormControl id="terminal-height" className="mt-4">
          <FormLabel>Terminal background color</FormLabel>
          <InputGroup>
            <InputLeftAddon>#</InputLeftAddon>
            <Input
              defaultValue={hexCode}
              placeholder="Hex code"
              isInvalid={!hexCodeRegex.test(hexCode)}
              onChange={e => setHexCode(e.target.value)}
            />
          </InputGroup>
        </FormControl>

        {/* Reset to default */}
        <IconButton
          onClick={() => setHexCode(DEFAULT_TERMINAL_BACKGROUND_COLOR.slice(1))}
          aria-label="Reset to default"
          className="mt-auto ml-2"
          icon={<RepeatIcon />}
        />
      </div>

      <Heading as="h2" size="md" className="my-4">
        Import &amp; Export
      </Heading>
      <FormControl id="terminal-height" className="mt-4">
        <FormLabel>File Title</FormLabel>
        <InputGroup>
          <Input
            defaultValue={fileTitle}
            placeholder="My Cool TUI"
            onChange={e => setFileTitle(e.target.value)}
          />
        </InputGroup>
      </FormControl>

      <div className="flex space-x-4 mt-4">
        <Button
          rightIcon={<ArrowDownIcon />}
          isFullWidth
          colorScheme="purple"
          variant="solid"
          onClick={exportState}
        >
          Export to File
        </Button>
        <Button
          rightIcon={<ArrowUpIcon />}
          isFullWidth
          colorScheme="purple"
          variant="outline"
          onClick={requestFileForStateImport}
        >
          Import from File
        </Button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelectChanged}
          multiple
          accept="application/json"
          className="hidden"
        />
      </div>
    </div>
  );
}
