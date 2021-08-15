import { Heading } from "@chakra-ui/react";
import { css, cx } from "@emotion/css";
import color from "data/color";
import specialCharacters from "data/special-characters";
import { useStore } from "data/store";
import { Button, ButtonGroup } from "@chakra-ui/react";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import { Switch, FormControl, FormLabel } from "@chakra-ui/react";

import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import InputSidebar from "./input";

export default function SelectSidebar(props: { className?: string }) {
  const { editor, setEditorProperties } = useStore();

  return <div></div>;
}
