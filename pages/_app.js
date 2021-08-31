import '../styles/globals.css';
import { ChakraProvider } from '@chakra-ui/react';
import '@fontsource/roboto-mono';

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
