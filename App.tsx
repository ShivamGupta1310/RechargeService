/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RechargeHistoryScreen } from './src/screens/recharge-history/recharge-history.screen';
import { WalletScreen } from './src/screens/wallet/wallet.screen';
import { navigationRef } from './src/navigation/navigation.service';
import { RootStackParamList } from './src/types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Wallet" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Wallet" component={WalletScreen} />
          <Stack.Screen name="RechargeHistory" component={RechargeHistoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
