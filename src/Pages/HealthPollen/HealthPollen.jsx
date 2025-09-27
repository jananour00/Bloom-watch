import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import styles from './HealthPollen.module.css';


const allergyData = [
  { name: 'Pollen', count: 245, percentage: 35 },
  { name: 'Grass', count: 189, percentage: 27 },
  { name: 'Trees', count: 156, percentage: 22 },
  { name: 'Weeds', count: 112, percentage: 16 }
];

const seasonalTrends = [
  { month: 'Jan', allergies: 45, blooms: 12 },
  { month: 'Feb', allergies: 52, blooms: 18 },
  { month: 'Mar', allergies: 78, blooms: 35 },
  { month: 'Apr', allergies: 124, blooms: 67 },
  { month: 'May', allergies: 156, blooms: 89 },
  { month: 'Jun', allergies: 134, blooms: 78 },
  { month: 'Jul', allergies: 98, blooms: 45 },
  { month: 'Aug', allergies: 87, blooms: 34 },
  { month: 'Sep', allergies: 65, blooms: 23 },
  { month: 'Oct', allergies: 43, blooms: 15 },
  { month: 'Nov', allergies: 34, blooms: 8 },
  { month: 'Dec', allergies: 29, blooms: 5 }
];

const cropYieldData = [
  { crop: 'Wheat', currentYear: 85, lastYear: 78, optimal: 92 },
  { crop: 'Corn', currentYear: 91, lastYear: 87, optimal: 95 },
  { crop: 'Rice', currentYear: 76, lastYear: 82, optimal: 88 },
  { crop: 'Soybeans', currentYear: 88, lastYear: 84, optimal: 90 }
];

const floweringStages = [
  { stage: 'Pre-bloom', value: 25, color: '#FFE5E5' },
  { stage: 'Early bloom', value: 35, color: '#F2AEBB' },
  { stage: 'Peak bloom', value: 30, color: '#E85A4F' },
  { stage: 'Late bloom', value: 10, color: '#C73E1D' }
];

const healthAdvices = [
  "Monitor daily pollen counts and limit outdoor activities during peak hours (6-10 AM).",
  "Keep windows closed during high pollen days and use air conditioning with clean filters.",
  "Shower and change clothes after spending time outdoors to remove pollen.",
  "Consider taking antihistamines before allergy season begins, as recommended by your doctor.",
  "Wear wraparound sunglasses and a hat when outdoors to reduce pollen exposure.",
  "Use a HEPA air purifier in your bedroom and main living areas.",
  "Track your symptoms with weather patterns to identify your personal triggers.",
  "Rinse your nasal passages with saline solution to flush out allergens."
];

