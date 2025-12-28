import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebAudioBridgeComponent } from './src/audio/WebAudioBridge';

// NEW REFACTOR - SSO Persona & Main Navigation
import WelcomeScreen from './src/screens/WelcomeScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import CreatorScreen from './src/screens/CreatorScreen';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import HomeScreenV2 from './src/screens/HomeScreenV2';  // New enhanced home
import StudioScreen from './src/screens/StudioScreen';
import SynthScreen from './src/screens/SynthScreen';
import PresetsScreen from './src/screens/PresetsScreen';
import AccountScreen from './src/screens/AccountScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import EffectsControllerEnhanced from './src/components/EffectsControllerEnhanced';

// New Navigation Screens
import WorkspaceScreen from './src/screens/WorkspaceScreen';
import SynthsScreen from './src/screens/SynthsScreen';
import InstrumentsScreen from './src/screens/InstrumentsScreen';
import ModulationScreen from './src/screens/ModulationScreen';
import PlatformScreen from './src/screens/PlatformScreen';
import UserAccountScreen from './src/screens/UserAccountScreen';

// New Studio Screens
import StudioSelectorScreen from './src/screens/StudioSelectorScreen';
import BassStudioScreen from './src/screens/BassStudioScreen';
import ArpStudioScreen from './src/screens/ArpStudioScreen';
import WavetableStudioScreen from './src/screens/WavetableStudioScreen';
import EnhancedStudioScreen from './src/screens/EnhancedStudioScreen';
import OrchestralStudioScreen from './src/screens/OrchestralStudioScreen';
import ModulationLabScreen from './src/screens/ModulationLabScreen';
import PresetLaboratoryScreen from './src/screens/PresetLaboratoryScreen';

// Selector Screens
import SynthsSelectorScreen from './src/screens/SynthsSelectorScreen';
import DrumsSelectorScreen from './src/screens/DrumsSelectorScreen';
import BassSelectorScreen from './src/screens/BassSelectorScreen';
import EffectsSelectorScreen from './src/screens/EffectsSelectorScreen';
import DrumMachinesScreen from './src/screens/DrumMachinesScreen';
import BeatMakerScreen from './src/screens/BeatMakerScreen';

// Drum Machine Screens
import TR808Screen from './src/screens/TR808Screen';
import TR909Screen from './src/screens/TR909Screen';

// Synth Screens (Phase 1)
import DX7Screen from './src/screens/DX7Screen';
import MS20Screen from './src/screens/MS20Screen';
import Prophet5Screen from './src/screens/Prophet5Screen';
import TB303Screen from './src/screens/TB303Screen';

// Drum Machine Screens (Phase 2)
import LinnDrumScreen from './src/screens/LinnDrumScreen';
import CR78Screen from './src/screens/CR78Screen';
import DMXScreen from './src/screens/DMXScreen';

// New Instrument Screens (Phase 3)
import PianoScreen from './src/screens/PianoScreen';
import ViolinScreen from './src/screens/ViolinScreen';
import VocalsScreen from './src/screens/VocalsScreen';

// Synth Screens
import ARP2600Screen from './src/screens/ARP2600Screen';
import Juno106Screen from './src/screens/Juno106Screen';
import MinimoogScreen from './src/screens/MinimoogScreen';
import ModularSynthScreen from './src/screens/ModularSynthScreen';

