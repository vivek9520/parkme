const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const cors = require("cors");

// Initialize Firebase Admin SDK
const serviceAccount = {
  projectId: "dropme-a3d45",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDmDDey23EVvRNu\nsz5/cBWLGKag5MP73Uos1c/1WcgR2XObOIff/187sIe0VerN6P0HxXOJ5HTImrXA\nvDWNcnsCh+HZJeiU3EbU6q8BXX9fw+znrhfapYmY4rZfRlmte2Y8uNQiCiYX8szz\n3RpuVYWPgP+Da3ru625NiWRaj/uIjQssRAVz/vmu+xpKIhzV/1F7kNpP52jQ+NYL\n6DHcmaz6pUUxU/VPb/rwInH6VzEH12XH8Uyd4yxS7nERQmOnsBFmJZh8nK8dUJVs\nG9yYAFElmRYo6BtQNWDmyaoXFkD/VxyOOjSJoEDBwIiEISoFjEgibuIg/9o7NkTa\nWec9hGOBAgMBAAECggEABawnc3GVyENxRzmEQQAyh8uD0FPTwVIjkhdzmUktdcM2\n5ozuTMevQXmI3xl/QLSOCLMFtlC70HaAJNB/QY2hGt7e4svcgE8uL/HZft8fVO0v\n2kagr/OFARAWDyNc8rooOzcThANcDRsfkqPREwdo07EKm+L6lQmZHrBUmScTvLox\npIj2mf6hY4SGp1YGcDeI0z9osLuIfESBbQAIyEeQu5BdlPsecs11XzHy7eMeJToj\nGoVDxIVOrqXiGiJ4a3RlfueUjjC1JZ8K+nnJ411RJe+p4Y2w0JJFeEierMHeRv4N\nw6hN19gmhI/BtnIsnQa9MPQYh+AnoOpHz1ElbTPaQQKBgQDy08DXsaqrzCMD1ITJ\nVaIDCj5BaXPbce4UuCBz+DpDRh7bYn78D2lkNi0S6xxW/RWFRDt5EyvVyT6v8AxI\njq/kixHCS9deWUS5pKANfZNlJZvtlaQBlN74Wzfi43hoQIRWcK8e+KH/OgMxOy2u\nBo0I9y+fGKnyWxXbbfCf7A4BEwKBgQDyhv2c0LVaOBXXv6VIX7ww2nlCsxbYLNNb\ns92jOn7vi8vvTC+tii3ZKFLRJRV13lsr0PV2voGaWM4NKqAoGYFKv6jVRr+3rxr4\nr+qkdxD1n4sgx0tUTdvJuX7u532uyYsM0IrYthBCDRUPVQI1JwU7amjZNx440J3D\nJo6MA/PvmwKBgQCHKletuLfH6VmUSDeh2ojUKF9/CbPz8vcTkWp/Iy1LRTzn4WvN\n4sZHgeCVJ0ofIcFY7SItwv4jgmHijTxJJyPBk6fO/2hinE4lB/4PhFcHdmfVV/Zy\n6usyU5RIN1ZOsZr4gsD3/G4wI5qjTM2gkQTweKeJZ7ExtoH0Ir5ORpeFAQKBgQDa\nYXsULUpfRolEkCjAFpRaWR8/VAuJ9DMNK9SzGgUapgKoIy37UaUfGRQZhw7f56yo\ns6uTlM8WsEg5ytwTv4OQTywzf1U6jM34iE78cMowocyhY1MNQl5aMlF9xayCKrCu\nhUnBAY96KlWATMeEHPK1IYfvr5XjCtZD1wAcS6LnaQKBgQCYUDH1ojiLk/xFbie2\nwWMURmRl66a46hIO4tYrZMCdMruYNKxC6VpS7+YB0Q8VjHHt2qV5r59VE1ApBV9A\n6XSy8wvh/YsSFU0T1jGgpSjniSYYAGeL2VMfW7PIq7CU49/kMYYDYR3RPV8F0xV4\nmR661gWPbxuEsFY2HSyiVtvDDA==\n-----END PRIVATE KEY-----\n",
  clientEmail:"firebase-adminsdk-ozsm7@dropme-a3d45.iam.gserviceaccount.com",
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://parkme-b937c.firebaseio.com", // Replace with your Firebase database URL
});

// Initialize Firestore
const db = admin.firestore();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true); // Allow any origin on localhost
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'], // Specify allowed HTTP methods
}));
app.use(bodyParser.json());

// API to insert data into the ParkingLocation collection
app.post("/addParkingLocation", async (req, res) => {
  try {
    const { name, longitude, latitude, freeSlots, totalSlots } = req.body;

    if (!name || !longitude || !latitude || !freeSlots || !totalSlots) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const parkingData = {
      name,
      longitude,
      latitude,
      freeSlots,
      totalSlots,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("ParkingLocation").add(parkingData);

    res.status(200).json({
      message: "Parking location added successfully.",
      data: { ...parkingData, uniqueId: docRef.id },
    });
  } catch (error) {
    console.error("Error adding parking location:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// API to retrieve all parking locations
app.get("/getParkingLocations", async (req, res) => {
  try {
    const snapshot = await db.collection("ParkingLocation").get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No parking locations found." });
    }

    const locations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      message: "Parking locations retrieved successfully.",
      data: locations,
    });
  } catch (error) {
    console.error("Error retrieving parking locations:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Add more APIs as needed

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
