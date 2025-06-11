import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const OtpForm = ({ navigation }) => {
    const [otp, setOtp] = useState('');

    const handleSubmit = () => {
        // Here you would typically validate the OTP and navigate to the MeterReadingScreen
        navigation.navigate('MeterReadingScreen');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.message}>Please enter the OTP sent to your registered mobile number.</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
            />
            <Button title="Submit" onPress={handleSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    message: {
        marginBottom: 20,
        fontSize: 16,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
});

export default OtpForm;