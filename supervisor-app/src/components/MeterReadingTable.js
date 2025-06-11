export default function MeterReadingTable({ meterReadings }) {
    return (
        <div>
            <h2>Meter Reading Names</h2>
            <table>
                <thead>
                    <tr>
                        <th>Meter Reading Name</th>
                    </tr>
                </thead>
                <tbody>
                    {meterReadings.map((reading, index) => (
                        <tr key={index}>
                            <td>{reading}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}