const mongoose = require("mongoose");
const readLine = require("readline");

// Build the connection string from environment variables so the app works in dev, container, and hosted environments without code changes.
const host = process.env.DB_HOST || "127.0.0.1";
const dbName = process.env.DB_NAME || "booklane";
const dbURI = `mongodb://${host}/${dbName}`;

// Defer the connection slightly so Mongo has time to come up if it's starting in a sibling container.
const connect = () => {
  setTimeout(() => mongoose.connect(dbURI), 1000);
};

// Connection lifecycle logging.
mongoose.connection.on("connected", () => {
  console.log(`Mongoose connected to ${dbURI}`);
});

mongoose.connection.on("error", (err) => {
  console.log("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

// Windows doesn't forward SIGINT cleanly without a readline shim.
// Windows-specifc CTRL+C handling.
// Linux/macOS recieve SIGINT noramally. 
if (process.platform === "win32") {
  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.on("SIGINT", () => {
    process.emit("SIGINT");
  });
}

// Close the connection cleanly before the process exits so MongoDB doesn't log a noisy disconnect.
const gracefulShutdown = async (msg) => {
  await mongoose.connection.close();
  console.log(`Mongoose disconnected through ${msg}`);
};

process.once("SIGUSR2", async () => {
  await gracefulShutdown("nodemon restart");
  process.kill(process.pid, "SIGUSR2");
});

process.on("SIGINT", async () => {
  await gracefulShutdown("app termination");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await gracefulShutdown("app shutdown");
  process.exit(0);
});

connect();

// Register the schemas so Mongoose knows about them before any controller calls mongoose.model().
require("./listing");
require("./user");

module.exports = mongoose;