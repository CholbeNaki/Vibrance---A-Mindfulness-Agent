// server/src/controllers/homeController.js
const Journal = require("../models/JournalEntry");
const MeditationSession = require("../models/MeditationSession");

function startOfDay(date) {
  // local midnight
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// IMPORTANT: use local Y-M-D instead of toISOString() (UTC)
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`; // YYYY-MM-DD
}

exports.getSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    const todayStart = startOfDay(today);

    const daysBack = 14;
    const windowStart = new Date(todayStart);
    windowStart.setDate(windowStart.getDate() - (daysBack - 1)); // include today

    const weekWindowStart = new Date(todayStart);
    weekWindowStart.setDate(weekWindowStart.getDate() - 6); // last 7 days incl today

    // 1) Fetch journals for last 14 days
    const journals = await Journal.find({
      user: userId,
      createdAt: { $gte: windowStart }
    }).lean();

    // 2) Fetch meditation sessions for last 14 days
    const sessions = await MeditationSession.find({
      user: userId,
      createdAt: { $gte: windowStart }
    }).lean();

    // Group journals by date & collect mood
    const journalByDate = {};
    const moodsForWeek = [];
    let weekJournalCount = 0;

    journals.forEach((j) => {
      const date = new Date(j.createdAt);
      const dateKey = formatDateKey(date);

      if (!journalByDate[dateKey]) {
        journalByDate[dateKey] = {
          hasJournal: false,
          moods: []
        };
      }

      journalByDate[dateKey].hasJournal = true;
      if (typeof j.mood === "number") {
        journalByDate[dateKey].moods.push(j.mood);
      }

      // count for last 7 days
      if (date >= weekWindowStart) {
        weekJournalCount += 1;
        if (typeof j.mood === "number") {
          moodsForWeek.push(j.mood);
        }
      }
    });

    // Group sessions by date & sum minutes
    const sessionsByDate = {};
    let weekMinutes = 0;

    sessions.forEach((s) => {
      const date = new Date(s.createdAt);
      const dateKey = formatDateKey(date);

      if (!sessionsByDate[dateKey]) {
        sessionsByDate[dateKey] = {
          minutes: 0
        };
      }
      const minutes = Number(s.durationMinutes) || 0;
      sessionsByDate[dateKey].minutes += minutes;

      if (date >= weekWindowStart) {
        weekMinutes += minutes;
      }
    });

    // compute avg mood over week
    let avgMood = null;
    if (moodsForWeek.length > 0) {
      const sum = moodsForWeek.reduce((acc, v) => acc + v, 0);
      avgMood = sum / moodsForWeek.length;
    }

    // target meditation minutes (for now constant 5)
    const targetMinutes = 5;

    // Build calendar days (last 14 including today)
    const calendarDays = [];
    let streakDays = 0;

    for (let i = daysBack - 1; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const dateKey = formatDateKey(d);

      // label = day of month (e.g. 12, 13, 14)
      const dayLabel = d.getDate();

      const journalInfo = journalByDate[dateKey] || {
        hasJournal: false,
        moods: []
      };
      const sessionInfo = sessionsByDate[dateKey] || { minutes: 0 };

      const hasJournal = journalInfo.hasJournal;
      const minutes = sessionInfo.minutes || 0;
      const didMeditation = minutes >= targetMinutes;

      // per-day mood average
      let moodAvg = null;
      if (journalInfo.moods.length > 0) {
        const sum = journalInfo.moods.reduce(
          (acc, v) => acc + v,
          0
        );
        moodAvg = sum / journalInfo.moods.length;
      }

      let status = "none";
      if (hasJournal && didMeditation) {
        status = "full";
      } else if (hasJournal || minutes > 0) {
        status = "partial";
      }

      calendarDays.push({
        date: dateKey,
        label: dayLabel, // numeric date for circles + charts
        status,
        journalCount: journalInfo.moods.length,
        meditationMinutes: minutes,
        moodAvg
      });
    }

    // compute streak (consecutive "full" days ending today)
    for (let i = calendarDays.length - 1; i >= 0; i--) {
      if (calendarDays[i].status === "full") {
        streakDays++;
      } else {
        break;
      }
    }

    // today's summary
    const todayKey = formatDateKey(todayStart);
    const todayJournal = journalByDate[todayKey] || {
      hasJournal: false,
      moods: []
    };
    const todaySessions = sessionsByDate[todayKey] || { minutes: 0 };

    const todayMeditationMinutes = todaySessions.minutes || 0;
    const todayDidMeditation = todayMeditationMinutes >= targetMinutes;

    const todaySummary = {
      didJournal: todayJournal.hasJournal,
      didMeditation: todayDidMeditation,
      meditationMinutes: todayMeditationMinutes,
      targetMinutes
    };

    // full-practice days in last 7 days (calendar subset)
    const last7 = calendarDays.slice(-7);
    const weekFullPracticeDays = last7.filter(
      (d) => d.status === "full"
    ).length;

    res.json({
      todaySummary,
      calendarDays,
      streakDays,
      weekMinutes,
      avgMood,
      weekJournalCount,
      weekFullPracticeDays
    });
  } catch (err) {
    console.error("Failed to build home summary:", err);
    res
      .status(500)
      .json({ message: "Failed to load home summary" });
  }
};
