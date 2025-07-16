# Virtual Environment Setup Guide

## ✅ Virtual Environment Status: **ACTIVE**

Your Smart Agriculture System virtual environment is now fully configured and ready to use!

## 🚀 Quick Start

### 1. Activate Virtual Environment
```powershell
# Navigate to project directory
cd "c:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support"

# Activate the virtual environment
.\sas_env\Scripts\Activate.ps1
```

### 2. Verify Installation
```powershell
# Run the setup check script
python setup_check.py
```

### 3. Run Main Sensor Script
```powershell
# Navigate to the raspberry module
cd raspberry_module

# Run the main sensor monitoring script
python all_sensors_script_new.py
```

## 📦 Installed Packages

The following packages are installed in your virtual environment:

- **Hardware Interface Libraries:**
  - `adafruit-blinka` (8.62.0) - GPIO/Hardware abstraction
  - `adafruit-circuitpython-dht` (4.0.9) - DHT22 temperature/humidity sensor
  - `adafruit-circuitpython-ads1x15` (2.4.4) - ADS1115 16-bit ADC
  - `adafruit-circuitpython-ds18x20` (1.4.6) - DS18B20 temperature sensor
  - `adafruit-circuitpython-onewire` (2.0.11) - 1-Wire protocol support
  - `smbus2` (0.5.0) - I2C communication (BMP180 pressure sensor)

- **Communication Libraries:**
  - `pyserial` (3.5) - Serial communication
  - `minimalmodbus` (2.1.1) - Modbus RTU protocol (NPK sensor)
  - `requests` (2.32.4) - HTTP requests (ThingSpeak API)

- **Data Processing:**
  - `numpy` (2.2.5) - Numerical computing
  - `pandas` (2.2.3) - Data manipulation
  - `matplotlib` (3.10.1) - Data visualization
  - `seaborn` (0.13.2) - Statistical data visualization

## 🔧 Configuration

### ThingSpeak API Setup
1. Open `raspberry_module/config.py`
2. Update your ThingSpeak Write API key:
   ```python
   THINGSPEAK_WRITE_API_KEY = "YOUR_API_KEY_HERE"
   ```

### Sensor Calibration
All sensor calibration values for the Kalutara deployment are pre-configured in `config.py`:
- Temperature/Humidity offsets
- Soil moisture thresholds
- Light intensity ranges
- NPK sensor corrections

## 🖥️ Development Environment

### Windows Compatibility Note
Some Adafruit libraries are optimized for Raspberry Pi/Linux systems. For development on Windows:
- Core communication libraries (minimalmodbus, pyserial, requests) work fully
- Hardware-specific libraries may have limited functionality on Windows
- Full functionality available when deployed on Raspberry Pi

### VS Code Integration
To use this virtual environment in VS Code:
1. Open Command Palette (Ctrl+Shift+P)
2. Type "Python: Select Interpreter"
3. Choose: `.\sas_env\Scripts\python.exe`

## 🔄 Deactivating Virtual Environment
```powershell
deactivate
```

## 📊 Project Structure
```
Smart-Agriculture-Business-Application-with-Multi-Crop-Support/
├── sas_env/                    # Virtual environment directory
├── raspberry_module/           # Main sensor code
│   ├── all_sensors_script_new.py  # Main monitoring script
│   ├── config.py              # Configuration and calibration
│   └── sensor_node.md         # Technical documentation
├── requirements.txt           # Python dependencies
└── setup_check.py            # Environment verification
```

## 🚨 Troubleshooting

### Common Issues
1. **Import errors on Windows**: Normal for hardware-specific libraries
2. **Permission errors**: Run PowerShell as Administrator
3. **Module not found**: Ensure virtual environment is activated

### Verification Commands
```powershell
# Check Python version
python --version

# List installed packages
pip list

# Test core imports
python -c "import minimalmodbus, serial, requests; print('Core libraries OK')"
```

## 📈 Next Steps

1. **Configure ThingSpeak**: Update API keys in `config.py`
2. **Deploy to Raspberry Pi**: Transfer project to target hardware
3. **Hardware Connection**: Connect sensors according to `sensor_node.md`
4. **Field Testing**: Run calibration procedures for your specific location

---

**Status**: ✅ Virtual environment successfully configured and ready for development!
