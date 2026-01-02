const defaultReminder = {
  enabled: false,
  time: "20:00",
  type: "meditation"
};

// GET /api/reminder
exports.getReminder = (req, res) => {
  // if reminder is missing, fall back to defaults
  const reminder = req.user.reminder || defaultReminder;
  res.json({ reminder });
};

// POST /api/reminder
exports.setReminder = async (req, res) => {
  try {
    const { enabled, time, type } = req.body;
    const user = req.user;

    // Ensure reminder object exists
    if (!user.reminder) {
      user.reminder = { ...defaultReminder };
    }

    // Update only provided fields
    if (typeof enabled === "boolean") {
      user.reminder.enabled = enabled;
    }
    if (typeof time === "string") {
      user.reminder.time = time;
    }
    if (typeof type === "string") {
      user.reminder.type = type;
    }

    await user.save();

    res.json({ message: "Reminder updated", reminder: user.reminder });
  } catch (err) {
    console.error("Error updating reminder:", err);
    res.status(500).json({ message: "Could not update reminder" });
  }
};
