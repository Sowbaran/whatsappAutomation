// whatsappApi.js
console.log("This file is running also whatsappApi !!!");

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";
import Order from "../models/orderModel.js";
import Customer from "../models/customerModel.js";
import Salesman from "../models/salesmanModel.js";
import Tesseract from "tesseract.js";

dotenv.config();

const app = express();
const PORT = 3002;
app.use(express.json());

// Connect to MongoDB asynchronously
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB);
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

// Main menu text to send after completing operations
const MAIN_MENU = `\n\nWhat would you like to do next?\n👋 Main Menu:\n1️⃣ Order\n2️⃣ Contact Shop\n3️⃣ Track Order\n4️⃣ Cancel order`;

// ---------------- Webhook for incoming messages ----------------
app.post("/webhook", async (req, res) => {

  const changes = req.body.entry?.[0]?.changes?.[0]?.value;
  // If the webhook payload doesn't include the expected 'changes' object, ignore it
  if (!changes) return res.sendStatus(200);

  // Ignore events that do NOT contain a messages array (status, delivery, etc.)
  if (!changes.messages || !Array.isArray(changes.messages) || changes.messages.length === 0) {
    return res.sendStatus(200);
  }

  const message = changes.messages[0];

  // Basic log for inbound message (kept for debugging)
  console.log(message);


  // NOTE: previously we attempted to detect echoes by checking message.id prefixes
  // and comparing message.from to our phone id, but those checks were too
  // aggressive and matched legitimate user messages. We intentionally do not
  // perform those unreliable checks here to avoid dropping real user messages.

  // Only process text or image message types
  if (message.type !== 'text' && message.type !== 'image') {
    console.log('Ignoring non-text/image message type:', message.type);
    return res.sendStatus(200);
  }

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
    // fall through to unified reply logic below
  }


  // ---------------- TEXT HANDLING ----------------
  // Menu and session flow (unchanged from your original code)
  if (message.type !== "image") {
    if (sessions[from].step === "menu") {
      if (text === "1") {
        sessions[from].step = "awaiting_customer_details";
        reply = "📝 Please enter your details in this format:\nname,email,phone,address\n\nExample: Rajesh Kumar,rajesh.kumar@example.com,9123456789,123 MG Road Mumbai\n\n(Type 'exit' to cancel)";
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
        reply = "❌ Order process cancelled. Returning to main menu." + MAIN_MENU;
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
            // store full customer details in session so we can create a proper customer object for the order
            sessions[from].customer = { name, email, phone, shippingAddress: address, billingAddress: address };
            sessions[from].name = name;
            sessions[from].step = "awaiting_products";
            sessions[from].products = [];
            reply = `Thanks ${name}! Please enter your products in format: PRODUCT1:QTY1, PRODUCT2:QTY2, ...\n\nExample: Mobile Phone:1, Charger:2`;
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
        reply = "❌ Order cancelled. Returning to menu." + MAIN_MENU;
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
        reply = "❌ Order cancelled. Returning to menu." + MAIN_MENU;
        sessions[from] = { step: "menu" };
        } else if (text.trim().toLowerCase() === "yes") {
        const orderId = `ORD-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        try {
          // Ensure products include a price (default 0) so Order schema validation passes
          const productsToSave = (sessions[from].products || []).map(p => ({
            product: p.product,
            price: (p.price != null ? p.price : 0),
            quantity: p.quantity
          }));

          const orderData = {
            orderId,
            // prefer structured customer object if available
            customer: sessions[from].customer || { name: sessions[from].name },
            products: productsToSave,
            totalAmount: 0,
            status: "pending"
          };
          // If image was sent, store image filename in order
          if (sessions[from].imageFilename) {
            orderData.image = sessions[from].imageFilename;
          }
          const order = new Order(orderData);
          await order.save();
          reply = `🎉 Order confirmed!\nOrder ID: ${orderId}` + MAIN_MENU;
        } catch (err) {
          reply = `❌ Error saving order: ${err.message}` + MAIN_MENU;
        }
        // clear session after confirming order
        delete sessions[from];
      } else {
        reply = "❌ Invalid response. Type 'yes' to confirm order or 'exit' to cancel.";
      }
    }

    // ---------------- TRACK ORDER ----------------
    else if (sessions[from].step === "awaiting_track_order") {
      if (text.trim().toLowerCase() === 'exit') {
        reply = '🔙 Returning to main menu.' + MAIN_MENU;
        sessions[from] = { step: 'menu' };
      } else {
        const key = text.trim();
        try {
          let order = await Order.findOne({ orderId: key }).populate({ path: 'salesman', model: 'Salesman' });
          if (!order && mongoose.Types.ObjectId.isValid(key)) {
            order = await Order.findById(key).populate({ path: 'salesman', model: 'Salesman' });
          }
          if (!order) {
            reply = `🔍 No order found for ID: ${key}` + MAIN_MENU;
          } else {
            // Reply only with the status string (single field)
            reply = `Your Order status is: ${String(order.status || 'unknown')}` + MAIN_MENU;
          }
        } catch (err) {
          console.error('Error tracking order:', err);
          reply = `❌ Error finding order: ${err.message}` + MAIN_MENU;
        }
        // return to menu after tracking
        sessions[from] = { step: 'menu' };
      }
    }

    // ---------------- CANCEL ORDER ----------------
    else if (sessions[from].step === "awaiting_order_id_cancel") {
      if (text.trim().toLowerCase() === 'exit') {
        reply = '🔙 Returning to main menu.' + MAIN_MENU;
        sessions[from] = { step: 'menu' };
      } else {
        const key = text.trim();
        try {
          let order = await Order.findOne({ orderId: key });
          if (!order && mongoose.Types.ObjectId.isValid(key)) {
            order = await Order.findById(key);
          }
          if (!order) {
            reply = `🔍 No order found for ID: ${key}` + MAIN_MENU;
            sessions[from] = { step: 'menu' };
          } else if (order.pickedUp) {
            reply = `⚠️ Order ${key} has already been picked up and cannot be cancelled.` + MAIN_MENU;
            sessions[from] = { step: 'menu' };
          } else {
            // Save cancel intent in session and ask for reason
            sessions[from].cancel = { orderId: key, orderDbId: order._id };
            sessions[from].step = 'awaiting_cancel_reason';
            reply = `❗ You're about to cancel Order ${key}.
Please enter the reason for cancellation (e.g. "Changed my mind", "Wrong item", etc.).\n(Type 'exit' to abort)`;
          }
        } catch (err) {
          console.error('Error locating order for cancellation:', err);
          reply = `❌ Error: ${err.message}` + MAIN_MENU;
          sessions[from] = { step: 'menu' };
        }
      }
    }

    // Awaiting reason for cancellation
    else if (sessions[from].step === 'awaiting_cancel_reason') {
      if (text.trim().toLowerCase() === 'exit') {
        reply = '❌ Cancellation aborted. Returning to menu.' + MAIN_MENU;
        sessions[from] = { step: 'menu' };
      } else {
        const reason = text.trim();
        if (!sessions[from].cancel || !sessions[from].cancel.orderId) {
          reply = '⚠️ No cancellation in progress. Returning to menu.' + MAIN_MENU;
          sessions[from] = { step: 'menu' };
        } else {
          sessions[from].cancel.reason = reason;
          sessions[from].step = 'awaiting_cancel_confirmation';
          reply = `You entered reason: "${reason}"\nAre you sure you want to cancel Order ${sessions[from].cancel.orderId}? Type 'yes' to confirm or 'no' to abort.`;
        }
      }
    }

    // Awaiting final confirmation to cancel
    else if (sessions[from].step === 'awaiting_cancel_confirmation') {
      const answer = text.trim().toLowerCase();
      if (answer === 'exit' || answer === 'no' || answer === 'n') {
        reply = '❌ Cancellation aborted. Returning to menu.' + MAIN_MENU;
        sessions[from] = { step: 'menu' };
      } else if (answer === 'yes' || answer === 'y') {
        try {
          const cancelInfo = sessions[from].cancel;
          if (!cancelInfo || !cancelInfo.orderDbId) {
            reply = '⚠️ No valid cancellation info found. Returning to menu.' + MAIN_MENU;
            sessions[from] = { step: 'menu' };
          } else {
            const timelineEntry = {
              action: 'Order Cancelled',
              description: `Order cancelled by customer via WhatsApp. Reason: ${cancelInfo.reason || 'Not provided'}`,
              date: new Date(),
              updatedBy: sessions[from]?.customer?.name || sessions[from]?.name || 'WhatsApp User'
            };
            const updated = await Order.findByIdAndUpdate(cancelInfo.orderDbId, { $set: { status: 'cancelled' }, $push: { timeline: timelineEntry } }, { new: true });
            if (updated) reply = `✅ Order ${cancelInfo.orderId} has been cancelled successfully.` + MAIN_MENU;
            else reply = `❌ Failed to cancel order ${cancelInfo.orderId}. Please contact support.` + MAIN_MENU;
          }
        } catch (err) {
          console.error('Error cancelling order after confirmation:', err);
          reply = `❌ Error cancelling order: ${err.message}` + MAIN_MENU;
        }
        sessions[from] = { step: 'menu' };
      } else {
        reply = "❗ Please type 'yes' to confirm cancellation or 'no' to abort.";
      }
    }
  }

  // ---------------- SEND REPLY (Unified for all message types) ----------------
  if (reply) {
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
  }
  res.sendStatus(200);
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
