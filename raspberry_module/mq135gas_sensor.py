import time
import board
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn
from datetime import datetime

# Initialize I2C bus
i2c = busio.I2C(board.SCL, board.SDA)

# Set up ADS1115 ADC
ads = ADS.ADS1115(i2c)

# Select MQ135 Analog Output (A0)
mq135_channel = AnalogIn(ads, ADS.P0)

# Calibration constants (adjust after field calibration)
VCC = 5.0  # Supply voltage in volts
RL = 10.0  # Load resistance in kohms (refer to MQ135 datasheet)
R0 = 76.63  # Sensor resistance in clean air (calibrate in fresh air)

# Gas-specific calibration constants (a, b) from MQ135 datasheet or calibration
GAS_CALIBRATION = {
    'CO2': {'a': 116.6020682, 'b': -2.769034857, 'normal_range': (350, 1000), 'yield_impact': 'High CO2 boosts photosynthesis but >2000 ppm may stress crops.'},
    'NH3': {'a': 102.2, 'b': -2.473, 'normal_range': (0, 5), 'disease_risk': 'High NH3 (>10 ppm) may indicate fungal activity or over-fertilization.'},
    'VOC': {'a': 110.47, 'b': -2.854, 'normal_range': (0, 2), 'env_stress': 'Elevated VOCs (>5 ppm) suggest plant stress or pollution.'}
}

# Crop suitability based on gas levels (tailored to Sri Lanka)
CROP_SUITABILITY = {
    'Rice': {'CO2_max': 1500, 'NH3_max': 5, 'VOC_max': 2, 'notes': 'Prefers moderate CO2, sensitive to NH3.'},
    'Tea': {'CO2_max': 1200, 'NH3_max': 3, 'VOC_max': 1, 'notes': 'Sensitive to VOCs, thrives in clean air.'},
    'Vegetables': {'CO2_max': 1800, 'NH3_max': 7, 'VOC_max': 3, 'notes': 'Tolerates higher CO2, NH3 indicates disease risk.'}
}

def calculate_resistance(voltage):
    """Convert voltage to sensor resistance (Rs)."""
    if voltage == 0:
        return float('inf')
    return (VCC - voltage) / voltage * RL

def calculate_concentration(rs, gas):
    """Convert resistance ratio to gas concentration in ppm."""
    if R0 == 0:
        return float('inf')
    ratio = rs / R0
    a = GAS_CALIBRATION[gas]['a']
    b = GAS_CALIBRATION[gas]['b']
    return a * (ratio ** b)

def interpret_agriculture_impact(gas, concentration):
    """Interpret gas concentration for agricultural impact."""
    min_val, max_val = GAS_CALIBRATION[gas]['normal_range']
    if concentration < min_val:
        return f"Low {gas}: Below optimal range. May limit crop growth."
    elif concentration <= max_val:
        return f"Normal {gas}: Optimal for crop health."
    else:
        if gas == 'CO2':
            return GAS_CALIBRATION[gas]['yield_impact']
        elif gas == 'NH3':
            return GAS_CALIBRATION[gas]['disease_risk']
        else:
            return GAS_CALIBRATION[gas]['env_stress']

def recommend_crops(co2, nh3, voc):
    """Recommend suitable crops based on gas levels."""
    suitable_crops = []
    for crop, limits in CROP_SUITABILITY.items():
        if (co2 <= limits['CO2_max'] and nh3 <= limits['NH3_max'] and voc <= limits['VOC_max']):
            suitable_crops.append(f"{crop}: {limits['notes']}")
    return suitable_crops if suitable_crops else ["No crops recommended: Gas levels too high."]

while True:
    try:
        voltage = mq135_channel.voltage  # Voltage from ADC
        rs = calculate_resistance(voltage)  # Sensor resistance
        
        # Calculate concentrations for each gas
        concentrations = {
            'CO2': calculate_concentration(rs, 'CO2'),
            'NH3': calculate_concentration(rs, 'NH3'),
            'VOC': calculate_concentration(rs, 'VOC')
        }
        
        # Interpret agricultural impact
        interpretations = {
            gas: interpret_agriculture_impact(gas, conc) 
            for gas, conc in concentrations.items()
        }
        
        # Recommend crops
        recommended_crops = recommend_crops(
            concentrations['CO2'], concentrations['NH3'], concentrations['VOC']
        )
        
        # Print results to terminal
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"Timestamp: {timestamp}")
        print(f"Voltage: {voltage:.2f}V, Rs: {rs:.2f} kohms")
        for gas, conc in concentrations.items():
            print(f"{gas}: {conc:.2f} ppm, {interpretations[gas]}")
        print("Recommended Crops:", '; '.join(recommended_crops))
        print("-" * 50)
        
    except Exception as e:
        print(f"Error reading sensor: {e}")
    
    time.sleep(5)  # Print every minute for readability