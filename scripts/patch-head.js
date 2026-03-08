/**
 * Patches React Native scripts that use `head -n 1` to use `/usr/bin/head -n 1`
 * so they work when PATH has XAMPP's HTTP client named "head" (e.g. on macOS with XAMPP).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const files = [
  'node_modules/react-native/third-party-podspecs/ReactNativeDependencies.podspec',
  'node_modules/react-native/sdks/hermes-engine/utils/build-hermes-xcode.sh',
  'node_modules/react-native/sdks/hermes-engine/utils/build-apple-framework.sh',
];

const wrong = '| head -n 1';
const fixed = '| /usr/bin/head -n 1';

for (const file of files) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) continue;
  let content = fs.readFileSync(abs, 'utf8');
  if (content.includes(wrong) && !content.includes(fixed)) {
    content = content.replace(/\| head -n 1/g, fixed);
    fs.writeFileSync(abs, content);
    console.log('Patched:', file);
  }
}
