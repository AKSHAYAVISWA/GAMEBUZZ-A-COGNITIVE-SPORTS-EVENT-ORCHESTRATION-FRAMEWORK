// utils/whatsappSender.js
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

let clientReady = false;

// Initialize WhatsApp Web client
const client = new Client({
  authStrategy: new LocalAuth(), // Keeps you logged in
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  console.log("\n📱 Scan this QR code using WhatsApp Web (Linked Devices):");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  clientReady = true;
  console.log("✅ WhatsApp Client is ready to send messages!");
});

client.on("auth_failure", (msg) => {
  console.error("❌ Authentication failed:", msg);
});

client.initialize();

// Helper to send message
async function sendWhatsAppMessage(number, message) {
  if (!clientReady) {
    console.error("⚠️ WhatsApp client not ready yet. Try again after initialization.");
    return;
  }

  // Ensure the number is properly formatted
  let formattedNumber = number.toString().trim();

  // If user enters "9876543210" → format as +91
  if (!formattedNumber.startsWith("91")) {
    formattedNumber = `91${formattedNumber}`;
  }

  const chatId = `${formattedNumber}@c.us`;

  try {
    await client.sendMessage(chatId, message);
    console.log(`📩 WhatsApp message sent to ${number}`);
  } catch (error) {
    console.error(`❌ Failed to send message to ${number}:`, error.message);
  }
}

module.exports = { sendWhatsAppMessage };
