/**
 * HAOS.fm Main Navigation Structure
 * 6 Main Tabs: CREATOR / STUDIO / INSTRUMENTS / SOUNDS / DOCU / ACCOUNT
 * Mobile DAW Interface
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import screen structure
import CreatorScreen from '../screens/CreatorScreen';
import StudioScreenNew from '../screens/StudioScreenNew';
import InstrumentsScreen from '../screens/InstrumentsScreen';
import SoundsScreen from '../screens/SoundsScreen';
import DocuScreen from '../screens/DocuScreen';
import AccountScreenNew from '../screens/AccountScreenNew';

const Tab = createBottomTabNavigator();

// HAOS Color System
const COLORS = {
  bgDark: '#050508',
  bgTab: 'rgba(10, 10, 10, 0.95)',
  orange: '#FF6B35',
  orangeLight: '#FF8C5A',
  gray: '#808080',
  grayDark: '#404040',
  textPrimary: '#F4E8D8',
  textSecondary: 'rgba(244, 232, 216, 0.6)',
  border: 'rgba(255, 107, 53, 0.2)',
};

// Monolithic emoji icons (modern style)
const TabIcon = ({ name, color, focused }) => {
  const icons = {
    Creator: '🎹',
    Studio: '🎛️',
    Instruments: '🎸',
    Sounds: '🔊',
    Docu: '📖',
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
  const { initialRoute = 'Creator', persona = 'musician' } = route.params || {};

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
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          shadowColor: COLORS.orange,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarActiveTintColor: COLORS.orange,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
      })}
    >
      <Tab.Screen
        name="Creator"
        component={CreatorScreen}
        options={{
          tabBarLabel: 'CREATOR',
          title: 'HAOS CREATOR',
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
        name="Instruments"
        component={InstrumentsScreen}
        options={{
          tabBarLabel: 'INSTRUMENTS',
          title: 'INSTRUMENTS',
        }}
      />
      <Tab.Screen
        name="Sounds"
        component={SoundsScreen}
        options={{
          tabBarLabel: 'SOUNDS',
          title: 'SOUND LIBRARY',
        }}
      />
      <Tab.Screen
        name="Docu"
        component={DocuScreen}
        options={{
          tabBarLabel: 'DOCU',
          title: 'DOCUMENTATION',
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
    paddingVertical: 4,
  },
  iconContainerFocused: {
    transform: [{ scale: 1.1 }],
  },
  icon: {
    fontSize: 26,
  },
  focusIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.orange,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});

export default MainTabNavigator;