const HealthPollen = () => {
  const [currentView, setCurrentView] = useState('choice');
  const [healthFormData, setHealthFormData] = useState({
    name: '',
    allergies: '',
    location: '',
    coordinates: '',
    floweringState: '',
    photo: null
  });
  const [agriculturalFormData, setAgriculturalFormData] = useState({
    name: '',
    place: ''
  });
  const [showHealthResults, setShowHealthResults] = useState(false);
  const [showAgriculturalResults, setShowAgriculturalResults] = useState(false);

  const handleHealthFormSubmit = (e) => {
    e.preventDefault();
    setShowHealthResults(true);
  };

  const handleAgriculturalFormSubmit = (e) => {
    e.preventDefault();
    setShowAgriculturalResults(true);
  };

  const ChoiceScreen = () => (
    <div className={styles.container}>
      <div className={styles.choiceContainer}>
        <div className={styles.choiceHeader}>
          <h1 className={styles.mainTitle}>BloomWatch Services</h1>
          <p className={styles.subtitle}>Choose your area of interest to get personalized insights</p>
        </div>
        
        <div className={styles.choiceCards}>
          <div 
            className={styles.choiceCard}
            onClick={() => setCurrentView('health')}
          >
            <div className={styles.choiceIcon}>🏥</div>
            <h3 className={styles.cardTitle}>Health & Allergy Monitoring</h3>
            <p className={styles.cardDescription}>Track pollen levels, manage allergies, and get personalized health recommendations based on bloom patterns in your area.</p>
            <button className={styles.choiceButton}>Get Health Insights</button>
          </div>
          
          <div 
            className={styles.choiceCard}
            onClick={() => setCurrentView('agricultural')}
          >
            <div className={styles.choiceIcon}>🌾</div>
            <h3 className={styles.cardTitle}>Agricultural Monitoring</h3>
            <p className={styles.cardDescription}>Monitor crop flowering patterns, optimize harvest timing, and improve agricultural productivity with satellite data.</p>
            <button className={styles.choiceButton}>Get Agricultural Data</button>
          </div>
        </div>
      </div>
    </div>
  );

  const HealthForm = () => (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <button 
          className={styles.backButton}
          onClick={() => setCurrentView('choice')}
        >
          ← Back to Services
        </button>
        
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>Health & Allergy Assessment</h2>
          <p className={styles.subtitle}>Help us understand your allergy concerns to provide personalized insights</p>
        </div>

        <div className={styles.healthForm}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name *</label>
            <input
              type="text"
              className={styles.input}
              value={healthFormData.name}
              onChange={(e) => setHealthFormData({...healthFormData, name: e.target.value})}
              placeholder="Enter your full name"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>What are you allergic to? *</label>
            <select
              className={styles.select}
              value={healthFormData.allergies}
              onChange={(e) => setHealthFormData({...healthFormData, allergies: e.target.value})}
            >
              <option value="">Select your main allergy</option>
              <option value="pollen">Pollen</option>
              <option value="grass">Grass</option>
              <option value="trees">Trees</option>
              <option value="weeds">Weeds</option>
              <option value="multiple">Multiple allergens</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Where do you live? *</label>
            <input
              type="text"
              className={styles.input}
              value={healthFormData.location}
              onChange={(e) => setHealthFormData({...healthFormData, location: e.target.value})}
              placeholder="City, Country"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Coordinates of nearest farm/land *</label>
            <input
              type="text"
              className={styles.input}
              value={healthFormData.coordinates}
              onChange={(e) => setHealthFormData({...healthFormData, coordinates: e.target.value})}
              placeholder="e.g., 40.7128, -74.0060"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Current flowering state (Optional)</label>
            <select
              className={styles.select}
              value={healthFormData.floweringState}
              onChange={(e) => setHealthFormData({...healthFormData, floweringState: e.target.value})}
            >
              <option value="">Select flowering state</option>
              <option value="pre-bloom">Pre-bloom</option>
              <option value="early-bloom">Early bloom</option>
              <option value="peak-bloom">Peak bloom</option>
              <option value="late-bloom">Late bloom</option>
              <option value="post-bloom">Post-bloom</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Upload photo (Optional)</label>
            <input
              type="file"
              className={styles.input}
              accept="image/*"
              onChange={(e) => setHealthFormData({...healthFormData, photo: e.target.files[0]})}
            />
          </div>

          <button 
            className={styles.submitButton}
            onClick={handleHealthFormSubmit}
          >
            Get My Health Insights
          </button>
        </div>
      </div>
    </div>
  );

  const HealthResults = () => (
    <div className={styles.container}>
      <div className={styles.resultsContainer}>
        <button 
          className={styles.backButton}
          onClick={() => setShowHealthResults(false)}
        >
          ← Back to Form
        </button>
        
        <div className={styles.resultsHeader}>
          <h2 className={styles.formTitle}>Your Health Insights, {healthFormData.name}</h2>
          <p className={styles.subtitle}>Based on your location and allergy profile</p>
        </div>

        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Allergy Distribution in Your Area</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={allergyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#F2AEBB" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Seasonal Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={seasonalTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="allergies" stroke="#F2AEBB" strokeWidth={3} />
                <Line type="monotone" dataKey="blooms" stroke="#E85A4F" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Current Flowering Stages</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={floweringStages}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({stage, value}) => `${stage}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {floweringStages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.adviceSection}>
          <h3 className={styles.chartTitle}>Personalized Health Recommendations</h3>
          <div className={styles.adviceGrid}>
            {healthAdvices.slice(0, 6).map((advice, index) => (
              <div key={index} className={styles.adviceCard}>
                <div className={styles.adviceNumber}>{index + 1}</div>
                <p className={styles.advices}>{advice}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const AgriculturalForm = () => (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <button 
          className={styles.backButton}
          onClick={() => setCurrentView('choice')}
        >
          ← Back to Services
        </button>
        
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>Agricultural Monitoring Setup</h2>
          <p className={styles.subtitle}>Get insights about crop flowering and agricultural productivity in your area</p>
        </div>

        <div className={styles.healthForm}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Farm/Organization Name *</label>
            <input
              type="text"
              className={styles.input}
              value={agriculturalFormData.name}
              onChange={(e) => setAgriculturalFormData({...agriculturalFormData, name: e.target.value})}
              placeholder="Enter farm or organization name"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Farm Location *</label>
            <input
              type="text"
              className={styles.input}
              value={agriculturalFormData.place}
              onChange={(e) => setAgriculturalFormData({...agriculturalFormData, place: e.target.value})}
              placeholder="City, State, Country"
            />
          </div>

          <button 
            className={styles.submitButton}
            onClick={handleAgriculturalFormSubmit}
          >
            Get Agricultural Data
          </button>
        </div>
      </div>
    </div>
  );

  const AgriculturalResults = () => (
    <div className={styles.container}>
      <div className={styles.resultsContainer}>
        <button 
          className={styles.backButton}
          onClick={() => setShowAgriculturalResults(false)}
        >
          ← Back to Form
        </button>
        
        <div className={styles.resultsHeader}>
          <h2 className={styles.formTitle}>Agricultural Insights for {agriculturalFormData.name}</h2>
          <p className={styles.subtitle}>Crop flowering patterns and yield analysis for {agriculturalFormData.place}</p>
        </div>

        <div className={styles.chartsGrid}>
          <div className={`${styles.chartCard} ${styles.fullWidth}`}>
            <h3 className={styles.chartTitle}>Crop Yield Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={cropYieldData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="crop" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="currentYear" fill="#F2AEBB" name="Current Year" />
                <Bar dataKey="lastYear" fill="#E85A4F" name="Last Year" />
                <Bar dataKey="optimal" fill="#C73E1D" name="Optimal Yield" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Flowering Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={floweringStages}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({stage, value}) => `${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {floweringStages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Monthly Bloom Intensity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={seasonalTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="blooms" stroke="#F2AEBB" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.insightsSection}>
          <h3 className={styles.chartTitle}>Key Agricultural Insights</h3>
          <div className={styles.insightsGrid}>
            <div className={styles.insightCard}>
              <h4 className={styles.insightTitle}>🌾 Optimal Planting Window</h4>
              <p>Based on flowering patterns, the optimal planting window for your location is March 15 - April 30.</p>
            </div>
            <div className={styles.insightCard}>
              <h4 className={styles.insightTitle}>📈 Yield Prediction</h4>
              <p>Current conditions suggest 12% higher yield than last year for wheat and corn crops.</p>
            </div>
            <div className={styles.insightCard}>
              <h4 className={styles.insightTitle}>🌡️ Climate Impact</h4>
              <p>Temperature trends indicate flowering may occur 5-7 days earlier this season.</p>
            </div>
            <div className={styles.insightCard}>
              <h4 className={styles.insightTitle}>💧 Irrigation Recommendation</h4>
              <p>Increase irrigation by 15% during peak flowering to maximize crop productivity.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {currentView === 'choice' && <ChoiceScreen />}
      {currentView === 'health' && !showHealthResults && <HealthForm />}
      {currentView === 'health' && showHealthResults && <HealthResults />}
      {currentView === 'agricultural' && !showAgriculturalResults && <AgriculturalForm />}
      {currentView === 'agricultural' && showAgriculturalResults && <AgriculturalResults />}
    </div>
  );
};

export default HealthPollen;