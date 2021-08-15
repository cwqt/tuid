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
  const { matrix, setMatrix } = useStore();

  const [MAX_WIDTH, MAX_HEIGHT] = [100, 100];

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
              v > 0 && v < MAX_WIDTH && setMatrix(v, matrix.length)
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
              v > 0 && v < MAX_HEIGHT && setMatrix(matrix[0].length || 0, v)
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
      <small className="mt-2">
        <b>n.b.</b> altering this value will destroy values beyond borders of
        previous dimensions
      </small>
    </div>
  );
}
