import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const widthScale = width / 375;
const heightScale = height / 812;

export const scale = (value: number) => Math.round(value * widthScale);
export const verticalScale = (value: number) => Math.round(value * heightScale);
