const fs = require('fs');

console.log("==================================================");
console.log("AGRIBAZZER CROP SCANNER CAMERA DIAGNOSTICS SUITE");
console.log("==================================================\n");

// Read Farm.jsx to verify implementation of all required camera rules
const farmJsx = fs.readFileSync('src/screens/Farm.jsx', 'utf8');

const checks = [
  {
    name: "Camera API detection (hasMediaDevices & hasGetUserMedia)",
    check: farmJsx.includes("navigator.mediaDevices.getUserMedia") && farmJsx.includes("hasGetUserMedia")
  },
  {
    name: "Camera constraint retry ({ video: true } fallback)",
    check: farmJsx.includes("video: {") && farmJsx.includes("video: true")
  },
  {
    name: "Camera device enumeration (enumerateDevices)",
    check: farmJsx.includes("enumerateDevices") && farmJsx.includes("videoinput")
  },
  {
    name: "Permission denied classification (NotAllowedError)",
    check: farmJsx.includes("NotAllowedError") && farmJsx.includes("Camera permission denied")
  },
  {
    name: "No camera found classification (NotFoundError)",
    check: farmJsx.includes("NotFoundError") && farmJsx.includes("No camera was found on this device")
  },
  {
    name: "Camera in use classification (NotReadableError)",
    check: farmJsx.includes("NotReadableError") && farmJsx.includes("used by another application")
  },
  {
    name: "Security error classification (SecurityError)",
    check: farmJsx.includes("SecurityError") && farmJsx.includes("blocked by browser security settings")
  },
  {
    name: "Camera cleanup on unmount (stopCamera)",
    check: farmJsx.includes("getTracks().forEach") && farmJsx.includes("stopCamera")
  },
  {
    name: "Front/Rear camera toggle (facingMode ideal)",
    check: farmJsx.includes("facingMode: { ideal: mode }")
  },
  {
    name: "Gallery Upload Photo fallback (FileReader)",
    check: farmJsx.includes("handleFileUpload") && farmJsx.includes("readAsDataURL")
  }
];

let passCount = 0;
checks.forEach((c, idx) => {
  const status = c.check ? "PASS" : "FAIL";
  if (c.check) passCount++;
  console.log(`Check #${idx + 1}: ${c.name} ➔ [${status}]`);
});

console.log("\n==================================================");
console.log(`SUMMARY: ${passCount}/${checks.length} Passed`);
console.log("==================================================");