// DAW Screens
import WorkspaceSelector from './src/screens/WorkspaceSelector';
import DAWStudio from './src/screens/DAWStudio';
import TechnoWorkspaceScreen from './src/screens/TechnoWorkspaceScreen';
import ModularWorkspaceScreen from './src/screens/ModularWorkspaceScreen';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// OLD TAB NAVIGATOR - Deprecated (kept for backward compatibility)
function TabNavigatorOld() {
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
        component={HomeScreenV2}
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
        name="Drums" 
        component={DrumsSelectorScreen}
        options={{
          title: 'DRUMS',
          tabBarLabel: 'DRUMS',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🥁</Text>,
        }}
      />
      <Tab.Screen 
        name="Synths" 
        component={SynthsSelectorScreen}
        options={{
          title: 'SYNTHS',
          tabBarLabel: 'SYNTHS',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🎹</Text>,
        }}
      />
      <Tab.Screen 
        name="Bass" 
        component={BassSelectorScreen}
        options={{
          title: 'BASS',
          tabBarLabel: 'BASS',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🎸</Text>,
        }}
      />
      <Tab.Screen 
        name="Effects" 
        component={EffectsSelectorScreen}
        options={{
          title: 'EFFECTS',
          tabBarLabel: 'EFFECTS',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🎚️</Text>,
        }}
      />
      <Tab.Screen 
        name="Premium" 
        component={PremiumScreen}
        options={{
          title: 'PREMIUM',
          tabBarLabel: 'PREMIUM',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>⭐</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

// NEW APP NAVIGATOR - Refactored Flow
function AppNavigator() {
  const [welcomeCompleted, setWelcomeCompleted] = useState(null);
  const { user, isLoading } = useAuth();

  // Check if user has completed welcome persona selection
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
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#050508', // HAOS dark background
        },
        headerTintColor: '#FF6B35', // HAOS orange
        cardStyle: { backgroundColor: '#050508' },
      }}
    >
      {/* NEW FLOW: Welcome Screen First (SSO Persona Selection) */}
      {!welcomeCompleted ? (
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={{ headerShown: false }}
          listeners={{
            focus: () => checkWelcomeStatus(), // Recheck when screen focuses
          }}
        />
      ) : null}
      
      {/* MAIN APP - 6 Tab Navigation */}
      <Stack.Screen 
        name="Main" 
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      
      {/* OLD FLOW - Kept for Legacy Support */}
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
          {/* LEGACY TAB NAVIGATOR - For backward compatibility */}
          <Stack.Screen 
            name="MainOld" 
            component={TabNavigatorOld}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="StudioSelector" 
            component={StudioSelectorScreen}
            options={{ 
              title: 'HAOS STUDIOS',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="BassStudio" 
            component={BassStudioScreen}
            options={{ 
              title: 'BASS STUDIO',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="ArpStudio" 
            component={ArpStudioScreen}
            options={{ 
              title: 'ARP STUDIO',
              headerShown: false,
            }}
          />
          
          {/* New Enhanced Navigation Screens */}
          <Stack.Screen 
            name="WorkspaceScreen" 
            component={WorkspaceScreen}
            options={{ 
              title: 'WORKSPACES',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="SynthsScreen" 
            component={SynthsScreen}
            options={{ 
              title: 'SYNTHESIZERS',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="InstrumentsScreen" 
            component={InstrumentsScreen}
            options={{ 
              title: 'INSTRUMENTS',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="ModulationScreen" 
            component={ModulationScreen}
            options={{ 
              title: 'MODULATION',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="PlatformScreen" 
            component={PlatformScreen}
            options={{ 
              title: 'PLATFORM',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="UserAccountScreen" 
            component={UserAccountScreen}
            options={{ 
              title: 'ACCOUNT',
              headerShown: false,
            }}
          />
          
          <Stack.Screen 
            name="WavetableStudio" 
            component={WavetableStudioScreen}
            options={{ 
              title: 'WAVETABLE STUDIO',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="EnhancedStudio" 
            component={EnhancedStudioScreen}
            options={{ 
              title: 'ENHANCED STUDIO',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="OrchestralStudio" 
            component={OrchestralStudioScreen}
            options={{ 
              title: 'ORCHESTRAL STUDIO',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="ModulationLab" 
            component={ModulationLabScreen}
            options={{ 
              title: 'MODULATION LAB',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="PresetLab" 
            component={PresetLaboratoryScreen}
            options={{ 
              title: 'ENHANCED STUDIO',
              headerShown: false,
            }}
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
          <Stack.Screen 
            name="TR808" 
            component={TR808Screen}
            options={{ 
              title: 'TR-808 RHYTHM COMPOSER',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="TR909" 
            component={TR909Screen}
            options={{ 
              title: 'TR-909 RHYTHM COMPOSER',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="ARP2600" 
            component={ARP2600Screen}
            options={{ 
              title: 'ARP 2600',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="Juno106" 
            component={Juno106Screen}
            options={{ 
              title: 'JUNO-106',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="Minimoog" 
            component={MinimoogScreen}
            options={{ 
              title: 'MINIMOOG',
              headerShown: false,
            }}
          />
          
          {/* New Selector Screens */}
          <Stack.Screen 
            name="SynthsSelector" 
            component={SynthsSelectorScreen}
            options={{ 
              title: 'SYNTHESIZERS',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="DrumsSelector" 
            component={DrumsSelectorScreen}
            options={{ 
              title: 'DRUM MACHINES',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="BassSelector" 
            component={BassSelectorScreen}
            options={{ 
              title: 'BASS STUDIO',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="EffectsSelector" 
            component={EffectsSelectorScreen}
            options={{ 
              title: 'EFFECTS',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="DrumMachines" 
            component={DrumMachinesScreen}
            options={{ 
              title: 'DRUM MACHINES OLD',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="BeatMaker" 
            component={BeatMakerScreen}
            options={{ 
              title: 'BEAT MAKER',
              headerShown: false,
            }}
          />
          
          {/* Phase 1: New Synth Screens */}
          <Stack.Screen 
            name="DX7" 
            component={DX7Screen}
            options={{ 
              title: 'DX7 FM SYNTHESIS',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="MS20" 
            component={MS20Screen}
            options={{ 
              title: 'MS-20 SEMI-MODULAR',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="Prophet5" 
            component={Prophet5Screen}
            options={{ 
              title: 'PROPHET-5',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="TB303" 
            component={TB303Screen}
            options={{ 
              title: 'TB-303 BASS LINE',
              headerShown: false,
            }}
          />
          
          {/* Phase 2: Drum Machine Screens */}
          <Stack.Screen 
            name="LinnDrum" 
            component={LinnDrumScreen}
            options={{ 
              title: 'LINNDRUM',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="CR78" 
            component={CR78Screen}
            options={{ 
              title: 'CR-78 COMPURHYTHM',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="DMX" 
            component={DMXScreen}
            options={{ 
              title: 'OBERHEIM DMX',
              headerShown: false,
            }}
          />
          
          {/* Phase 3: New Instrument Screens */}
          <Stack.Screen 
            name="Piano" 
            component={PianoScreen}
            options={{ 
              title: 'PIANO',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="Violin" 
            component={ViolinScreen}
            options={{ 
              title: 'VIOLIN',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="Vocals" 
            component={VocalsScreen}
            options={{ 
              title: 'VOCALS - AUTOTUNE',
              headerShown: false,
            }}
          />
          
          <Stack.Screen 
            name="WorkspaceSelector" 
            component={WorkspaceSelector}
            options={{ 
              title: 'SELECT STUDIO WORKSPACE',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="DAWStudio" 
            component={DAWStudio}
            options={{ 
              title: 'DAW STUDIO',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="TechnoWorkspace" 
            component={TechnoWorkspaceScreen}
            options={{ 
              title: 'TECHNO WORKSPACE',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="ModularSynth" 
            component={ModularSynthScreen}
            options={{ 
              title: 'MODULAR SYNTH',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="ModularWorkspace" 
            component={ModularWorkspaceScreen}
            options={{ 
              title: 'MODULAR WORKSPACE',
              headerShown: false,
            }}
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
