import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Heading,
  Link,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from '@chakra-ui/react';
import { cx } from '@emotion/css';
import { useStore } from 'data/store';
import React from 'react';
import InputSidebar from './input';
import SelectSidebar from './select';
import TerminalSidebar from './terminal';

export default function Sidebar(props: { className?: string }) {
  const { setMode } = useStore();

  return (
    <div className={cx(props.className, 'bg-white flex flex-col')}>
      <Heading as="h1" mb="4">
        tui designer
      </Heading>

      <Tabs isFitted variant="enclosed-colored">
        <TabList>
          <Tab onClick={() => setMode('input')} id="tab-input">
            Input
          </Tab>
          <Tab onClick={() => setMode('select')} id="tab-select">
            Select
          </Tab>
          <Tab id="tab-terminal">Terminal</Tab>
        </TabList>

        <TabPanels>
          <TabPanel padding="0" paddingTop="3">
            <InputSidebar></InputSidebar>
          </TabPanel>
          <TabPanel padding="0" paddingTop="3">
            <SelectSidebar></SelectSidebar>
          </TabPanel>
          <TabPanel padding="0" paddingTop="3">
            <TerminalSidebar></TerminalSidebar>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Link
        href="https://gitlab.com/cxss/tui-designer"
        isExternal
        fontSize="sm"
        mt="auto"
      >
        https://gitlab.com/cxss/tui-designer <ExternalLinkIcon mx="2px" />
      </Link>
    </div>
  );
}
