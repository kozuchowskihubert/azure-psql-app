import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import WorkspacesScreen from './src/screens/WorkspacesScreen';
import TechnoWorkspaceScreen from './src/screens/TechnoWorkspaceScreen';
import ModularWorkspaceScreen from './src/screens/ModularWorkspaceScreen';
import BuilderWorkspaceScreen from './src/screens/BuilderWorkspaceScreen';
import PresetsScreen from './src/screens/PresetsScreen';
import AccountScreen from './src/screens/AccountScreen';
import PremiumScreen from './src/screens/PremiumScreen';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0a0a0a',
        },
        headerTintColor: '#00ff94',
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#1a1a1a',
        },
        tabBarActiveTintColor: '#00ff94',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color }}>🏠</Text>,
        }}
      />
      <Tab.Screen 
        name="Workspaces" 
        component={WorkspacesScreen}
        options={{
          tabBarLabel: 'Workspaces',
          tabBarIcon: ({ color }) => <Text style={{ color }}>🎹</Text>,
        }}
      />
      <Tab.Screen 
        name="Presets" 
        component={PresetsScreen}
        options={{
          tabBarLabel: 'Presets',
          tabBarIcon: ({ color }) => <Text style={{ color }}>📦</Text>,
        }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountScreen}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color }) => <Text style={{ color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0a0a0a',
        },
        headerTintColor: '#00ff94',
        cardStyle: { backgroundColor: '#0a0a0a' },
      }}
    >
      {!user ? (
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="SignUp" 
            component={SignUpScreen}
            options={{ title: 'Sign Up' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen 
            name="Main" 
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="TechnoWorkspace" 
            component={TechnoWorkspaceScreen}
            options={{ title: 'TECHNO Workspace' }}
          />
          <Stack.Screen 
            name="ModularWorkspace" 
            component={ModularWorkspaceScreen}
            options={{ title: 'MODULAR Workspace' }}
          />
          <Stack.Screen 
            name="BuilderWorkspace" 
            component={BuilderWorkspaceScreen}
            options={{ title: 'BUILDER Workspace' }}
          />
          <Stack.Screen 
            name="Premium" 
            component={PremiumScreen}
            options={{ title: 'Go Premium' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
