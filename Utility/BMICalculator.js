module.exports = (heightInCm, weightKg) => {
  const BMI = parseFloat(weightKg / heightInCm).toFixed(1);
  return BMI;
};
