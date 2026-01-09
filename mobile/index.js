console.log('📱 index.js: TOP OF FILE - FIRST LINE - VERSION 2.0');
import { registerRootComponent } from 'expo';

console.log('📱 index.js: After registerRootComponent import');
import App from './App';

console.log('📱 index.js: After App import');

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

console.log('📱 index.js: After registerRootComponent call - END OF FILE');
