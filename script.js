// SECTION: State & Elements
const state = {
  steps: 0,
  goal: 5000,
};

const stepsNumberEl = document.getElementById("stepsNumber");
const stepsPercentEl = document.getElementById("stepsPercent");
const ringPercentEl = document.getElementById("ringPercent");
const goalValueEl = document.getElementById("goalValue");
const progressCircleEl = document.getElementById("progressCircle");
const linearFillEl = document.getElementById("linearFill");

const activityLevelEl = document.getElementById("activityLevel");
const activityMessageEl = document.getElementById("activityMessage");
const distanceStatEl = document.getElementById("distanceStat");
const activeMinutesStatEl = document.getElementById("activeMinutesStat");
const caloriesStatEl = document.getElementById("caloriesStat");

const stepsInputEl = document.getElementById("stepsInput");
const goalInputEl = document.getElementById("goalInput");
const quickAddBtn = document.getElementById("quickAddBtn");
const resetBtn = document.getElementById("resetBtn");
const trackerForm = document.getElementById("trackerForm");

// Derived constant for circle circumference (r = 52)
const CIRCUMFERENCE = 2 * Math.PI * 52;

// SECTION: Helpers
function formatNumber(value) {
  return value.toLocaleString("en-US");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function calculatePercent(steps, goal) {
  if (!goal || goal <= 0) return 0;
  return clamp(Math.round((steps / goal) * 100), 0, 200);
}

function classifyActivity(percent) {
  if (percent === 0) {
    return {
      label: "Inactive",
      message: "A fresh start. A short walk will kick things off.",
    };
  }
  if (percent < 40) {
    return {
      label: "Light",
      message: "You're warming up. Try a mid‑day walk to build momentum.",
    };
  }
  if (percent < 80) {
    return {
      label: "Moderate",
      message:
        "Nice work—you're on track to hit your goal. An evening walk will close the gap.",
    };
  }
  if (percent < 120) {
    return {
      label: "High",
      message: "Goal nearly or fully complete. Keep up the streak!",
    };
  }
  return {
    label: "Intense",
    message: "You've blown past your goal. Make time for recovery too.",
  };
}

// Estimate distance, active minutes, and calories using simple heuristics
function deriveStats(steps) {
  const stepLengthKm = 0.00075; // average step ≈ 0.75m
  const distanceKm = steps * stepLengthKm;

  // Rough conversions; not medically accurate, just illustrative
  const activeMinutes = steps / 120; // assume ~120 steps per minute
  const calories = steps * 0.04; // 0.04 kcal per step (~400 kcal per 10k)

  return {
    distanceLabel: `${distanceKm.toFixed(1)} km`,
    activeMinutesLabel: `${Math.round(activeMinutes)} min`,
    caloriesLabel: `${Math.round(calories)} kcal`,
  };
}

// SECTION: Render Function
function render() {
  const percent = calculatePercent(state.steps, state.goal);

  // Update text numbers
  stepsNumberEl.textContent = formatNumber(state.steps);
  stepsPercentEl.textContent = `${percent}% of goal`;
  ringPercentEl.textContent = `${percent}%`;
  goalValueEl.textContent = formatNumber(state.goal);

  // Circular progress (cap visual at 100%; allow overshoot highlight later if desired)
  const visualPercent = clamp(percent, 0, 100);
  const offset = CIRCUMFERENCE * (1 - visualPercent / 100);
  if (progressCircleEl) {
    progressCircleEl.style.strokeDasharray = `${CIRCUMFERENCE}`;
    progressCircleEl.style.strokeDashoffset = `${offset}`;
  }

  // Linear bar
  if (linearFillEl) {
    linearFillEl.style.width = `${visualPercent}%`;
  }

  // Activity classification + stats
  const activity = classifyActivity(percent);
  const derived = deriveStats(state.steps);

  if (activityLevelEl) activityLevelEl.textContent = activity.label;
  if (activityMessageEl) activityMessageEl.textContent = activity.message;
  if (distanceStatEl) distanceStatEl.textContent = derived.distanceLabel;
  if (activeMinutesStatEl)
    activeMinutesStatEl.textContent = derived.activeMinutesLabel;
  if (caloriesStatEl) caloriesStatEl.textContent = derived.caloriesLabel;

  // Keep inputs in sync (without stealing focus when typing)
  if (document.activeElement !== stepsInputEl) {
    stepsInputEl.value = state.steps ? String(state.steps) : "";
  }
  if (document.activeElement !== goalInputEl) {
    goalInputEl.value = state.goal ? String(state.goal) : "";
  }
}

// SECTION: Event Handlers
function handleFormSubmit(event) {
  event.preventDefault();

  const newSteps = Number(stepsInputEl.value);
  const newGoal = Number(goalInputEl.value);

  if (!Number.isNaN(newSteps) && newSteps >= 0) {
    state.steps = newSteps;
  }

  if (!Number.isNaN(newGoal) && newGoal >= 1000) {
    state.goal = newGoal;
  }

  render();
}

function handleQuickAdd() {
  state.steps = Math.max(0, state.steps) + 1000;
  render();
}

function handleReset() {
  state.steps = 0;
  render();
}

// Wire up listeners when DOM is ready
if (trackerForm) {
  trackerForm.addEventListener("submit", handleFormSubmit);
}

if (quickAddBtn) {
  quickAddBtn.addEventListener("click", handleQuickAdd);
}

if (resetBtn) {
  resetBtn.addEventListener("click", handleReset);
}

// Initial paint
render();