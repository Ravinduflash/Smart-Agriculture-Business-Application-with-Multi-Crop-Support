# Smart Agriculture Business Application with Multi-Crop Support - Final Year R&D Project

## Overview
This repository is dedicated to the **Smart Agriculture Business Application with Multi-Crop Support** project, an initiative aimed at transforming agricultural efficiency using IoT, machine learning, and real-time data visualization. This project is developed by [Ravindu Dulshan] and [Oshan Niluminda] as part of our final year research and deployment project in Business Analytics specialization.

## Project Description
Our application provides a comprehensive solution to optimize crop management for diverse crop types. By leveraging IoT sensors, machine learning, and a web-based interface, we aim to provide farmers and agricultural advisors with data-driven insights to increase crop yield, reduce waste, and enhance sustainability. This system is adaptable to various crops, making it suitable for a range of agricultural environments.

## Key Components
1. **Data Collection and Processing**
   - **IoT Sensors**: Integrate sensors for soil moisture, temperature, humidity, pH levels, light intensity, and crop-specific metrics.
   - **Data Pipeline**: Collect and process data in real-time through LoRa/NB-IoT/Wi-Fi, using Python for preprocessing (e.g., handling missing values and outliers).
   - **Data Storage**: Maintain a scalable, robust data repository using MySQL, MongoDB, or AWS S3 for historical and real-time analysis.
   - **ThingSpeak Integration**:
     - The `raspberry_module/all_sensors_script_new.py` script is configured to send real-time sensor data to ThingSpeak, a platform for IoT data analytics and visualization.
     - The following 8 sensor parameters are currently being sent:
       1. BMP180 Temperature (from BMP180 sensor)
       2. DHT22 Temperature (from DHT22 sensor)
       3. Humidity (from DHT22 sensor)
       4. Atmospheric Pressure (from BMP180 sensor)
       5. Soil Moisture (raw value)
       6. Light Intensity (raw value)
       7. CO2 Level (estimated from MQ135 sensor)
       8. Nitrogen (N) Level (from NPK sensor)
     - This allows for remote monitoring and basic visualization of key environmental factors.

2. **Machine Learning Model Development**
   - **Predictive Models**:
     - Crop disease prediction
     - Optimal planting period forecasting
     - Harvest time estimation
     - Yield prediction
   - **Model Adaptability**: Separate models tailored to each crop type, with continuous learning to improve accuracy over time.

3. **Django Web Application**
   - **Dashboard**: Display real-time sensor data, yield predictions, and recommendations.
   - **User Roles**: Provide access for different roles (e.g., farmers, agricultural advisors).
   - **Notifications**: Alert users to important conditions, such as low soil moisture or disease detection.

4. **Multi-Crop Support System**
   - **Flexible Architecture**: Easily add support for new crop types with specific parameters stored in the database.
   - **Dynamic Model Management**: Automatically select and apply crop-specific models.

5. **Business Intelligence and Reporting**
   - **Analytics**: Track resource usage and identify inefficiencies.
   - **Reports**: Generate customizable reports for yield, disease incidents, and financial summaries.
   - **Predictive Analytics**: Guide resource allocation and crop cycle planning.

6. **System Integration and Scalability**
   - **Data Flow**: Ensure seamless integration between IoT sensors, the backend, and the web application.
   - **Scalability**: Design for growth using cloud-based solutions like AWS Lambda or Google Firebase.
   - **Security**: Implement encryption and access control for data protection.

## Research Objectives
1. Evaluate the impact of real-time data analysis and machine learning on crop yield across multiple crop types.
2. Assess the adaptability of the system for different farm sizes and crop varieties.
3. Measure the influence of the application on farm efficiency and decision-making.
4. Test predictive model reliability in a real-world agricultural setting.

## Expected Outcomes
- A functional multi-crop smart agriculture system with IoT integration, machine learning models, and real-time visualization.
- Increased crop yield and reduced waste through data-driven recommendations.
- Enhanced understanding of crop-specific growth, disease, and yield factors.
- Scalable architecture for expanding crop support and adapting to larger farms.

## Configuration

### ThingSpeak API Key
To enable data transmission to ThingSpeak, you need to configure your ThingSpeak API Write Key.
1. Locate the configuration file at `raspberry_module/config.py`.
2. Open this file and replace `"YOUR_ACTUAL_API_KEY_HERE"` with your actual ThingSpeak API Write Key.
   ```python
   # raspberry_module/config.py
   THINGSPEAK_API_KEY = "YOUR_ACTUAL_API_KEY_HERE" 
   ```
3. **Important**: The `raspberry_module/config.py` file is included in `.gitignore` to prevent accidental commitment of your sensitive API key. Ensure it remains gitignored if you are managing your own fork or version of this project.

## Getting Started
1. **Clone this Repository**:
   ```bash
   git clone https://github.com/yourusername/smart-agriculture-business-app.git
   cd smart-agriculture-business-app
   ```

2. **Set Up the Environment**:
   - Install required Python packages with:
     ```bash
     pip install -r requirements.txt
     ```
   - Ensure you have configured any necessary API keys as described in the "Configuration" section (e.g., ThingSpeak API Key for sensor data upload).

3. **Run the Application**:
   - **Sensor Data Collection (Raspberry Pi)**:
     - To run the sensor data collection and ThingSpeak upload script on a Raspberry Pi (or compatible environment with connected sensors):
       ```bash
       python raspberry_module/all_sensors_script_new.py
       ```
     - Ensure that all sensor hardware is correctly connected and any required system libraries (e.g., for I2C, OneWire) are enabled on your Raspberry Pi.
   - **Django Web Application**:
     - Start the Django web server:
       ```bash
       python manage.py runserver
       ```
     - Access the dashboard at `http://127.0.0.1:8000`.

## Contributing
Contributions are welcome! Please follow these steps to contribute:
1. Fork this repository.
2. Create a branch: `git checkout -b feature/YourFeature`.
3. Commit changes: `git commit -m 'Add some feature'`.
4. Push to your branch: `git push origin feature/YourFeature`.
5. Open a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.

## Authors
- **[G.M.Ravindu Dulshan]**
- **[Oshan Niluminda]**

We hope this project contributes to modern agriculture by showcasing the potential of IoT and machine learning in optimizing crop management and supporting sustainable farming practices.
