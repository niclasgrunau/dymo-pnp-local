const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const app = express();
const cors = require("cors");

let canvasWidth;

// Enable CORS middleware
app.use(cors());

app.use(express.json()); // Add this line to parse JSON bodies

// Route to handle the GET request
app.get("/test-route", (req, res) => {
  res.status(200).json({ message: "worked" });
});

// Route to handle image resizing
app.post("/local-resize", (req, res) => {
  canvasWidth = req.body.canvasWidth;

  console.log("Width:", canvasWidth);

  // Define the URL of the image to resize
  const imagePath =
    "https://lehre.bpm.in.tum.de/~ge83neb/dymo-pnp/backend/downloads/DYMOPNP_label.png";

  // Define the output path for the resized image
  const outputPath = path.join(__dirname, "output.pdf");
  let canvasWidthPrintingSite = 2 * Math.floor(canvasWidth / 2.91666667);

  // Execute the resizing command using ImageMagick
  exec(
    `convert ${imagePath} -page ${canvasWidthPrintingSite}x48 ${outputPath}`,

    (error, stdout, stderr) => {
      if (error) {
        // Log and send an error response if there's an error
        console.error(`Error: ${error.message}`);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      console.log(`Command output: ${stdout}`);
      res.json({ message: "Image resized successfully" });
    }
  );
});

// Route to handle printing the resized image
app.post("/download-command", (req, res) => {
  try {
    // Define the path of the resized image
    const imagePath = path.join(__dirname, "output.pdf");

    let canvasWidthPrintingSite = Math.floor(canvasWidth / 2.91666667); //this doesnt affect werid scale
    console.log("Width:", canvasWidth);

    const execCommand = `lp -d DYMO_LabelManager_PnP -o landscape -o PageSize=Custom.24x${canvasWidthPrintingSite} -o fit-to-page ${imagePath}`;

    // Execute the print command using CUPS
    exec(execCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      console.log(`Command output: ${stdout}`);
      // Send a JSON response indicating successful execution of the print command
      res.status(200).json({ message: "Command executed successfully" });
    });
  } catch (error) {
    console.error("Error executing command:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the local server on port 6983
app.listen(6983, () => {
  console.log("Local server running on port 6983");
});
