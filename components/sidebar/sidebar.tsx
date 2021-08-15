import {
  Heading,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { cx } from "@emotion/css";
import React from "react";
import InputSidebar from "./input";
import SelectSidebar from "./select";
import TerminalSidebar from "./terminal";

export default function Sidebar(props: { className?: string }) {
  return (
    <div className={cx(props.className, "bg-white flex flex-col")}>
      <Heading as="h1" mb="4">
        tui designer
      </Heading>

      <Tabs isFitted isLazy>
        <TabList>
          <Tab>Input</Tab>
          <Tab>Select</Tab>
          <Tab>Terminal</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <InputSidebar></InputSidebar>
          </TabPanel>
          <TabPanel>
            <SelectSidebar></SelectSidebar>
          </TabPanel>
          <TabPanel>
            <TerminalSidebar></TerminalSidebar>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <p className="my-auto">https://gitlab.com/cxss/tui-designer</p>
    </div>
  );
}
