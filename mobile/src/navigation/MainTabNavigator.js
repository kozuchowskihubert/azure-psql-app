/**
 * HAOS.fm V3 Navigation Structure
 * Main Tabs: CREATE /// V3 Optimized Tab Icons (smaller, cleaner)
const TabIcon = ({ name, color, focused }) => {
  const icons = {
    Create: '🎹',
    Studio: '�️',
    Library: '📚',
    Account: '👤',
  };/ LIBRARY / ACCOUNT
 * CREATE tab includes nested Stack Navigator for all instruments
 */

console.log('🧭 MainTabNavigator loading...');

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

console.log('🧭 MainTabNavigator about to import screens...');

// Main Tab Screens
import CreatorScreen from '../screens/CreatorScreen';
import StudioScreenNew from '../screens/StudioScreenNew';
import LibraryScreen from '../screens/LibraryScreen';
import AccountScreenNew from '../screens/AccountScreenNew';

// Instrument Screens (nested inside Create tab)
import ARP2600Screen from '../screens/ARP2600Screen';
import ViolinScreen from '../screens/ViolinScreen';
import PianoScreen from '../screens/PianoScreen';
import BassStudioScreen from '../screens/BassStudioScreen';
import BeatMakerScreen from '../screens/BeatMakerScreen';
// TEMPORARILY DISABLED - DAWStudio still has COLORS issue
// import DAWStudio from '../screens/DAWStudio';
import TR808Screen from '../screens/TR808Screen';
import TR909Screen from '../screens/TR909Screen';
import Juno106Screen from '../screens/Juno106Screen';
import MinimoogScreen from '../screens/MinimoogScreen';
import TB303Screen from '../screens/TB303Screen';
import ModularSynthScreen from '../screens/ModularSynthScreen';
import PatternStudioScreen from '../screens/PatternStudioScreen';
import SampleBrowserScreen from '../screens/SampleBrowserScreen';
import HipHopStudioScreen from '../screens/HipHopStudioScreen';
import GenreStudioSelectScreen from '../screens/GenreStudioSelectScreen';
import GenreStudioScreen from '../screens/GenreStudioScreen';
// DAW Studio temporarily disabled
// import DAWStudioScreen from '../screens/DAWStudioScreen';

console.log('✅ All screens imported');

const Tab = createBottomTabNavigator();
const CreateStack = createStackNavigator();

// HAOS V3 CREATOR Color System
const COLORS = {
  bgDark: '#000000',           // Pure black
  bgTab: 'rgba(15, 15, 15, 0.98)',
  gold: '#D4AF37',             // Primary gold
  goldLight: '#FFD700',
  orange: '#FF6B35',
  orangeLight: '#FF8C5A',
  gray: '#808080',
  grayDark: '#505050',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  border: 'rgba(212, 175, 55, 0.3)',
};

// V3 Optimized Tab Icons (smaller, cleaner)
const TabIcon = ({ name, color, focused }) => {
  const icons = {
    Create: '🎹',
    Studio: '🎛️',
    Library: '�',
    Account: '👤',
  };

  return (
    <View style={[
      styles.iconContainer,
      focused && styles.iconContainerFocused
    ]}>
      <Text style={[
        styles.icon,
        { opacity: focused ? 1 : 0.6 }
      ]}>
        {icons[name]}
      </Text>
      {focused && <View style={styles.focusIndicator} />}
    </View>
  );
};

