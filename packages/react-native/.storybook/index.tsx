import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { view } from './storybook.requires';

const Storybook = view.getStorybookUI({});

const App = () => (
  <SafeAreaProvider>
    <Storybook />
  </SafeAreaProvider>
);

registerRootComponent(App);
