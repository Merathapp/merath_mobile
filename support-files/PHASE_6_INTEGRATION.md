# Phase 6: App Integration, Navigation & Deployment

**Status:** 🚀 Starting  
**Estimated Duration:** 6-8 hours  
**Target Completion:** Production Ready  
**Progress:** 0%

---

## Executive Summary

Phase 6 focuses on integrating all completed components into the main application, setting up navigation, configuring deep linking, and preparing for production deployment. This phase transforms the component library into a complete functional application.

---

## Phase 6 Objectives

### 1. ✅ App Integration (2-3 hours)
- [ ] Configure main app entry point (App.tsx)
- [ ] Set up React Navigation (bottom tabs)
- [ ] Integrate CalculatorScreen as primary tab
- [ ] Create placeholder screens for other tabs
- [ ] Configure navigation state management

### 2. ✅ Navigation Setup (1-2 hours)
- [ ] Install @react-navigation packages
- [ ] Create navigation structure
- [ ] Add navigation types (TypeScript)
- [ ] Implement navigation linking
- [ ] Add back button handling

### 3. ✅ Deep Linking (1-2 hours)
- [ ] Configure deep linking config
- [ ] Add app-specific routes
- [ ] Test deep link functionality
- [ ] Set up URL schemes

### 4. ✅ Deployment Preparation (1-2 hours)
- [ ] Review app.config.ts settings
- [ ] Set build version numbers
- [ ] Configure EAS settings (eas.json)
- [ ] Create APK/AAB build config
- [ ] Add production environment variables

### 5. ✅ Testing & QA (1-2 hours)
- [ ] Integration tests
- [ ] End-to-end user flows
- [ ] Device compatibility testing
- [ ] Performance profiling

---

## Deliverables

### Code Files to Create/Modify

| File | Type | Purpose | Lines | Priority |
|------|------|---------|-------|----------|
| App.tsx | Create | Main app entry point | ~150 | High |
| screens/HomeScreen.tsx | Create | Tab navigation | ~100 | Medium |
| navigation/RootNavigator.tsx | Create | Navigation setup | ~80 | High |
| navigation/types.ts | Create | Navigation types | ~40 | High |
| navigation/linking.ts | Create | Deep linking config | ~60 | Medium |
| app.config.ts | Modify | Update versioning | ~20 | High |
| eas.json | Modify | Configure build | ~15 | Medium |
| __tests__/integration.test.ts | Create | Integration tests | ~200 | High |

**Total New Code:** ~665 lines

### Test Coverage

| Category | Tests | Target |
|----------|-------|--------|
| Navigation | 8-10 | ✅ |
| Integration | 10-12 | ✅ |
| Deep Linking | 4-6 | ✅ |
| E2E Flows | 6-8 | ✅ |
| **Total** | **28-36** | **100%** |

---

## Implementation Plan

### Step 1: Navigation Setup (1 hour)

#### Create navigation/types.ts
```typescript
// Navigation type definitions
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  MainApp: undefined;
  Details: { id: string };
};

export type TabParamList = {
  Calculator: undefined;
  History: undefined;
  Settings: undefined;
  About: undefined;
};

export type NavigationProp = BottomTabNavigationProp<TabParamList>;
export type StackProp = NativeStackNavigationProp<RootStackParamList>;
```

#### Create navigation/RootNavigator.tsx
```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';

import CalculatorScreen from '../screens/CalculatorScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Calculator') {
            iconName = focused ? 'calculator' : 'calculator-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'history' : 'history-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = focused ? 'information-circle' : 'information-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
      })}
    >
      <Tab.Screen
        name="Calculator"
        component={CalculatorScreen}
        options={{
          title: 'حاسبة المواريث',
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'السجل',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'الإعدادات',
        }}
      />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: 'حول التطبيق',
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="MainApp"
          component={TabNavigator}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Step 2: Create Missing Screens (1 hour)

#### Create screens/HistoryScreen.tsx
```typescript
import React from 'react';
import { View, Text } from 'react-native';
import CalculationHistory from '../components/CalculationHistory';

export default function HistoryScreen() {
  return (
    <View style={{ flex: 1 }}>
      <CalculationHistory />
    </View>
  );
}
```

#### Create screens/SettingsScreen.tsx
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>الإعدادات</Text>
      <Text style={styles.subtitle}>قرب جداً - قيد التطوير</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
});
```

