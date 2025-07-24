import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Link,
  Icon,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaBook, FaPhone, FaHospital, FaMedkit } from 'react-icons/fa';

interface Resource {
  title: string;
  description: string;
  icon: any;
  link: string;
}

const resources: Resource[] = [
  {
    title: '988 Suicide & Crisis Lifeline',
    description: '24/7 free and confidential support for people in distress.',
    icon: FaPhone,
    link: 'tel:988',
  },
  {
    title: 'Crisis Text Line',
    description: 'Text HOME to 741741 to connect with a Crisis Counselor.',
    icon: FaPhone,
    link: 'sms:741741',
  },
  {
    title: 'Find a Therapist',
    description: 'Search for licensed mental health professionals in your area.',
    icon: FaHospital,
    link: 'https://www.psychologytoday.com/us/therapists',
  },
  {
    title: 'Mental Health Resources',
    description: 'Educational materials and self-help guides.',
    icon: FaBook,
    link: 'https://www.nimh.nih.gov/health',
  },
  {
    title: 'Emergency Services',
    description: 'If you or someone you know is in immediate danger, call 911.',
    icon: FaMedkit,
    link: 'tel:911',
  },
  {
    title: 'Support Groups',
    description: 'Find local and online support groups.',
    icon: FaBook,
    link: 'https://www.nami.org/Support-Education/Support-Groups',
  },
];

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Box
      p={6}
      bg={useColorModeValue('white', 'gray.700')}
      rounded="lg"
      shadow="base"
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'md',
      }}
      transition="all 0.2s"
    >
      <Stack spacing={4}>
        <Icon
          as={resource.icon}
          w={8}
          h={8}
          color={useColorModeValue('brand.500', 'brand.300')}
        />
        <Heading size="md">{resource.title}</Heading>
        <Text color={useColorModeValue('gray.600', 'gray.400')}>
          {resource.description}
        </Text>
        <Link
          href={resource.link}
          color={useColorModeValue('brand.500', 'brand.300')}
          fontWeight="semibold"
          isExternal
        >
          Access Resource →
        </Link>
      </Stack>
    </Box>
  );
}

function Resources() {
  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={8}>
        <Box textAlign="center">
          <Heading size="xl">Mental Health Resources</Heading>
          <Text mt={4} color={useColorModeValue('gray.600', 'gray.400')}>
            Access professional help, support services, and educational materials
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {resources.map((resource) => (
            <ResourceCard key={resource.title} resource={resource} />
          ))}
        </SimpleGrid>

        <Box textAlign="center" mt={8}>
          <Text color={useColorModeValue('gray.600', 'gray.400')}>
            If you're experiencing a mental health emergency,{' '}
            <Link href="tel:988" color="brand.500" fontWeight="bold">
              call or text 988
            </Link>{' '}
            immediately.
          </Text>
        </Box>
      </Stack>
    </Container>
  );
}

export default Resources; 