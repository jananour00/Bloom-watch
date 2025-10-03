'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AIPortal() {
  const [bloomData, setBloomData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch bloom prediction
      const bloomResponse = await fetch('http://localhost:5000/bloom_prediction');
      const bloomJson = await bloomResponse.json();
      setBloomData(bloomJson);

      // Fetch NDVI forecast
      const forecastResponse = await fetch('http://localhost:5000/api/forecast_ndvi');
      const forecastJson = await forecastResponse.json();
      setForecastData(forecastJson);

    } catch (err) {
      setError('Failed to fetch AI predictions. Make sure the backend is running on port 5000.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading AI Predictions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          AI Predictions Portal
        </h1>

        {bloomData && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Bloom Prediction Analysis
            </h2>
            <p className="mb-4 text-gray-600">
              Peak bloom day predicted: <strong>{bloomData.peak_bloom_day}</strong>
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={bloomData.dates.map((date, index) => ({
                date,
                actual: bloomData.actual_ndvi[index],
                predicted: bloomData.predicted_ndvi[index]
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="actual" stroke="#8884d8" strokeWidth={2} name="Actual NDVI" />
                <Line type="monotone" dataKey="predicted" stroke="#82ca9d" strokeWidth={2} name="Predicted NDVI" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {forecastData && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              NDVI Forecast
            </h2>
            <p className="mb-4 text-gray-600">
              Next predicted NDVI: <strong>{forecastData.predicted_ndvi.toFixed(3)}</strong>
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[{ name: 'Predicted NDVI', value: forecastData.predicted_ndvi }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-8 text-center text-gray-500">
          <p>This portal connects to the AI backend running on port 5000.</p>
          <p>Ensure the backend server is started to see live predictions.</p>
        </div>
      </div>
    </div>
  );
}
