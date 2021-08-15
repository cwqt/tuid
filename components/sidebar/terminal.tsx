import {
  FormControl,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react";
import { useStore } from "data/store";

export default function TerminalSidebar(props: { className?: string }) {
  const { editor, setEditorProperties } = useStore();

  return (
    <div>
      <div className="flex">
        <FormControl id="terminal-height">
          <FormLabel>Width</FormLabel>
          <NumberInput max={100} min={10}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl id="terminal-height">
          <FormLabel>Height</FormLabel>
          <NumberInput max={100} min={10}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      </div>
    </div>
  );
}