// CREATE Tab Stack Navigator - contains all instrument screens
function CreateStackNavigator() {
  return (
    <CreateStack.Navigator
      screenOptions={{
        headerStyle: { 
          backgroundColor: '#000000',
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: '#D4AF37',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 16,
          letterSpacing: 1,
        },
        cardStyle: { backgroundColor: '#000000' },
      }}
    >
      {/* Main Create/Instruments Screen */}
      <CreateStack.Screen 
        name="CreatorHome" 
        component={CreatorScreen}
        options={{ headerShown: false }}
      />
      
      {/* SYNTHS */}
      <CreateStack.Screen 
        name="ARP2600Complete" 
        component={ARP2600Screen}
        options={{ title: 'ARP 2600', headerShown: false }}
      />
      <CreateStack.Screen 
        name="Juno106" 
        component={Juno106Screen}
        options={{ title: 'JUNO-106', headerShown: true }}
      />
      <CreateStack.Screen 
        name="Minimoog" 
        component={MinimoogScreen}
        options={{ title: 'MINIMOOG', headerShown: true }}
      />
      <CreateStack.Screen 
        name="TB303" 
        component={TB303Screen}
        options={{ title: 'TB-303', headerShown: true }}
      />
      <CreateStack.Screen 
        name="ModularSynth" 
        component={ModularSynthScreen}
        options={{ title: 'MODULAR', headerShown: true }}
      />
      <CreateStack.Screen 
        name="PatternStudio" 
        component={PatternStudioScreen}
        options={{ title: 'PATTERN STUDIO', headerShown: false }}
      />
      <CreateStack.Screen 
        name="SampleBrowser" 
        component={SampleBrowserScreen}
        options={{ title: 'SAMPLE BROWSER', headerShown: false }}
      />
      <CreateStack.Screen 
        name="HipHopStudio" 
        component={HipHopStudioScreen}
        options={{ title: 'HIP-HOP STUDIO', headerShown: false }}
      />
      <CreateStack.Screen 
        name="GenreStudioSelect" 
        component={GenreStudioSelectScreen}
        options={{ title: 'GENRE STUDIOS', headerShown: false }}
      />
      <CreateStack.Screen 
        name="GenreStudio" 
        component={GenreStudioScreen}
        options={{ title: 'GENRE STUDIO', headerShown: false }}
      />
      
      {/* INSTRUMENTS */}
      <CreateStack.Screen 
        name="Violin" 
        component={ViolinScreen}
        options={{ title: 'VIOLIN', headerShown: true }}
      />
      <CreateStack.Screen 
        name="Piano" 
        component={PianoScreen}
        options={{ title: 'PIANO', headerShown: true }}
      />
      
      {/* DRUMS */}
      <CreateStack.Screen 
        name="BeatMaker" 
        component={BeatMakerScreen}
        options={{ title: 'BEAT MAKER', headerShown: true }}
      />
      <CreateStack.Screen 
        name="TR808" 
        component={TR808Screen}
        options={{ title: 'TR-808', headerShown: true }}
      />
      <CreateStack.Screen 
        name="TR909" 
        component={TR909Screen}
        options={{ title: 'TR-909', headerShown: true }}
      />
      
      {/* BASS */}
      <CreateStack.Screen 
        name="BassStudio" 
        component={BassStudioScreen}
        options={{ title: 'BASS STUDIO', headerShown: true }}
      />
      
      {/* PRODUCTION - TEMPORARILY DISABLED DUE TO COLORS ERROR
      <CreateStack.Screen 
        name="DAWStudio" 
        component={DAWStudio}
        options={{ title: 'DAW STUDIO', headerShown: true }}
      />
      */}
    </CreateStack.Navigator>
  );
}

function MainTabNavigator({ route }) {
  const { initialRoute = 'Create', persona = 'musician' } = route.params || {};
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName={initialRoute}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, focused }) => (
          <TabIcon name={route.name} color={color} focused={focused} />
        ),
        tabBarStyle: {
          backgroundColor: COLORS.bgTab,
          borderTopColor: COLORS.border,
          borderTopWidth: 1.5,
          height: 80 + insets.bottom, // Increased height for better spacing
          paddingBottom: insets.bottom + 8, // More padding at bottom
          paddingTop: 12, // More padding at top
          shadowColor: COLORS.gold,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 15,
        },
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 1,
          marginTop: 6, // More space between icon and label
          marginBottom: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          minHeight: 70, // Ensure minimum height for each tab item
        },
      })}
    >
      <Tab.Screen
        name="Create"
        component={CreateStackNavigator}
        options={{
          tabBarLabel: 'CREATE',
          title: 'HAOS CREATE',
        }}
      />
      <Tab.Screen
        name="Studio"
        component={StudioScreenNew}
        options={{
          tabBarLabel: 'STUDIO',
          title: 'HAOS STUDIO',
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'LIBRARY',
          title: 'LIBRARY',
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreenNew}
        options={{
          tabBarLabel: 'ACCOUNT',
          title: 'ACCOUNT',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 6,
    minHeight: 32, // Ensure icon has enough space
  },
  iconContainerFocused: {
    transform: [{ scale: 1.15 }],
  },
  icon: {
    fontSize: 22, // Reduced from 26px - fits better
  },
  focusIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37', // COLORS.gold
    shadowColor: '#D4AF37', // COLORS.gold
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
});

export default MainTabNavigator;