#### Create screens/AboutScreen.tsx
```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>حول حاسبة المواريث</Text>
        <Text style={styles.version}>الإصدار 1.0.0</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>الوصف</Text>
        <Text style={styles.text}>
          تطبيق شامل لحساب المواريث وفقاً لأحكام الشريعة الإسلامية، مع دعم المذاهب الفقهية الأربعة:
          الحنفي، المالكي، الشافعي، والحنبلي.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>الميزات</Text>
        <Text style={styles.text}>• حسابات دقيقة لتقسيم التركات</Text>
        <Text style={styles.text}>• دعم جميع الحالات الشرعية</Text>
        <Text style={styles.text}>• دعم المذاهب الفقهية الأربعة</Text>
        <Text style={styles.text}>• سجل التطبيقات والعمليات</Text>
        <Text style={styles.text}>• واجهة سهلة الاستخدام</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>الحقوق</Text>
        <Text style={styles.text}>© 2026 Merath. جميع الحقوق محفوظة</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  version: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 8,
  },
});
```

### Step 3: Main App Entry Point (30 minutes)

#### Modify/Create App.tsx
```typescript
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
      <StatusBar barStyle="dark-content" />
    </GestureHandlerRootView>
  );
}
```

### Step 4: Deep Linking Configuration (1 hour)

#### Create navigation/linking.ts
```typescript
import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');

export const linking = {
  prefixes: [prefix, 'merath://', 'https://merath.app'],
  config: {
    screens: {
      MainApp: {
        screens: {
          Calculator: 'calculator',
          History: 'history',
          Settings: 'settings',
          About: 'about',
        },
      },
      Details: 'details/:id',
    },
  },
};
```

### Step 5: Build Configuration

#### Update app.config.ts
```typescript
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Merath',
  slug: 'merath-calculator',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'merath',
  userInterfaceStyle: 'light',
  backgroundColor: '#FFFFFF',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#4F46E5',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTabletMode: true,
    bundleIdentifier: 'com.merath.calculator',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#4F46E5',
    },
    package: 'com.merath.calculator',
    versionCode: 1,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-build-properties',
      {
        android: {
          enableProguardInReleaseBuilds: true,
        },
      },
    ],
  ],
});
```

---

## Testing Strategy

### Integration Tests (integration.test.ts)

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { RootNavigator } from '../navigation/RootNavigator';

describe('App Integration', () => {
  // Navigation tests
  // Deep linking tests
  // Screen rendering tests
  // State management tests
});
```

---

## Quality Checklist

### Pre-Deployment

- [ ] All navigation working
- [ ] All screens rendering
- [ ] Deep links functional
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Performance > 60 FPS
- [ ] Bundle size < 50MB

### Android Build

- [ ] APK builds successfully
- [ ] AAB builds successfully
- [ ] Manifest configured
- [ ] Permissions set correctly
- [ ] Icons/assets included
- [ ] Version number correct

### iOS Build (if applicable)

- [ ] IPA builds successfully
- [ ] Certificates valid
- [ ] Provisioning profiles set
- [ ] Icons/assets included

---

## Timeline

| Task | Hours | Start | End | Status |
|------|-------|-------|-----|--------|
| Navigation Setup | 1 | - | - | 🔴 Pending |
| Screen Creation | 1 | - | - | 🔴 Pending |
| App Entry Point | 0.5 | - | - | 🔴 Pending |
| Deep Linking | 1 | - | - | 🔴 Pending |
| Build Config | 1 | - | - | 🔴 Pending |
| Integration Tests | 2 | - | - | 🔴 Pending |
| QA & Testing | 1.5 | - | - | 🔴 Pending |
| **Total** | **7.5** | - | - | 🔴 **Pending** |

---

## Success Criteria

✅ **All screens navigable via bottom tabs**  
✅ **Deep linking working for all routes**  
✅ **No TypeScript errors or warnings**  
✅ **All 28+ integration tests passing**  
✅ **APK/AAB builds successfully**  
✅ **Performance meets standards (60 FPS)**  
✅ **App runs on Android 8+**  
✅ **Zero runtime errors**

---

## Dependencies to Add

```json
{
  "@react-navigation/native": "^6.x",
  "@react-navigation/bottom-tabs": "^6.x",
  "@react-navigation/native-stack": "^6.x",
  "react-native-screens": "~3.x",
  "react-native-safe-area-context": "4.x",
  "react-native-gesture-handler": "~2.x"
}
```

---

## Post-Phase 6 (Phase 7 Preview)

### Potential Future Enhancements:
- Advanced settings (theme, language)
- Cloud sync/backup
- Sharing results
- Notifications
- Analytics
- In-app help/tutorials

---

**Generated:** January 2026  
**Status:** 🚀 Ready to Start  
**Target Completion:** 7.5-8 hours  
**Next Review:** After Step 1
