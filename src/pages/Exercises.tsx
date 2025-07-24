import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Progress,
  Stack,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { useState } from 'react';
import {
  FaHeartbeat,
  FaCloud,
  FaSun,
  FaMoon,
  FaTree,
  FaWater,
} from 'react-icons/fa';

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: number;
  icon: any;
  type: 'breathing' | 'meditation' | 'mindfulness';
}

const exercises: Exercise[] = [
  {
    id: 'breathing-1',
    title: '4-7-8 Breathing',
    description: 'Calm your nervous system with this rhythmic breathing exercise.',
    duration: 300,
    icon: FaHeartbeat,
    type: 'breathing',
  },
  {
    id: 'meditation-1',
    title: 'Morning Meditation',
    description: 'Start your day with clarity and purpose.',
    duration: 600,
    icon: FaSun,
    type: 'meditation',
  },
  {
    id: 'mindfulness-1',
    title: 'Body Scan',
    description: 'Develop awareness and release tension throughout your body.',
    duration: 900,
    icon: FaCloud,
    type: 'mindfulness',
  },
  {
    id: 'meditation-2',
    title: 'Evening Relaxation',
    description: 'Unwind and prepare for restful sleep.',
    duration: 600,
    icon: FaMoon,
    type: 'meditation',
  },
  {
    id: 'mindfulness-2',
    title: 'Nature Connection',
    description: 'Practice mindful awareness in nature.',
    duration: 600,
    icon: FaTree,
    type: 'mindfulness',
  },
  {
    id: 'breathing-2',
    title: 'Ocean Breath',
    description: 'Soothing breath work inspired by ocean waves.',
    duration: 300,
    icon: FaWater,
    type: 'breathing',
  },
];

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const startExercise = () => {
    if (isActive) {
      timer && clearInterval(timer);
      setIsActive(false);
      setProgress(0);
    } else {
      setIsActive(true);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsActive(false);
            return 0;
          }
          return prev + (100 / exercise.duration) * 1;
        });
      }, 1000);
      setTimer(interval);
    }
  };

  return (
    <Box
      p={6}
      bg={useColorModeValue('white', 'gray.700')}
      rounded="lg"
      shadow="base"
      position="relative"
      overflow="hidden"
    >
      <Stack spacing={4}>
        <Icon
          as={exercise.icon}
          w={8}
          h={8}
          color={useColorModeValue('brand.500', 'brand.300')}
        />
        <Heading size="md">{exercise.title}</Heading>
        <Text color={useColorModeValue('gray.600', 'gray.400')}>
          {exercise.description}
        </Text>
        <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.500')}>
          Duration: {exercise.duration / 60} minutes
        </Text>
        {isActive && (
          <Progress
            value={progress}
            size="sm"
            colorScheme="brand"
            rounded="full"
          />
        )}
        <Button
          onClick={startExercise}
          colorScheme={isActive ? 'red' : 'brand'}
        >
          {isActive ? 'Stop' : 'Start'}
        </Button>
      </Stack>
    </Box>
  );
}

function Exercises() {
  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={8}>
        <Box textAlign="center">
          <Heading size="xl">Wellness Exercises</Heading>
          <Text mt={4} color={useColorModeValue('gray.600', 'gray.400')}>
            Practice mindfulness, meditation, and breathing exercises
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {exercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

export default Exercises; 