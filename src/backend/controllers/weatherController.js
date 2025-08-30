import { notificationController } from "./notificationController.js"
import { userModel } from "../models/userModel.js"

export const weatherController = {
  async getCurrentWeather(city, country = "") {
    try {
      const WEATHERBIT_API_KEY = process.env.WEATHERBIT_API_KEY;

      if (!WEATHERBIT_API_KEY) {
        throw new Error("Weather API key not configured");
      }

      const locationQuery = country ? `${city},${country}` : city;
      const currentWeatherUrl = `https://api.weatherbit.io/v2.0/current?city=${encodeURIComponent(
        locationQuery
      )}&key=${WEATHERBIT_API_KEY}&units=M`;

      const response = await fetch(currentWeatherUrl);

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error("City or country not recognized. Please edit your profile information with a valid location.");
        }
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      // Check if WEATHERBIT returned an error or no data
      if (data.error) {
        throw new Error("City or country not recognized. Please edit your profile information with a valid location.");
      }

      if (!data.data || data.data.length === 0) {
        throw new Error("City or country not recognized. Please edit your profile information with a valid location.");
      }

      const weatherData = data.data[0];

      return {
        success: true,
        data: {
          location: `${weatherData.city_name}, ${weatherData.country_code}`,
          temperature: Math.round(weatherData.temp),
          condition: weatherData.weather.description,
          humidity: weatherData.rh,
          windSpeed: Math.round(weatherData.wind_spd * 3.6), // Convert m/s to km/h
          visibility: weatherData.vis,
          uvIndex: weatherData.uv,
          icon: weatherData.weather.icon,
          weatherCode: weatherData.weather.code,
        },
      };
    } catch (error) {
      console.error("Error fetching current weather:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },

  async getForecast(city, country = "") {
    try {
      const WEATHERBIT_API_KEY = process.env.WEATHERBIT_API_KEY;

      if (!WEATHERBIT_API_KEY) {
        throw new Error("Weather API key not configured");
      }

      const locationQuery = country ? `${city},${country}` : city;
      const forecastUrl = `https://api.weatherbit.io/v2.0/forecast/daily?city=${encodeURIComponent(
        locationQuery
      )}&key=${WEATHERBIT_API_KEY}&days=5&units=M`;

      const response = await fetch(forecastUrl);

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error("City or country not recognized. Please edit your profile information with a valid location.");
        }
        throw new Error(`Forecast API error: ${response.status}`);
      }

      const data = await response.json();

      // Check if WEATHERBIT returned an error or no data
      if (data.error) {
        throw new Error("City or country not recognized. Please edit your profile information with a valid location.");
      }

      if (!data.data || data.data.length === 0) {
        throw new Error("City or country not recognized. Please edit your profile information with a valid location.");
      }

      const forecast = data.data.map((day, index) => ({
        day:
          index === 0
            ? "Today"
            : new Date(day.datetime).toLocaleDateString("en-US", {
                weekday: "long",
              }),
        date: day.datetime,
        high: Math.round(day.high_temp),
        low: Math.round(day.low_temp),
        condition: day.weather.description,
        icon: day.weather.icon,
        precipitation: day.pop,
        weatherCode: day.weather.code,
      }));

      return {
        success: true,
        data: forecast,
      };
    } catch (error) {
      console.error("Error fetching forecast:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },

  getFarmingTips(weatherCode, temperature, humidity, condition) {
    const tips = [];

    // Temperature-based tips
    if (temperature > 35) {
      tips.push({
        title: "Extreme Heat Protection",
        description:
          "Provide shade cloth for sensitive crops. Water early morning or late evening to reduce evaporation. Consider heat-resistant crop varieties.",
        type: "warning",
      });
      tips.push({
        title: "Livestock Care in Heat",
        description:
          "Ensure animals have adequate shade and fresh water. Adjust feeding times to cooler parts of the day.",
        type: "warning",
      });
    } else if (temperature > 30) {
      tips.push({
        title: "Hot Weather Management",
        description:
          "Apply mulch to retain soil moisture. Increase watering frequency and monitor for heat stress in plants.",
        type: "info",
      });
    } else if (temperature < 5) {
      tips.push({
        title: "Frost Protection Critical",
        description:
          "Use frost blankets, windbreaks, or smudge pots. Harvest tender crops immediately. Protect water systems from freezing.",
        type: "warning",
      });
    } else if (temperature < 10) {
      tips.push({
        title: "Cold Weather Strategies",
        description:
          "Delay planting warm-season crops. Use cold frames or row covers. Check and insulate greenhouse heating systems.",
        type: "warning",
      });
      tips.push({
        title: "Winter Crop Opportunities",
        description:
          "Perfect time for cold-hardy crops like kale, spinach, and winter wheat. Plan for spring planting preparations.",
        type: "positive",
      });
    } else if (temperature >= 20 && temperature <= 30) {
      tips.push({
        title: "Optimal Growing Conditions",
        description:
          "Ideal for most crop growth, transplanting, and field operations. Great time for soil preparation and planting.",
        type: "positive",
      });
    }

    // Humidity-based tips
    if (humidity > 85) {
      tips.push({
        title: "Very High Humidity Alert",
        description:
          "High risk of fungal diseases. Improve air circulation, apply preventive fungicides, and avoid overhead irrigation.",
        type: "warning",
      });
      tips.push({
        title: "Disease Prevention",
        description:
          "Space plants properly for airflow. Remove infected plant material immediately to prevent spread.",
        type: "warning",
      });
    } else if (humidity > 70) {
      tips.push({
        title: "Moderate High Humidity",
        description:
          "Monitor for early signs of blight and mildew. Consider organic fungicides like neem oil or copper spray.",
        type: "info",
      });
    } else if (humidity < 30) {
      tips.push({
        title: "Very Low Humidity Alert",
        description:
          "Increase irrigation frequency and use drip systems. Apply heavy mulch and consider windbreaks to reduce moisture loss.",
        type: "warning",
      });
    } else if (humidity < 50) {
      tips.push({
        title: "Dry Air Management",
        description:
          "Monitor soil moisture closely. Mulch around plants and consider misting systems for greenhouse crops.",
        type: "info",
      });
    }

    // Weather condition-based tips
    const conditionLower = condition.toLowerCase();

    if (conditionLower.includes("rain") || conditionLower.includes("drizzle")) {
      tips.push({
        title: "Rainy Weather Protocol",
        description:
          "Postpone fertilizer applications. Ensure proper drainage and check for soil erosion. Perfect time for indoor farm tasks.",
        type: "info",
      });
      tips.push({
        title: "Post-Rain Activities",
        description:
          "Wait for soil to dry before working to avoid compaction. Good opportunity to collect rainwater for future use.",
        type: "positive",
      });
    } else if (
      conditionLower.includes("sunny") ||
      conditionLower.includes("clear")
    ) {
      tips.push({
        title: "Clear Weather Advantages",
        description:
          "Excellent for hay making, seed drying, and pesticide applications. Perfect harvesting conditions for most crops.",
        type: "positive",
      });
      tips.push({
        title: "UV Protection Needed",
        description:
          "Protect workers with proper clothing and shade. Monitor plants for sun scald on fruits and vegetables.",
        type: "info",
      });
    } else if (conditionLower.includes("cloud")) {
      tips.push({
        title: "Cloudy Weather Benefits",
        description:
          "Ideal for transplanting and grafting operations. Plants experience less transplant shock in these conditions.",
        type: "positive",
      });
      tips.push({
        title: "Reduced Evaporation",
        description:
          "Lower water requirements today. Good conditions for applying foliar fertilizers and pesticides.",
        type: "positive",
      });
    } else if (conditionLower.includes("wind")) {
      tips.push({
        title: "Windy Conditions",
        description:
          "Secure loose materials and support tall plants. Avoid spraying pesticides or fertilizers. Check irrigation systems.",
        type: "warning",
      });
    }

    // Detailed weather code specific tips
    if (weatherCode >= 200 && weatherCode <= 233) {
      // Thunderstorms
      tips.push({
        title: "Severe Weather Protocol",
        description:
          "Secure all equipment and livestock. Inspect crops for hail damage post-storm. Check and repair damaged infrastructure.",
        type: "warning",
      });
      tips.push({
        title: "Lightning Safety",
        description:
          "Avoid metal equipment and open fields. Use indoor time for record keeping and planning activities.",
        type: "warning",
      });
    } else if (weatherCode >= 300 && weatherCode <= 522) {
      // Rain/Drizzle
      tips.push({
        title: "Wet Soil Management",
        description:
          "Test soil compaction before field work. Focus on greenhouse tasks and equipment maintenance indoors.",
        type: "info",
      });
      tips.push({
        title: "Nutrient Management",
        description:
          "Monitor for nitrogen leaching in sandy soils. Consider slow-release fertilizers for future applications.",
        type: "info",
      });
    } else if (weatherCode >= 600 && weatherCode <= 623) {
      // Snow
      tips.push({
        title: "Snow Load Management",
        description:
          "Remove snow from greenhouse roofs and tunnels. Ensure livestock have access to unfrozen water sources.",
        type: "warning",
      });
      tips.push({
        title: "Winter Crop Protection",
        description:
          "Snow acts as natural insulation for winter crops. Plan for spring by ordering seeds and preparing equipment.",
        type: "positive",
      });
    } else if (weatherCode >= 700 && weatherCode <= 781) {
      // Atmospheric conditions
      if (weatherCode === 721 || weatherCode === 741) {
        // Haze/Fog
        tips.push({
          title: "Low Visibility Precautions",
          description:
            "Delay machinery operations until visibility improves. Use this time for barn work and animal care.",
          type: "info",
        });
        tips.push({
          title: "Moisture Benefits",
          description:
            "Fog provides natural moisture for crops. Good conditions for seed germination in outdoor beds.",
          type: "positive",
        });
      } else if (weatherCode >= 731 && weatherCode <= 781) {
        // Dust/Sand storms
        tips.push({
          title: "Air Quality Alert",
          description:
            "Protect sensitive crops with barriers. Postpone outdoor activities and secure loose soil with cover crops.",
          type: "warning",
        });
      }
    } else if (weatherCode === 800) {
      // Clear sky
      tips.push({
        title: "Perfect Field Conditions",
        description:
          "Optimal for all outdoor operations including planting, harvesting, and soil preparation. Plan major field work.",
        type: "positive",
      });
      tips.push({
        title: "Solar Energy Utilization",
        description:
          "Excellent day for solar drying crops and charging solar equipment. Consider setting up solar-powered irrigation.",
        type: "positive",
      });
    } else if (weatherCode >= 801 && weatherCode <= 804) {
      // Cloudy conditions
      tips.push({
        title: "Variable Cloud Cover",
        description:
          "Good for gradual plant acclimatization. Monitor light levels for greenhouse crops and adjust supplemental lighting.",
        type: "info",
      });
    }

    // Seasonal and general farming wisdom
    const currentMonth = new Date().getMonth();

    if (currentMonth >= 2 && currentMonth <= 4) {
      // Spring
      tips.push({
        title: "Spring Season Tips",
        description:
          "Prepare seedbeds, start composting, and plan crop rotation. Check and service farm equipment before busy season.",
        type: "positive",
      });
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      // Summer
      tips.push({
        title: "Summer Growth Period",
        description:
          "Monitor for pests and diseases. Maintain consistent watering schedules and consider companion planting benefits.",
        type: "info",
      });
    } else if (currentMonth >= 8 && currentMonth <= 10) {
      // Fall
      tips.push({
        title: "Harvest Season Focus",
        description:
          "Plan storage solutions and post-harvest processing. Begin cover crop planting and soil amendments.",
        type: "positive",
      });
    } else {
      // Winter
      tips.push({
        title: "Winter Planning Period",
        description:
          "Review this year's records and plan next season. Focus on equipment maintenance and skill development.",
        type: "info",
      });
    }

    // Soil and water conservation tips
    if (temperature > 25 || humidity < 60) {
      tips.push({
        title: "Water Conservation",
        description:
          "Implement drip irrigation or soaker hoses. Collect and store rainwater for future dry periods.",
        type: "info",
      });
    }

    // Pest and beneficial insect tips
    if (temperature >= 15 && temperature <= 28 && humidity > 50) {
      tips.push({
        title: "Beneficial Insect Activity",
        description:
          "Good conditions for pollinators and beneficial insects. Avoid broad-spectrum pesticides during active periods.",
        type: "positive",
      });
    }

    // Emergency preparedness
    if (weatherCode >= 200 && weatherCode <= 781 && weatherCode !== 800) {
      tips.push({
        title: "Emergency Preparedness",
        description:
          "Keep emergency supplies ready. Have backup power for critical systems and alternative water sources available.",
        type: "info",
      });
    }

    // Ensure at least one tip is always provided
    if (tips.length === 0) {
      tips.push({
        title: "Daily Farm Management",
        description:
          "Conduct regular crop inspections, monitor soil moisture, and maintain detailed weather and crop records.",
        type: "info",
      });
      tips.push({
        title: "Sustainable Practices",
        description:
          "Consider implementing integrated pest management and organic farming techniques for long-term soil health.",
        type: "positive",
      });
    }

    // Limit to maximum of 6 tips to avoid overwhelming the user
    return tips.slice(0, 6);
  },

  async getWeatherData(city, country = "") {
    try {
      // Fetch current weather and forecast in parallel
      const [currentWeatherResult, forecastResult] = await Promise.all([
        this.getCurrentWeather(city, country),
        this.getForecast(city, country),
      ]);

      if (!currentWeatherResult.success) {
        return currentWeatherResult;
      }

      if (!forecastResult.success) {
        return forecastResult;
      }

      // Generate farming tips based on current weather
      const farmingTips = this.getFarmingTips(
        currentWeatherResult.data.weatherCode,
        currentWeatherResult.data.temperature,
        currentWeatherResult.data.humidity,
        currentWeatherResult.data.condition
      );

      return {
        success: true,
        data: {
          current: currentWeatherResult.data,
          forecast: forecastResult.data,
          farmingTips: farmingTips,
        },
      };
    } catch (error) {
      console.error("Error getting weather data:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },

  // Send weather alerts for severe conditions
  async checkAndSendWeatherAlerts() {
    try {
      // Get all users with location data
      const users = await userModel.getAllUsersWithLocation()
      let alertsSent = 0

      for (const user of users) {
        if (!user.city) continue

        try {
          // Get current weather for user location
          const weatherResult = await this.getCurrentWeather(user.city, user.country)
          
          if (!weatherResult.success) continue

          const weather = weatherResult.data
          const alerts = this.checkSevereWeatherConditions(weather)

          // Send alerts for severe conditions
          for (const alert of alerts) {
            await notificationController.createNotificationForUser(
              user.id,
              "weather_alert",
              alert.message
            )
            alertsSent++
          }
        } catch (userWeatherError) {
          console.error(`Failed to check weather for user ${user.id}:`, userWeatherError)
          // Continue to next user
        }
      }

      return {
        success: true,
        alertsSent,
        message: `${alertsSent} weather alerts sent successfully`
      }
    } catch (error) {
      console.error("Error checking weather alerts:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Check for severe weather conditions that warrant alerts
  checkSevereWeatherConditions(weather) {
    const alerts = []
    const { temperature, condition, windSpeed, weatherCode, humidity } = weather

    // Temperature-based alerts
    if (temperature >= 40) {
      alerts.push({
        type: "extreme_heat",
        message: `🌡️ Extreme heat warning! Temperature is ${temperature}°C. Protect crops with shade, increase irrigation, and avoid working during peak hours.`
      })
    } else if (temperature <= 2) {
      alerts.push({
        type: "frost",
        message: `❄️ Frost alert! Temperature is ${temperature}°C. Protect sensitive crops with covers and consider heating systems for greenhouses.`
      })
    }

    // Wind-based alerts
    if (windSpeed >= 50) {
      alerts.push({
        type: "high_wind",
        message: `💨 High wind warning! Wind speed is ${windSpeed} km/h. Secure equipment, support tall plants, and avoid spraying pesticides.`
      })
    }

    // Weather condition-based alerts
    if (weatherCode >= 200 && weatherCode <= 233) {
      // Thunderstorms
      alerts.push({
        type: "thunderstorm",
        message: `⛈️ Severe thunderstorm warning! Secure livestock and equipment. Stay indoors and inspect for hail damage after the storm.`
      })
    } else if (weatherCode >= 600 && weatherCode <= 623) {
      // Snow
      alerts.push({
        type: "snow",
        message: `🌨️ Snow alert! Heavy snow expected. Clear greenhouse roofs, ensure livestock shelter, and prepare for possible power outages.`
      })
    } else if (weatherCode >= 700 && weatherCode <= 781) {
      // Atmospheric conditions (fog, dust, etc.)
      if (weatherCode === 781) {
        alerts.push({
          type: "tornado",
          message: `🌪️ Tornado warning! Take immediate shelter. Secure all outdoor equipment and livestock immediately.`
        })
      }
    }

    // Humidity-based alerts
    if (humidity <= 20) {
      alerts.push({
        type: "low_humidity",
        message: `💧 Very low humidity alert (${humidity}%)! Increase irrigation frequency and monitor crops closely for stress signs.`
      })
    } else if (humidity >= 90 && temperature >= 25) {
      alerts.push({
        type: "high_humidity",
        message: `🌫️ High humidity warning (${humidity}%)! Monitor for fungal diseases and ensure good air circulation in greenhouses.`
      })
    }

    return alerts
  },
};
