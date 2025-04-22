const chokidar = require("chokidar");
const { spawn, exec } = require("child_process");
const path = require("path");

let serverProcess = null;

// Kill any process using port 3000
function killPort() {
  return new Promise((resolve) => {
    exec("pkill -f 'next'", () => {
      // Give it a moment to fully release the port
      setTimeout(resolve, 1000);
    });
  });
}

// Start the server
async function startServer() {
  try {
    // Kill any existing server first
    if (serverProcess) {
      serverProcess.kill();
      await killPort();
    }

    serverProcess = spawn('npm', ['run', 'start'], {
      stdio: 'pipe',
      shell: true
    });

    serverProcess.on('error', (err) => {
      console.error('Failed to start server:', err);
    });

    // Handle server output
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    // Handle server exit
    serverProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`Server exited with code ${code}`);
        // Try to restart the server
        setTimeout(() => startServer(), 1000);
      }
    });

    // Wait for server to be ready
    await new Promise((resolve) => {
      const checkReady = (data) => {
        const output = data.toString();
        if (output.includes('Ready in')) {
          serverProcess.stdout.removeListener('data', checkReady);
          resolve();
        }
      };
      serverProcess.stdout.on('data', checkReady);
    });

  } catch (error) {
    console.error('Error starting server:', error);
    throw error;
  }
}

// Run a command and return its output
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing ${command}:`, error);
        console.error('stderr:', stderr);
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

// Handle changes
async function handleChange() {
  try {
    console.log("🔄 Plugin change detected, rebuilding...");
    
    // Kill existing server and wait for port to be free
    if (serverProcess) {
      serverProcess.kill();
      await killPort();
    }
    
    // Generate plugins list
    await runCommand("node scripts/generate-plugins.js");
    
    // Clean .next directory
    await runCommand("rm -rf .next");
    
    // Build
    await runCommand("next build");

    // Start server
    await startServer();
    console.log("✅ Build and server restart successful! Changes are live.");
  } catch (error) {
    console.error("❌ Error during rebuild:", error);
    // Try to restart the server even if build failed
    try {
      await startServer();
    } catch (serverError) {
      console.error("❌ Failed to restart server:", serverError);
    }
  }
}

// Start the server first
console.log("🚀 Starting server...");
startServer().then(() => {
  // Then start watching for changes
  const watcher = chokidar.watch(path.join(__dirname, "plugins"), {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    },
    ignoreInitial: true
  });

  console.log("🔍 Watching for plugin changes...");

  // Watch for changes
  watcher.on("add", handleChange);
  watcher.on("change", handleChange);
  watcher.on("unlink", handleChange);
});

// Clean exit
process.on('SIGINT', async () => {
  if (serverProcess) {
    serverProcess.kill();
    await killPort();
  }
  process.exit();
});
