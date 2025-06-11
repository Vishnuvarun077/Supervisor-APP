import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SupervisorIdForm = () => {
    const [supervisorId, setSupervisorId] = useState('');
    const navigation = useNavigation();

    const handleSubmit = () => {
        // Navigate to OTP screen
        navigation.navigate('OtpScreen', { supervisorId });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeMessage}>Welcome! Please enter your Supervisor ID:</Text>
            <TextInput
                style={styles.input}
                placeholder="Supervisor ID"
                value={supervisorId}
                onChangeText={setSupervisorId}
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
    welcomeMessage: {
        fontSize: 18,
        marginBottom: 20,
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

export default SupervisorIdForm;