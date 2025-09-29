// whatsappApi.js
console.log("This file is running also whatsappApi !!!");

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";
import Order from "../models/orderModel.js";
import Customer from "../models/customerModel.js";
import Tesseract from "tesseract.js";

dotenv.config();

const app = express();
const PORT = 3000;
app.use(express.json());

// Connect to MongoDB asynchronously
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected successfully (whatsappApi.js)");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}
connectDB();

// ---------------- Webhook Verification ----------------
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "my_secret_token"; // choose any string you like

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verified by Meta");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// ---------------- Download Image from WhatsApp ----------------
async function downloadWhatsappImage(mediaId, accessToken) {
  // 1. Get media URL
  const mediaRes = await fetch(`https://graph.facebook.com/v17.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const mediaData = await mediaRes.json();
  const mediaUrl = mediaData.url;

  // 2. Download actual image
  const imageRes = await fetch(mediaUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const buffer = await imageRes.arrayBuffer();
  const filename = `order-${Date.now()}.jpg`; // unique filename
  fs.writeFileSync(filename, Buffer.from(buffer));
  return filename;
}

// ---------------- Temporary session memory ----------------
const sessions = {};

// ---------------- Webhook for incoming messages ----------------
app.post("/webhook", async (req, res) => {
  const changes = req.body.entry[0].changes[0].value;
  const message = changes.messages && changes.messages[0];
  console.log(message)
  if (!message) return res.sendStatus(200);

  const from = message.from; // user id
  let text = message.text?.body?.trim();
  let reply = "";

  if (!sessions[from]) sessions[from] = { step: "menu" };

  // ---------------- IMAGE HANDLING ----------------
  if (message.type === "image") {
    try {
      const mediaId = message.image.id;
      const filename = await downloadWhatsappImage(mediaId, process.env.WP_TOKEN);

      // Store image filename in session
      sessions[from].imageFilename = filename;

      // Set products to empty since image is the order
      sessions[from].products = [];
      sessions[from].step = "awaiting_confirm";
      reply = `✅ Image received and stored. Type 'yes' to confirm your order.\n(Type 'exit' to cancel)`;
    } catch (err) {
      console.error("Error processing image:", err);
      reply = `❌ Failed to process your image. Please try again or type your order manually.`;
    }

    // Send reply
    await fetch(`https://graph.facebook.com/v22.0/${changes.metadata.phone_number_id}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.WP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        text: { body: reply }
      })
    });

    return res.sendStatus(200);
  }

  // ---------------- TEXT HANDLING ----------------
  // Menu and session flow (unchanged from your original code)
  if (sessions[from].step === "menu") {
    if (text === "1") {
      sessions[from].step = "awaiting_customer_details";
      reply = "📝 Please enter your details in this format:\nname,email,phone,address\n(Type 'exit' to cancel)";
    } else if (text === "2") {
      reply = "📞 You can reach us at +91-9876543210 or email support@electroshop.com";
    } else if (text === "3") {
      sessions[from].step = "awaiting_track_order";
      reply = "🔎 Please enter your Order ID to track your order.";
    } else if (text === "4") {
      sessions[from].step = "awaiting_order_id_cancel";
      reply = "🔴 Please enter your Order ID to cancel the order. (Type 'exit' to return to menu)";
    } else {
      reply = `👋 Welcome to Electro Shop:  \n1️⃣ Order  \n2️⃣ Contact Shop  \n3️⃣ Track Order  \n4️⃣ Cancel order`;
    }
  }

  else if (sessions[from].step === "awaiting_customer_details") {
    if (text.trim().toLowerCase() === "exit") {
      reply = "❌ Order process cancelled. Returning to main menu.";
      sessions[from] = { step: "menu" };
    } else {
      const parts = text.split(",");
      if (parts.length === 4) {
        const [name, email, phone, address] = parts.map(p => p.trim());
        try {
          let customer = await Customer.findOne({ email });
          if (!customer) {
            customer = new Customer({ name, email, phone, address });
            await customer.save();
          }
          sessions[from].name = name;
          sessions[from].step = "awaiting_products";
          sessions[from].products = [];
          reply = `Thanks ${name}! Please enter your products in format: PRODUCT1:QTY1, PRODUCT2:QTY2, ...`;
        } catch (err) {
          reply = `❌ Error saving details: ${err.message}`;
        }
      } else {
        reply = "❌ Please enter all details in format: name,email,phone,address";
      }
    }
  }

  else if (sessions[from].step === "awaiting_products") {
    if (text.trim().toLowerCase() === "exit") {
      reply = "❌ Order cancelled. Returning to menu.";
      sessions[from] = { step: "menu" };
    } else {
      const items = text.split(",");
      let valid = true;
      let productsList = [];
      for (let item of items) {
        const [prod, qty] = item.split(":").map(s => s.trim());
        if (!prod || isNaN(qty) || qty < 1) { valid = false; break; }
        productsList.push({ product: prod, quantity: Number(qty) });
      }
      if (!valid || productsList.length === 0) {
        reply = "❌ Please enter products in format: PRODUCT1:QTY1, PRODUCT2:QTY2, ...";
      } else {
        sessions[from].products = productsList;
        sessions[from].step = "awaiting_confirm";
        reply = `✅ Confirm your order:\n` + productsList.map(p => `${p.product} x${p.quantity}`).join("\n") + `\nType 'yes' to confirm.`;
      }
    }
  }

  else if (sessions[from].step === "awaiting_confirm") {
    if (text.trim().toLowerCase() === "exit") {
      reply = "❌ Order cancelled. Returning to menu.";
      sessions[from] = { step: "menu" };
    } else if (text.trim().toLowerCase() === "yes") {
      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random()*1000)}`;
      try {
        const orderData = {
          orderId,
          customer: sessions[from].name,
          products: sessions[from].products,
          totalAmount: 0,
          status: "pending"
        };
        // If image was sent, store image filename in order
        if (sessions[from].imageFilename) {
          orderData.image = sessions[from].imageFilename;
        }
        const order = new Order(orderData);
        await order.save();
        reply = `🎉 Order confirmed!\nOrder ID: ${orderId}`;
      } catch (err) {
        reply = `❌ Error saving order: ${err.message}`;
      }
      delete sessions[from];
    } else {
      reply = "❌ Invalid response. Type 'yes' to confirm order or 'exit' to cancel.";
    }
  }

  // ---------------- SEND REPLY ----------------
  console.log(`Sending reply to ${from}: ${reply}`);
  try {
    const response = await fetch(`https://graph.facebook.com/v22.0/${changes.metadata.phone_number_id}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.WP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        text: { body: reply }
      })
    });
    if (!response.ok) {
      console.error(`Failed to send reply: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
    } else {
      console.log("Reply sent successfully");
    }
  } catch (err) {
    console.error("Error sending reply:", err);
  }

  res.sendStatus(200);
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
