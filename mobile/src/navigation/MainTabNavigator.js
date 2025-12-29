/**
 * HAOS.fm V3 Navigation Structure
 * Main Tabs: CREATE / STUDIO / LIBRARY / ACCOUNT
 * CREATOR Theme - Gold/Silver/Orange Design
 * Mobile DAW Interface - No Cut-off Icons/Labels
 */

console.log('🧭 MainTabNavigator loading...');

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

console.log('🧭 MainTabNavigator about to import screens...');

// Import screen structure
import CreatorScreen from '../screens/CreatorScreen';

console.log('✅ CreatorScreen imported');

import StudioScreenNew from '../screens/StudioScreenNew';

console.log('✅ StudioScreenNew imported');

import LibraryScreen from '../screens/LibraryScreen';

console.log('✅ LibraryScreen imported');

import AccountScreenNew from '../screens/AccountScreenNew';

console.log('✅ AccountScreenNew imported');
console.log('🎉 MainTabNavigator all screens imported!');

const Tab = createBottomTabNavigator();

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
        component={CreatorScreen}
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
