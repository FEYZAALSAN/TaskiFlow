// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navigation
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',

  // Tabs
  'checklist': 'checklist',
  'bell.fill': 'notifications',
  'person.fill': 'person',

  // Dashboard
  'folder.fill': 'folder',
  'chart.bar.fill': 'bar-chart',
  'sparkles': 'auto-awesome',
  'checkmark.seal.fill': 'verified',
  'plus.circle.fill': 'add-circle',
  'plus.square.fill': 'add-box',

  // Tasks
  'magnifyingglass': 'search',
  'plus': 'add',
  'checkmark': 'check',
  'tray': 'inbox',

  // Notifications
  'person.badge.plus': 'person-add',
  'clock.fill': 'schedule',
  'text.bubble.fill': 'chat',
  'star.fill': 'star',

  // Profile
  'lock.fill': 'lock',
  'envelope.fill': 'email',
  'moon.fill': 'dark-mode',
  'globe': 'language',
  'questionmark.circle.fill': 'help',
  'doc.text.fill': 'description',
  'rectangle.portrait.and.arrow.right': 'logout',
  'building.2.fill': 'business',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
