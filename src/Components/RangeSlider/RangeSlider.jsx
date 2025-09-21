import { useState } from "react";
import styles from "./RangeSlider.module.css";

function RangeSlider({ min = 2020, max = 2030, step = 1 }) {
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState((max - min + 1) * 12 - 1);

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const labels = [];
  for (let year = min; year <= max; year++) {
    for (let m = 0; m < 12; m++) {
      labels.push(`${months[m]}-${year}`);
    }
  }

  const total = labels.length;

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxValue - step);
    setMinValue(value);
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minValue + step);
    setMaxValue(value);
  };

  // show small windows of labels around both thumbs
  const windowSize = 5;
  const startLabels = labels.slice(
    Math.max(0, minValue - 2),Math.min(total,((maxValue-minValue >= 3 )? minValue + 3 : minValue + (maxValue-minValue)))
  );
  const endLabels = labels.slice(
    Math.max(0, ((maxValue-minValue > 4)? maxValue - 2 : ((maxValue-minValue == 4)? maxValue-1: maxValue))),
    Math.min(total, maxValue + 3)
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.labels}>
        {startLabels.map((label, i) => {
          const isActive = label === labels.at(minValue);
          return (
            <span
              key={`min-${i}`}
              className={`${styles.label} ${isActive ? styles.active : ""}`}
            >
              {label}
            </span>
          );
        })}

        {(maxValue - minValue > 5)? <span className={styles.separator}> ... </span>:""}

        {endLabels.map((label, i) => {
          const isActive = label === labels.at(maxValue);
          return (
            <span
              key={`max-${i}`}
              className={`${styles.label} ${isActive ? styles.active : ""}`}
            >
              {label}
            </span>
          );
        })}
      </div>

      <div className={styles.slider}>
        <div
          className={styles.range}
          style={{
            left: `${(minValue / total) * 100}%`,
            right: `${100 - (maxValue / total) * 100}%`,
          }}
        />
        <input
          type="range"
          min={0}
          max={total - 1}
          step={step}
          value={minValue}
          onChange={handleMinChange}
        />
        <input
          type="range"
          min={0}
          max={total - 1}
          step={step}
          value={maxValue}
          onChange={handleMaxChange}
        />
      </div>

      <div className={styles.values}>
        <span>{labels[minValue]}</span> – <span>{labels[maxValue]}</span>
      </div>
    </div>
  );
}

export default RangeSlider;
