import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, useColorMode } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from './store';

// Layout components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';

// Page components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Resources from './pages/Resources';
import Exercises from './pages/Exercises';

function App() {
  const { colorMode } = useColorMode();
  const { token } = useSelector((state: RootState) => state.auth);

  return (
    <Box
      minH="100vh"
      bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}
      color={colorMode === 'light' ? 'gray.800' : 'white'}
    >
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="login"
            element={token ? <Navigate to="/chat" /> : <Login />}
          />
          <Route
            path="register"
            element={token ? <Navigate to="/chat" /> : <Register />}
          />
          <Route
            path="chat"
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            }
          />
          <Route
            path="profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="resources"
            element={
              <PrivateRoute>
                <Resources />
              </PrivateRoute>
            }
          />
          <Route
            path="exercises"
            element={
              <PrivateRoute>
                <Exercises />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </Box>
  );
}

export default App; 