const express = require("express");
const router = express.Router();
const data = require("../../Data");
const { createClient } = require("redis");

(async () => {
 client = createClient({url: 'redis://host.docker.internal:6379',legacyMode: true,port:6379});

 client.on('connect', function() {
  console.log('Connected!');
});
  client.on("error", (err) => console.log("GOT ERROR", err));


  await client.connect();
})();

router.get("/", (req, res) => {
  try {
    console.log("HERE")
    client.get("data", (err, result) => {
      console.log("RESULT")
      if (result) {
        return res.status(200).send({
          error: false,
          data: JSON.parse(result),
        });
      } else {
        console.log("REACHED ELSE")
        client.setEx('data', 100, JSON.stringify(data));
        return res.status(200).send({ error: false, data });
      }
    });
    //return res.status(200).send({message:'chaliraxa'})
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

router.get("/overweight", (req, res) => {
  try {
    client.get("Overweight", (err, result) => {
      if (result) {
        return res.status(200).send({ error: false, data: JSON.parse(result) });
      } else {
        try {
          client.get("data", (err, r) => {
            if (r) {
              let owArray = { overweight: [] };
              let data = JSON.parse(r);
              let count = 0;
              data.map((v) => {
                if (v.bmiCategory === "Overweight") {
                  count++;
                  owArray.overweight.push(v);
                }
              });
              client.setEx("Overweight", 100, JSON.stringify(owArray));
              return res
                .status(200)
                .send({ error: false, data: owArray, TotalOverweight: count });
            }
          });
        } catch (err) {
          res.status(500).send({ error: err });
        }
      }
    });
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

router.post("/add", (req, res) => {
  const heightInCm = req.body.heightInCm;
  const weightKg = req.body.weightKg;
  const Gender = req.body.Gender;

  if (
    heightInCm < 54.6 || //Let's suppose height of human is no less than smallest person in the planet earth.
    heightInCm === null ||
    heightInCm === undefined ||
    weightKg < 2.13 || //Let's suppose minimum weight of an average healthy human cannot be less than 2.13 kg.
    weightKg === null ||
    weightKg === undefined ||
    Gender === null ||
    Gender === undefined
  ) {
    return res.status(400).send({ error: "Please enter valid values." });
  }

  const BMI = calculateBMI(heightInCm, weightKg);
  let healthRisk, bmiCategory;
  if (BMI >= 18.4 && BMI <= 18.5) {
    bmiCategory = "Underweight";
    healthRisk = "Malnutrition Risk";
  } else if (BMI === 24.9) {
    bmiCategory = "Normal Weight";
    healthRisk = "Low Risk";
  } else if (BMI >= 25 && BMI <= 29.9) {
    bmiCategory = "Overweight";
    healthRisk = "Enhanced Risk";
  } else if (BMI >= 30 && BMI <= 34.9) {
    bmiCategory = "Moderately Obese";
    healthRisk = "Medium Risk";
  } else if (BMI >= 35 && BMI <= 39.9) {
    bmiCategory = "Severe Obese";
    healthRisk = "High Risk";
  } else if (BMI >= 40) {
    bmiCategory = "Very Severely Obese";
    healthRisk = "Very High Risk";
  }
  data.push({
    Gender: Gender,
    HeightCm: heightInCm,
    WeightKg: weightKg,
    BMI,
    Category: bmiCategory,
    HealthRisk: healthRisk,
  });

  client.setEx(data + "", 100, JSON.stringify(data));
  return res.status(201).send({ error: false, data });
});

module.exports = router;
