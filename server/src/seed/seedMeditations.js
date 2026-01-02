// server/src/seed/seedMeditations.js
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Meditation = require("../models/Meditation");

const BASE_URL = process.env.SERVER_PUBLIC_URL || "http://localhost:5000";

const seedMeditations = [
  {
    title: "Deep Forest Meditation",
    description:
      "Let the silence of a forest surround your mind. This meditation will help you focus on your work.",
    audioUrl: `${BASE_URL}/uploads/meditations/audio/deep-forest-meditation.mp3`,
    imageUrl: `${BASE_URL}/uploads/meditations/images/deep-forest-meditation.png`,
    coachName: "Vibrance Team",
    category: "Beginners",
    durationMinutes: 4,
    tags: ["beginners", "focus", "calm"],
    isPublic: true
  },
  {
    title: "Body Scan Basics",
    description:
      "A guided body scan to help you relax from head to toe and notice sensations without judgment.",
    audioUrl: `${BASE_URL}/uploads/meditations/audio/body-scan-basics.mp3`,
    imageUrl: `${BASE_URL}/uploads/meditations/images/body-scan-basics.png`,
    coachName: "Vibrance Team",
    category: "Beginners",
    durationMinutes: 10,
    tags: ["beginners", "body-scan", "relaxation"],
    isPublic: true
  },

  {
    title: "Calm in 5 Minutes",
    description:
      "A short SOS practice for moments of stress, focusing on grounding your senses.",
    audioUrl: `${BASE_URL}/uploads/meditations/audio/calm-in-5-minutes.mp3`,
    imageUrl: `${BASE_URL}/uploads/meditations/images/calm-in-5-minutes.png`,
    coachName: "Vibrance Team",
    category: "Anxiety",
    durationMinutes: 5,
    tags: ["anxiety", "stress", "short-session", "grounding"],
    isPublic: true
  },
  {
    title: "Letting Go of Worry",
    description:
      "A gentle practice to notice anxious thoughts and let them pass without getting stuck.",
    audioUrl: `${BASE_URL}/uploads/meditations/audio/letting-go-of-worry.mp3`,
    imageUrl: `${BASE_URL}/uploads/meditations/images/letting-go-of-worry.png`,
    coachName: "Vibrance Team",
    category: "Anxiety",
    durationMinutes: 15,
    tags: ["anxiety", "worry", "calm"],
    isPublic: true
  },


  {
    title: "Rain Sleep Meditation",
    description:
      "Slow your breathing, relax your body, and ease into a restful night of sleep with these soothing rain sounds.",
    audioUrl: `${BASE_URL}/uploads/meditations/audio/rain-sleep-meditation.mp3`,
    imageUrl: `${BASE_URL}/uploads/meditations/images/rain-sleep-meditation.png`,
    coachName: "Vibrance Team",
    category: "Sleep",
    durationMinutes: 5,
    tags: ["sleep", "evening", "relaxation"],
    isPublic: true
  },
  {
    title: "Deep Sleep Journey",
    description:
      "A longer relaxation practice designed to carry you into deep, uninterrupted sleep.",
    audioUrl: `${BASE_URL}/uploads/meditations/audio/deep-sleep-journey.mp3`,
    imageUrl: `${BASE_URL}/uploads/meditations/images/deep-sleep-journey.png`,
    coachName: "Vibrance Team",
    category: "Sleep",
    durationMinutes: 20,
    tags: ["sleep", "long-session", "deep-relaxation"],
    isPublic: true
  },


  {
    title: "Run Through Your Mind",
    description:
      "Prepare your mind for focused work with breath and attention training.",
    audioUrl: `${BASE_URL}/uploads/meditations/audio/run-through-your-mind.mp3`,
    imageUrl: `${BASE_URL}/uploads/meditations/images/run-through-your-mind.png`,
    coachName: "Vibrance Team",
    category: "Focus",
    durationMinutes: 15,
    tags: ["focus", "productivity", "work"],
    isPublic: true
  },
  {
    title: "Deep Work Preparation",
    description:
      "A pre-work practice to set clear intentions and train your mind to return to the task.",
    audioUrl: `${BASE_URL}/uploads/meditations/audio/deep-work-preparation.mp3`,
    imageUrl: `${BASE_URL}/uploads/meditations/images/deep-work-preparation.png`,
    coachName: "Vibrance Team",
    category: "Focus",
    durationMinutes: 15,
    tags: ["focus", "deep-work", "intentions"],
    isPublic: true
  },

  {
    title: "Self-Compassion Break",
    description:
      "Practice speaking to yourself with kindness, especially when you feel you’ve failed.",
    audioUrl: `${BASE_URL}/uploads/meditations/audio/self-compassion-break.mp3`,
    imageUrl: `${BASE_URL}/uploads/meditations/images/self-compassion-break.png`,
    coachName: "Vibrance Team",
    category: "Other",
    durationMinutes: 8,
    tags: ["self-compassion", "kindness", "healing"],
    isPublic: true
  },
  {
    title: "Gratitude Reflection",
    description:
      "A gentle reflection on what is going well, to balance your mind’s negativity bias.",
    audioUrl: `${BASE_URL}/uploads/meditations/audio/gratitude-reflection.mp3`,
    imageUrl: `${BASE_URL}/uploads/meditations/images/gratitude-reflection.png`,
    coachName: "Vibrance Team",
    category: "Other",
    durationMinutes: 12,
    tags: ["gratitude", "positivity", "reflection"],
    isPublic: true
  },

  {
    title: "1-Minute Reset",
    description:
      "A micro-practice for when you feel overwhelmed and need a quick reset.",
    audioUrl: `${BASE_URL}/uploads/meditations/audio/1-minute-reset.mp3`,
    imageUrl: `${BASE_URL}/uploads/meditations/images/1-minute-reset.png`,
    coachName: "Vibrance Team",
    category: "Other",
    durationMinutes: 1,
    tags: ["short-session", "reset", "grounding"],
    isPublic: true
  },
  {
    title: "3-Minute Grounding",
    description:
      "A short grounding practice using the sensations of sitting or standing.",
    audioUrl: `${BASE_URL}/uploads/meditations/audio/3-minute-grounding.mp3`,
    imageUrl: `${BASE_URL}/uploads/meditations/images/3-minute-grounding.png`,
    coachName: "Vibrance Team",
    category: "Other",
    durationMinutes: 3,
    tags: ["grounding", "anxiety", "short-session"],
    isPublic: true
  }
];

(async () => {
  try {
    await connectDB();
    await Meditation.deleteMany({});
    await Meditation.insertMany(seedMeditations);
    console.log("Meditations seeded successfully.");
    mongoose.connection.close();
  } catch (err) {
    console.error("Seeding failed:", err);
    mongoose.connection.close();
  }
})();
