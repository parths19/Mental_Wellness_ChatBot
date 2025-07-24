import { Box, Container, Stack, Text, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

function Footer() {
  return (
    <Box
      as="footer"
      bg="gray.50"
      color="gray.700"
      borderTop="1px"
      borderColor="gray.200"
      py={4}
    >
      <Container maxW="container.xl">
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify="space-between"
          align="center"
        >
          <Text>© 2024 Mental Wellness. All rights reserved.</Text>
          <Stack direction="row" spacing={6}>
            <Link as={RouterLink} to="/privacy">
              Privacy Policy
            </Link>
            <Link as={RouterLink} to="/terms">
              Terms of Service
            </Link>
            <Link href="tel:988">
              988 Suicide & Crisis Lifeline
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

export default Footer; 