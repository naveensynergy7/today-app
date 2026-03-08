#!/bin/bash
# Build and run on a connected iPhone using your Personal Team (free Apple ID).
# This passes -allowProvisioningUpdates so Xcode can create the provisioning profile.
set -e
cd "$(dirname "$0")/.."
ROOT=$(pwd)
cd ios

# Get first connected physical device
DEVICE=$(xcrun xctrace list devices 2>/dev/null | grep -E "iPhone|iPad" | grep -v "Simulator" | head -1 | sed 's/ *(.*//' | xargs) || true
if [ -z "$DEVICE" ]; then
  DEVICE=$(xcrun simctl list devices available 2>/dev/null | grep -v "unavailable" | grep -E "iPhone|iPad" | head -1 | sed 's/ *(.*//' | xargs) || true
fi
if [ -z "$DEVICE" ]; then
  echo "No device found. Connect your iPhone via USB and unlock it."
  exit 1
fi

echo "Building for device..."
xcodebuild \
  -workspace today.xcworkspace \
  -scheme today \
  -configuration Debug \
  -destination "generic/platform=iOS" \
  -allowProvisioningUpdates \
  -allowProvisioningDeviceRegistration \
  build

echo "Build succeeded. Install from Xcode: open today.xcworkspace, select your iPhone, then Product > Run"
echo "Or run: npx expo run:ios --device (after selecting your Personal Team in Xcode once)"
