import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebAudioBridgeComponent } from './src/audio/WebAudioBridge';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import StudioScreen from './src/screens/StudioScreen';
import SynthScreen from './src/screens/SynthScreen';
import PresetsScreen from './src/screens/PresetsScreen';
import AccountScreen from './src/screens/AccountScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import EffectsControllerEnhanced from './src/components/EffectsControllerEnhanced';

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
          height: 70,
        },
        tabBarActiveTintColor: '#00ff94',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 5,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'HOME',
          tabBarLabel: 'HOME',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen 
        name="Studio" 
        component={StudioScreen}
        options={{
          title: 'STUDIO',
          tabBarLabel: 'STUDIO',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🎛️</Text>,
        }}
      />
      <Tab.Screen 
        name="Synth" 
        component={SynthScreen}
        options={{
          title: 'SYNTH',
          tabBarLabel: 'SYNTH',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🎹</Text>,
        }}
      />
      <Tab.Screen 
        name="Presets" 
        component={PresetsScreen}
        options={{
          title: 'PRESETS',
          tabBarLabel: 'PRESETS',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>📦</Text>,
        }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountScreen}
        options={{
          title: 'ACCOUNT',
          tabBarLabel: 'ACCOUNT',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>👤</Text>,
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
            name="Effects" 
            component={EffectsControllerEnhanced}
            options={{ 
              title: '🎛️ EFFECTS',
              presentation: 'modal',
            }}
          />
          <Stack.Screen 
            name="SynthParams" 
            component={SynthScreen}
            options={{ 
              title: '⚙️ SYNTH PARAMETERS',
            }}
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
        {/* Hidden WebView for Web Audio API */}
        <WebAudioBridgeComponent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
