import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Heading,
  Link
} from '@chakra-ui/react';
import { cx } from '@emotion/css';
import React from 'react';
import InputSidebar from './input';
import SelectSidebar from './select';
import SettingsSidebar from './settings';

export default function Sidebar(props: { className?: string }) {
  return (
    <div
      className={cx(props.className, 'bg-white flex flex-col overflow-scroll')}
    >
      <Heading
        as="h1"
        my={4}
        className="flex items-center justify-center"
        size="lg"
      >
        <img src="terminal.svg" className="w-10" alt="" />
        <span className="ml-2 mb-1">tui designer</span>
      </Heading>

      <Accordion mb={4} allowToggle defaultIndex={0}>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Input
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <InputSidebar></InputSidebar>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Selection
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <SelectSidebar></SelectSidebar>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Settings, Import &amp; Export
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <SettingsSidebar></SettingsSidebar>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <Link
        href="https://gitlab.com/cxss/tui-designer"
        isExternal
        fontSize="sm"
        m={4}
        mt="auto"
        textAlign="center"
      >
        https://gitlab.com/cxss/tui-designer <ExternalLinkIcon mx="2px" />
      </Link>
    </div>
  );
}
