import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Button,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

function Profile() {
  const { user } = useSelector((state: RootState) => state.auth);
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update
    toast({
      title: 'Not implemented',
      description: 'Profile update functionality will be added soon.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.md" py={8}>
      <Stack spacing={8}>
        <Box>
          <Heading size="lg">Profile Settings</Heading>
          <Text color="gray.600">Manage your account settings and preferences</Text>
        </Box>

        <Box
          as="form"
          onSubmit={handleSubmit}
          bg={useColorModeValue('white', 'gray.700')}
          p={8}
          rounded="lg"
          shadow="base"
        >
          <Stack spacing={6}>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                type="text"
                defaultValue={user?.name}
                isReadOnly={!isEditing}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                defaultValue={user?.email}
                isReadOnly
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">
                Enable Notifications
              </FormLabel>
              <Switch
                defaultChecked={user?.preferences?.notifications}
                isDisabled={!isEditing}
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">
                Dark Mode
              </FormLabel>
              <Switch
                defaultChecked={user?.preferences?.theme === 'dark'}
                isDisabled={!isEditing}
              />
            </FormControl>

            <Stack direction="row" spacing={4} justify="flex-end">
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
              {isEditing && (
                <Button
                  type="submit"
                  colorScheme="brand"
                >
                  Save Changes
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}

export default Profile; 