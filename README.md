# VibeCode - Pet Care Timer App

A React Native/Expo mobile application designed to help pet owners manage care schedules with intelligent notifications and AI-powered assistance.

## Features

- **Smart Timer System**: Set and manage care timers for your pets
- **Pet Profile Management**: Create detailed profiles for each of your pets
- **Intelligent Notifications**: Reliable notification system with background task support
- **Contact Management**: Emergency contacts and care provider information
- **AI Integration**: Built-in AI assistance for pet care guidance
- **Cross-Platform**: Works on both iOS and Android devices

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Styling**: TailwindCSS with NativeWind
- **State Management**: Zustand
- **Navigation**: React Navigation
- **AI Services**: OpenAI, Anthropic, Grok integration
- **Notifications**: Expo Notifications with background tasks
- **Storage**: Expo SecureStore, AsyncStorage, MMKV

## Project Structure

```
src/
├── api/                    # AI service integrations
│   ├── anthropic.ts       # Anthropic Claude API
│   ├── chat-service.ts    # Unified chat service
│   ├── grok.ts           # Grok API integration
│   ├── image-generation.ts # Image generation service
│   ├── openai.ts         # OpenAI API
│   └── transcribe-audio.ts # Audio transcription
├── components/            # Reusable UI components
│   ├── CustomTimerInput.tsx
│   ├── PetProfileDisplay.tsx
│   └── PetProfileSetup.tsx
├── navigation/           # App navigation setup
│   └── AppNavigator.tsx
├── screens/             # Main app screens
│   ├── CareInstructionsScreen.tsx
│   ├── ContactsScreen.tsx
│   └── TimerScreen.tsx
├── state/              # State management
│   └── petAlertStore.ts
├── types/              # TypeScript type definitions
│   └── ai.ts
└── utils/              # Utility functions
    ├── backgroundTasks.ts
    ├── cn.ts
    ├── notifications.ts
    ├── reliableNotifications.ts
    └── smsGateway.ts
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vibecode.git
cd vibecode
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web browser
```

### Environment Setup

This app integrates with several AI services. You'll need to set up API keys for:

- OpenAI API
- Anthropic API
- Grok API

Refer to the individual service files in `src/api/` for configuration details.

## Key Features

### Timer Management
- Create custom care timers for different pet needs
- Visual and audio notifications
- Background task support for reliable alerts

### Pet Profiles
- Detailed pet information storage
- Care instruction management
- Emergency contact integration

### AI Assistance
- Multi-provider AI integration
- Image analysis capabilities
- Audio transcription support
- Intelligent care recommendations

### Notifications
- Reliable notification system
- SMS gateway integration
- Background task scheduling
- Cross-platform notification support

## Development

### Building for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

### EAS Build (Recommended)

```bash
# Configure EAS
eas build:configure

# Build for all platforms
eas build --platform all
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For support and questions, please contact the development team.

---

Built with ❤️ for pet owners everywhere
