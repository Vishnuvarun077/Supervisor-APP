import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MeterReadingTable from '../components/MeterReadingTable';

const MeterReadingScreen = () => {
    // Sample data for meter readings
    const meterReadings = [
        { id: '1', name: 'Meter Reading 1' },
        { id: '2', name: 'Meter Reading 2' },
        { id: '3', name: 'Meter Reading 3' },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Meter Readings</Text>
            <MeterReadingTable data={meterReadings} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});

export default MeterReadingScreen;