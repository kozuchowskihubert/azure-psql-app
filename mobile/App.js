import { StatusBar } from 'expo-status-bar';

import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebAudioBridgeComponent } from './src/audio/WebAudioBridge';

// NEW REFACTOR - SSO Persona & Main Navigation
import WelcomeScreen from './src/screens/WelcomeScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Essential Screens only - others loaded via MainTabNavigator
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';

/*
 * LEGACY IMPORTS - Commented out to reduce module loading
 * These are either not used or loaded via MainTabNavigator
 *
import CreatorScreen from './src/screens/CreatorScreen';
import HomeScreen from './src/screens/HomeScreen';
import HomeScreenV2 from './src/screens/HomeScreenV2';
import StudioScreen from './src/screens/StudioScreen';
import SynthScreen from './src/screens/SynthScreen';
import PresetsScreen from './src/screens/PresetsScreen';
import AccountScreen from './src/screens/AccountScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import EffectsControllerEnhanced from './src/components/EffectsControllerEnhanced';
import WorkspaceScreen from './src/screens/WorkspaceScreen';
import SynthsScreen from './src/screens/SynthsScreen';
import InstrumentsScreen from './src/screens/InstrumentsScreen';
import ModulationScreen from './src/screens/ModulationScreen';
import PlatformScreen from './src/screens/PlatformScreen';
import UserAccountScreen from './src/screens/UserAccountScreen';
import StudioSelectorScreen from './src/screens/StudioSelectorScreen';
import BassStudioScreen from './src/screens/BassStudioScreen';
import ArpStudioScreen from './src/screens/ArpStudioScreen';
import WavetableStudioScreen from './src/screens/WavetableStudioScreen';
import EnhancedStudioScreen from './src/screens/EnhancedStudioScreen';
import OrchestralStudioScreen from './src/screens/OrchestralStudioScreen';
import ModulationLabScreen from './src/screens/ModulationLabScreen';
import PresetLaboratoryScreen from './src/screens/PresetLaboratoryScreen';
import SynthsSelectorScreen from './src/screens/SynthsSelectorScreen';
import DrumsSelectorScreen from './src/screens/DrumsSelectorScreen';
import BassSelectorScreen from './src/screens/BassSelectorScreen';
import EffectsSelectorScreen from './src/screens/EffectsSelectorScreen';
import DrumMachinesScreen from './src/screens/DrumMachinesScreen';
import BeatMakerScreen from './src/screens/BeatMakerScreen';
import TR808Screen from './src/screens/TR808Screen';
import TR909Screen from './src/screens/TR909Screen';
import DX7Screen from './src/screens/DX7Screen';
import MS20Screen from './src/screens/MS20Screen';
import Prophet5Screen from './src/screens/Prophet5Screen';
import TB303Screen from './src/screens/TB303Screen';
import TD3Screen from './src/screens/TD3Screen';
import RadioScreen from './src/screens/RadioScreen';
import LinnDrumScreen from './src/screens/LinnDrumScreen';
import CR78Screen from './src/screens/CR78Screen';
import DMXScreen from './src/screens/DMXScreen';
import PianoScreen from './src/screens/PianoScreen';
import ViolinScreen from './src/screens/ViolinScreen';
import VocalsScreen from './src/screens/VocalsScreen';
import ARP2600Screen from './src/screens/ARP2600Complete';
import Juno106Screen from './src/screens/Juno106Screen';
import MinimoogScreen from './src/screens/MinimoogScreen';
import ModularSynthScreen from './src/screens/ModularSynthScreen';
import WorkspaceSelector from './src/screens/WorkspaceSelector';
import DAWStudio from './src/screens/DAWStudio';
import TechnoWorkspaceScreen from './src/screens/TechnoWorkspaceScreen';
import ModularWorkspaceScreen from './src/screens/ModularWorkspaceScreen';
*/

const Stack = createStackNavigator();

// SIMPLIFIED APP NAVIGATOR - Only essential screens
function AppNavigator() {
  const [welcomeCompleted, setWelcomeCompleted] = useState(null);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    checkWelcomeStatus();
  }, []);

  const checkWelcomeStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('welcomeCompleted');
      setWelcomeCompleted(completed === 'true');
    } catch (error) {
      console.log('Error checking welcome status:', error);
      setWelcomeCompleted(false);
    }
  };

  if (isLoading || welcomeCompleted === null) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#050508' },
        headerTintColor: '#FF6B35',
        cardStyle: { backgroundColor: '#050508' },
      }}
    >
      {/* Welcome Screen for new users */}
      {!welcomeCompleted && (
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
      )}
      
      {/* Main App - 4 Tab Navigation */}
      <Stack.Screen 
        name="Main" 
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      
      {/* Auth Screens */}
      {!user && (
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
        <WebAudioBridgeComponent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
