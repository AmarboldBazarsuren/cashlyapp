/**
 * CASHLY APP - Entry Point
 * БАЙРШИЛ: Cashly.mn/App/index.js
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);