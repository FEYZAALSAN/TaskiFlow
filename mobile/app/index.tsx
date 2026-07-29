import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';

export default function Index() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('token').then((token) => {
      setTarget(token ? '/(tabs)/genel-bakis' : '/welcome');
    });
  }, []);

  if (!target) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return <Redirect href={target} />;
}
