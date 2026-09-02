# KasiCapital

A React Native mobile application with MTN MoMo branding (yellow & blue color scheme).

## Development Environment

### Prerequisites

| Tool | Version | Path |
|------|---------|------|
| Node.js | >= 22.11.0 | System |
| OpenJDK | 17.0.13 (Temurin) | `~/jdk17` |
| Android SDK | 37.0 | `~/Android/Sdk` |
| Build Tools | 37.0.0 | `~/Android/Sdk/build-tools/37.0.0` |
| Platform Tools | 37.0.1 | `~/Android/Sdk/platform-tools` |
| Android Platform | 37.0 | `~/Android/Sdk/platforms/android-37.0` |

### Environment Variables

Added to `~/.bashrc`:

```bash
export JAVA_HOME=$HOME/jdk17
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/37.0.0:$PATH
```

Run `source ~/.bashrc` to load them in a new terminal.

## Getting Started

```bash
# Install JS dependencies
npm install

# Start Metro bundler
npm start

# In a new terminal, build and run on Android
npm run android
```

## Running on Device

1. Enable **Developer Options** on your Android device
2. Enable **USB Debugging**
3. Connect via USB and verify with `adb devices`
4. Run `npm run android`

## Project Structure

```
src/
  screens/
    HomeScreen.tsx   # Main home screen with MTN MoMo branding
  theme/
    colors.ts        # MTN color palette (yellow #FFCC00, blue #3777FF)
    index.ts         # Shared styles and theme exports
```

## Color Scheme

| Name | Hex | Usage |
|------|-----|-------|
| MTN Yellow | `#FFCC00` | Primary brand, headers, accents |
| MTN Blue | `#3777FF` | Cards, primary actions |
| Dark Blue | `#1E5FD6` | Text on yellow backgrounds |
