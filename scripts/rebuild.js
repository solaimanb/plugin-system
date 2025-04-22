const { exec } = require('child_process');

// Function to run command and return promise
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

async function rebuild() {
  try {
    // Generate plugins list
    await runCommand('node scripts/generate-plugins.js');
    
    // Run build
    await runCommand('next build');
    
    console.log('Rebuild completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Rebuild failed:', error);
    process.exit(1);
  }
}

rebuild(); 