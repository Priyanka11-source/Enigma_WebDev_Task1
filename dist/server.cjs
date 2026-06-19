var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.js
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_vite = require("vite");
var import_vite2 = __toESM(require("@tailwindcss/vite"), 1);
var import_plugin_react = __toESM(require("@vitejs/plugin-react"), 1);
var import_genai = require("@google/genai");
var dotenv = __toESM(require("dotenv"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_app = require("firebase-admin/app");
var import_auth = require("firebase-admin/auth");
var import_firestore = require("firebase-admin/firestore");
var import_meta = {};
dotenv.config();
var firebaseConfig = {};
try {
  const configPath = import_path.default.join(process.cwd(), "firebase-applet-config.json");
  if (import_fs.default.existsSync(configPath)) {
    firebaseConfig = JSON.parse(import_fs.default.readFileSync(configPath, "utf8"));
  }
} catch (error) {
  console.warn("Failed to load firebase-applet-config.json:", error);
}
var firebaseProjectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || firebaseConfig.projectId || "enduring-stage-5dzmz";
var databaseId = firebaseConfig.firestoreDatabaseId || "ai-studio-7ae13ecc-07ff-4eb7-accc-4e1d8cbbe44b";
var adminApp = (0, import_app.getApps)().length === 0 ? (0, import_app.initializeApp)({
  projectId: firebaseProjectId
}) : (0, import_app.getApp)();
var adminDb = (0, import_firestore.getFirestore)(adminApp, databaseId);
async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized. No token provided." });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decoded = await (0, import_auth.getAuth)(adminApp).verifyIdToken(token);
    req.userId = decoded.uid;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    console.error("Auth verification failed:", error);
    return res.status(401).json({ error: "Unauthorized. Invalid token." });
  }
}
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  const apiKey = process.env.GEMINI_API_KEY;
  let ai = null;
  if (apiKey) {
    ai = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  } else {
    console.warn("WARNING: GEMINI_API_KEY is not defined. AI Chatbot functionality will return warning messages.");
  }
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", chatbotEnabled: !!ai });
  });
  app.get("/api/notes", authenticateUser, async (req, res) => {
    try {
      const userId = req.userId;
      const notesSnapshot = await adminDb.collection("notes").where("userId", "==", userId).get();
      const notes = [];
      notesSnapshot.forEach((doc) => {
        notes.push({ id: doc.id, ...doc.data() });
      });
      notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ error: error.message || "Failed to fetch notes." });
    }
  });
  app.post("/api/notes", authenticateUser, async (req, res) => {
    try {
      const userId = req.userId;
      const { title, category, content, codeSnippet, codeLanguage, tags } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required." });
      }
      const timestamp = (/* @__PURE__ */ new Date()).toISOString();
      const newNote = {
        userId,
        title,
        category: category || "General",
        content,
        codeSnippet: codeSnippet || "",
        codeLanguage: codeLanguage || "cpp",
        tags: tags || [],
        createdAt: timestamp,
        updatedAt: timestamp
      };
      const docRef = await adminDb.collection("notes").add(newNote);
      res.json({ id: docRef.id, ...newNote });
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ error: error.message || "Failed to create note." });
    }
  });
  app.put("/api/notes/:id", authenticateUser, async (req, res) => {
    try {
      const userId = req.userId;
      const noteId = req.params.id;
      const { title, category, content, codeSnippet, codeLanguage, tags } = req.body;
      const docRef = adminDb.collection("notes").doc(noteId);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return res.status(404).json({ error: "Note not found." });
      }
      const existing = docSnap.data();
      if (existing?.userId !== userId) {
        return res.status(403).json({ error: "Permission denied. Not your note." });
      }
      const timestamp = (/* @__PURE__ */ new Date()).toISOString();
      const updatedFields = {
        updatedAt: timestamp
      };
      if (title !== void 0) updatedFields.title = title;
      if (category !== void 0) updatedFields.category = category;
      if (content !== void 0) updatedFields.content = content;
      if (codeSnippet !== void 0) updatedFields.codeSnippet = codeSnippet;
      if (codeLanguage !== void 0) updatedFields.codeLanguage = codeLanguage;
      if (tags !== void 0) updatedFields.tags = tags;
      await docRef.update(updatedFields);
      res.json({ id: noteId, ...existing, ...updatedFields });
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({ error: error.message || "Failed to update note." });
    }
  });
  app.delete("/api/notes/:id", authenticateUser, async (req, res) => {
    try {
      const userId = req.userId;
      const noteId = req.params.id;
      const docRef = adminDb.collection("notes").doc(noteId);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return res.status(404).json({ error: "Note not found." });
      }
      const existing = docSnap.data();
      if (existing?.userId !== userId) {
        return res.status(403).json({ error: "Permission denied." });
      }
      await docRef.delete();
      res.json({ success: true, id: noteId });
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ error: error.message || "Failed to delete note." });
    }
  });
  app.get("/api/tracking", authenticateUser, async (req, res) => {
    try {
      const userId = req.userId;
      const trackerDocRef = adminDb.collection("users").doc(userId).collection("tracking").doc("state");
      const d = await trackerDocRef.get();
      if (d.exists) {
        res.json(d.data());
      } else {
        res.json({ gate: null, leetcode: null });
      }
    } catch (error) {
      console.error("Error loading tracking state:", error);
      res.status(500).json({ error: error.message || "Failed to load trackers." });
    }
  });
  app.post("/api/tracking", authenticateUser, async (req, res) => {
    try {
      const userId = req.userId;
      const { gate, leetcode } = req.body;
      const trackerDocRef = adminDb.collection("users").doc(userId).collection("tracking").doc("state");
      const timestamp = (/* @__PURE__ */ new Date()).toISOString();
      const dataToSave = {
        updatedAt: timestamp
      };
      if (gate !== void 0) dataToSave.gate = gate;
      if (leetcode !== void 0) dataToSave.leetcode = leetcode;
      await trackerDocRef.set(dataToSave, { merge: true });
      res.json({ success: true, ...dataToSave });
    } catch (error) {
      console.error("Error saving tracking state:", error);
      res.status(500).json({ error: error.message || "Failed to save trackers." });
    }
  });
  app.post("/api/chat", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({
          error: "Gemini API Key is not configured on the server. Please add GEMINI_API_KEY in the Secrets panel."
        });
      }
      const { messages, topic, systemPrompt } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages format." });
      }
      const formattedPrompt = messages.map(
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      ).join("\n") + "\nAssistant:";
      const systemInstruction = systemPrompt || "You are an expert CSE (Computer Science & Engineering) Companion. You help students with DSA, Coding, LeetCode, software engineering, and GATE exam prep. When writing code, always explain the reasoning, dry run with a simple test case, and mention Time & Space complexity. Keep responses visually aligned, elegant, and useful.";
      let response = null;
      let usedModel = "";
      const modelsToTry = [
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite"
      ];
      let lastError = null;
      for (const model of modelsToTry) {
        try {
          usedModel = model;
          const attempt = await ai.models.generateContent({
            model: usedModel,
            contents: formattedPrompt,
            config: {
              systemInstruction,
              temperature: 0.7
            }
          });
          if (attempt) {
            response = attempt;
            break;
          }
        } catch (err) {
          console.warn(`Model '${model}' failed:`, err.message || err);
          lastError = err;
        }
      }
      if (!response) {
        console.error("All fallback models failed.");
        throw lastError || new Error("All fallback Gemini models failed.");
      }
      const reply = response.text || "No response generated.";
      res.json({ reply });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to communicate with AI model." });
    }
  });
  if (true) {
    const vite = await (0, import_vite.createServer)({
      configFile: false,
      root: __dirname,
      plugins: [(0, import_plugin_react.default)(), (0, import_vite2.default)()],
      resolve: {
        alias: {
          "@": import_path.default.resolve(__dirname, ".")
        }
      },
      optimizeDeps: {
        disabled: true
      },
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started. Ingress binds to http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((error) => {
  console.error("Failed to boot server:", error);
});
//# sourceMappingURL=server.cjs.map
