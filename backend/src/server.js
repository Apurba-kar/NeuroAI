const dotenv = require("dotenv");
const mongoose = require("mongoose");

//Handling Uncaught Excaption
process.on("uncaughtException", (err) => {
  console.log("UCAUGHT EXCAPTION! 💥 Shutting down...");
  console.log(err.name, "💥", err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("👋 DB connection successful!");
});

// 4) Start the server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App is running on : ${port}...`);
});

//Handleing Unhandle Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(err.name, "💥", err.message);
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});

// process.on('SIGTERM', () => {
//   console.log('👋 SIGTERM RECEIVED, Shutting down gracefully!');
//   server.close(() => {
//     console.log('💥 Process terminated!');
//   });
// });
