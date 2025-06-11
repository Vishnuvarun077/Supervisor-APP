import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SupervisorIdForm = () => {
    const [supervisorId, setSupervisorId] = React.useState('');
    const navigation = useNavigation();

    const handleSubmit = () => {
        // Navigate to OTP screen after submitting supervisor ID
        navigation.navigate('OtpScreen');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeMessage}>Welcome, Supervisor!</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter Supervisor ID"
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
        alignItems: 'center',
        padding: 16,
    },
    welcomeMessage: {
        fontSize: 24,
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        width: '100%',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
});

export default SupervisorIdForm;