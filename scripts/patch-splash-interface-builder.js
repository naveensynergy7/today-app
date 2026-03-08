/**
 * Patches @expo/prebuild-config so iOS splash screen storyboard mod works when
 * xml2js produces a different structure (avoids "Cannot read properties of undefined (reading '0')").
 * See: [ios.splashScreenStoryboard]: withIosSplashScreenStoryboardBaseMod
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const file = path.join(
  root,
  'node_modules/@expo/prebuild-config/build/plugins/unversioned/expo-splash-screen/InterfaceBuilder.js'
);

if (!fs.existsSync(file)) return;

let content = fs.readFileSync(file, 'utf8');

const marker = 'const CONTAINER_ID = \'EXPO-ContainerView\';';
const alreadyPatched = 'function normalizeSplashXml(xml)';
if (content.includes(alreadyPatched)) {
  return; // already patched
}
if (!content.includes(marker)) {
  console.warn('patch-splash-interface-builder: expected marker not found, skipping');
  return;
}

const normalizeFn = `/** Normalize xml2js output so document.scenes, document.resources, and view.subviews/constraints are arrays (handles different xml2js versions/envs). */
function normalizeSplashXml(xml) {
  const doc = xml.document;
  if (!doc) return xml;
  if (!Array.isArray(doc.scenes)) doc.scenes = doc.scenes ? [doc.scenes] : [];
  if (!Array.isArray(doc.resources)) doc.resources = doc.resources ? [doc.resources] : [];
  const scenes0 = doc.scenes[0];
  if (!scenes0) return xml;
  if (!Array.isArray(scenes0.scene)) scenes0.scene = scenes0.scene ? [scenes0.scene] : [];
  const scene = scenes0.scene[0];
  if (!scene || !scene.objects) return xml;
  if (!Array.isArray(scene.objects)) scene.objects = scene.objects ? [scene.objects] : [];
  const objects0 = scene.objects[0];
  if (!objects0 || !objects0.viewController) return xml;
  if (!Array.isArray(objects0.viewController)) objects0.viewController = objects0.viewController ? [objects0.viewController] : [];
  const vc0 = objects0.viewController[0];
  if (!vc0 || !vc0.view) return xml;
  if (!Array.isArray(vc0.view)) vc0.view = vc0.view ? [vc0.view] : [];
  const view0 = vc0.view[0];
  if (!view0) return xml;
  if (!Array.isArray(view0.subviews)) view0.subviews = view0.subviews ? [view0.subviews] : [];
  if (!Array.isArray(view0.constraints)) view0.constraints = view0.constraints ? [view0.constraints] : [];
  if (view0.constraints.length === 0) view0.constraints.push({ constraint: [] });
  const constraints0 = view0.constraints[0];
  if (constraints0 && !Array.isArray(constraints0.constraint)) constraints0.constraint = constraints0.constraint ? [].concat(constraints0.constraint) : [];
  if (view0.subviews.length === 0) view0.subviews.push({ imageView: [] });
  const sub0 = view0.subviews[0];
  if (sub0 && !Array.isArray(sub0.imageView)) sub0.imageView = sub0.imageView ? [sub0.imageView] : [];
  const res0 = doc.resources[0];
  if (res0) {
    if (!Array.isArray(res0.image)) res0.image = res0.image ? [].concat(res0.image) : [];
    if (!Array.isArray(res0.namedColor)) res0.namedColor = res0.namedColor ? [].concat(res0.namedColor) : [];
  }
  return xml;
}

`;

// Insert normalizeSplashXml and call it at the start of removeImageFromSplashScreen and applyImageToSplashScreenXML
content = content.replace(
  marker + '\n\nfunction removeImageFromSplashScreen',
  marker + '\n\n' + normalizeFn + 'function removeImageFromSplashScreen'
);
content = content.replace(
  'function removeImageFromSplashScreen(xml, {\n  imageName\n}) {\n  const mainView',
  'function removeImageFromSplashScreen(xml, {\n  imageName\n}) {\n  normalizeSplashXml(xml);\n  const mainView'
);
content = content.replace(
  'function applyImageToSplashScreenXML(xml, {\n  imageName,\n  contentMode,\n  backgroundColor,\n  enableFullScreenImage,\n  imageWidth = 100\n}) {\n  const mainView',
  'function applyImageToSplashScreenXML(xml, {\n  imageName,\n  contentMode,\n  backgroundColor,\n  enableFullScreenImage,\n  imageWidth = 100\n}) {\n  normalizeSplashXml(xml);\n  const mainView'
);

fs.writeFileSync(file, content);
console.log('Patched: @expo/prebuild-config InterfaceBuilder.js (iOS splash screen)');
