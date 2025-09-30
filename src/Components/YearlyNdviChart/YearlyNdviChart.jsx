import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// A simple mapping from month number to a short name for the chart's X-axis
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function YearlyNdviChart({ data }) {
    // Process the raw event data to get the average NDVI for each month
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Group events by month and calculate the sum and count
        const monthlyData = data.reduce((acc, event) => {
            const monthIndex = event.month - 1; // month is 1-12, index is 0-11
            if (!acc[monthIndex]) {
                acc[monthIndex] = { ndviSum: 0, count: 0 };
            }
            acc[monthIndex].ndviSum += event.NDVI;
            acc[monthIndex].count++;
            return acc;
        }, []);

        // Calculate the average NDVI, convert to percentage, and format for the chart
        return monthNames.map((name, index) => {
            const month = monthlyData[index];
            const averageNdvi = month ? (month.ndviSum / month.count) : 0;
            const percentageNdvi = averageNdvi * 100;

            return {
                month: name,
                // Round to 2 decimals and use a more descriptive key
                "NDVI (%)": parseFloat(percentageNdvi.toFixed(2)),
            };
        });
    }, [data]);

    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart
                data={chartData}
                margin={{
                    top: 5,
                    right: 20,
                    left: -10, // Adjust for better alignment
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                {/* Add the '%' unit to the Y-axis */}
                <YAxis tick={{ fontSize: 12 }} unit="%" />
                {/* Format the tooltip to show the percentage */}
                <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                <Legend />
                <Line type="monotone" dataKey="NDVI (%)" stroke="#27ae60" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
}

export default YearlyNdviChart;

