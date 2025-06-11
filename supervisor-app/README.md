# Supervisor App

This is a React Native application built using Expo CLI for supervisors to manage meter readers. The app consists of three main screens: a welcome screen for supervisor ID input, an OTP entry screen, and a screen displaying a table of meter reading names.

## Project Structure

```
supervisor-app
├── src
│   ├── components
│   │   ├── SupervisorIdForm.js
│   │   ├── OtpForm.js
│   │   └── MeterReadingTable.js
│   ├── screens
│   │   ├── WelcomeScreen.js
│   │   ├── OtpScreen.js
│   │   └── MeterReadingScreen.js
│   ├── navigation
│   │   └── AppNavigator.js
│   └── constants
│       └── Colors.js
├── App.js
├── app.json
├── package.json
├── babel.config.js
└── README.md
```

## Setup Instructions

1. **Install Node.js**: Ensure you have Node.js installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).

2. **Install Expo CLI**: Open your terminal and run the following command to install Expo CLI globally:
   ```
   npm install -g expo-cli
   ```

3. **Create a New Project**: Create a new Expo project by running:
   ```
   expo init supervisor-app
   ```
   Choose a blank template when prompted.

4. **Navigate to Project Directory**:
   ```
   cd supervisor-app
   ```

5. **Install Dependencies**: Install the necessary dependencies for React Navigation and other libraries:
   ```
   npm install @react-navigation/native @react-navigation/native-stack react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context @react-native-community/masked-view
   ```

6. **Set Up Navigation**: Make sure to wrap your app in a NavigationContainer in `App.js`.

7. **Create Directory Structure**: Inside the `src` folder, create the following directory structure:
   ```
   src/components
   src/screens
   src/navigation
   src/constants
   ```

8. **Create Files**: Create the necessary files as per the project structure outlined above.

9. **Run the App**: Start the development server by running:
   ```
   expo start
   ```
   Follow the instructions in the terminal to run the app on an emulator or a physical device.

## Usage

- **Welcome Screen**: The app starts with a welcome screen where the supervisor can enter their ID and submit it.
- **OTP Screen**: After submitting the supervisor ID, the user is navigated to the OTP entry screen to input the OTP.
- **Meter Reading Screen**: Upon successful OTP submission, the user is taken to a screen displaying a table of meter reading names.

## Contributing

Feel free to fork the repository and submit pull requests for any improvements or bug fixes.

## License

This project is licensed under the MIT License.