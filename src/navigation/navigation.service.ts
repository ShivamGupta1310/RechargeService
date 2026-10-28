import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

class NavigationService {
  navigate(route: keyof RootStackParamList) {
    if (navigationRef.isReady()) {
      if (route === 'Wallet') {
        navigationRef.navigate('Wallet');
      } else {
        navigationRef.navigate('RechargeHistory');
      }
    }
  }

  goBack() {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  }
}

export const navigationService = new NavigationService();
