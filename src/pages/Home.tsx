import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Stack,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaComments, FaHeartbeat, FaBook, FaUserMd } from 'react-icons/fa';

interface FeatureProps {
  title: string;
  text: string;
  icon: React.ElementType;
}

function Feature({ title, text, icon }: FeatureProps) {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={6}
      rounded="lg"
      boxShadow="md"
      textAlign="center"
      spacing={4}
    >
      <Icon as={icon} w={10} h={10} color="brand.500" mx="auto" />
      <Text fontWeight="bold" fontSize="lg">
        {title}
      </Text>
      <Text color={useColorModeValue('gray.600', 'gray.400')}>{text}</Text>
    </Stack>
  );
}

function Home() {
  return (
    <Box>
      <Container maxW="container.xl" py={20}>
        <Stack spacing={8} alignItems="center" textAlign="center">
          <Heading
            as="h1"
            size="2xl"
            bgGradient="linear(to-r, brand.400, wellness.400)"
            bgClip="text"
          >
            Your Mental Wellness Journey Starts Here
          </Heading>
          <Text fontSize="xl" maxW="2xl" color={useColorModeValue('gray.600', 'gray.400')}>
            A safe space to explore your thoughts, practice mindfulness, and connect with
            professional support when you need it.
          </Text>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
            <Button
              as={RouterLink}
              to="/register"
              size="lg"
              colorScheme="brand"
              px={8}
            >
              Get Started
            </Button>
            <Button
              as={RouterLink}
              to="/resources"
              size="lg"
              variant="outline"
              colorScheme="brand"
              px={8}
            >
              Browse Resources
            </Button>
          </Stack>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10} mt={20}>
          <Feature
            icon={FaComments}
            title="24/7 Chat Support"
            text="Connect with our AI-powered chatbot for immediate emotional support and guidance."
          />
          <Feature
            icon={FaHeartbeat}
            title="Wellness Exercises"
            text="Access guided meditation, breathing exercises, and mood tracking tools."
          />
          <Feature
            icon={FaBook}
            title="Resource Library"
            text="Explore our curated collection of mental health articles and self-help materials."
          />
          <Feature
            icon={FaUserMd}
            title="Professional Help"
            text="Get connected with licensed therapists and counselors when you need extra support."
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
}

export default Home; 