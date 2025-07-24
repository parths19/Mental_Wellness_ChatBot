import { Outlet } from 'react-router-dom';
import { Box, Container, useColorMode } from '@chakra-ui/react';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout() {
  const { colorMode } = useColorMode();

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      <Container
        as="main"
        maxW="container.xl"
        flex="1"
        py={8}
        px={4}
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        borderRadius="lg"
        boxShadow="sm"
        my={4}
      >
        <Outlet />
      </Container>
      <Footer />
    </Box>
  );
}

export default Layout; 