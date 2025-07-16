// Simple test to verify the build process
const { exec } = require('child_process');

console.log('Testing IoT Sensors Page Build...');

exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error(`Build error: ${error}`);
    return;
  }
  
  console.log('Build stdout:', stdout);
  
  if (stderr) {
    console.error('Build stderr:', stderr);
  }
  
  console.log('Build completed successfully!');
});
