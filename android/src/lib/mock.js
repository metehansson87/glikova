// ─── Mock data store ───────────────────────────────────────────
// In-memory state that simulates Supabase + Auth for UI testing.

export const MOCK_USER = {
  id: "mock-user-001",
  email: "demo@glikova.app",
};

export const MOCK_SESSION = {
  user: MOCK_USER,
};

const now = new Date();
const d = (hoursAgo) => new Date(now - hoursAgo * 3600000).toISOString();

export let mockReadings = [
  { id: "r1",  user_id: MOCK_USER.id, value_mgdl: 94,  meal_context: "fasting",     recorded_at: d(1),   notes: null },
  { id: "r2",  user_id: MOCK_USER.id, value_mgdl: 142, meal_context: "after_meal",  recorded_at: d(3),   notes: "After pasta" },
  { id: "r3",  user_id: MOCK_USER.id, value_mgdl: 108, meal_context: "before_meal", recorded_at: d(6),   notes: null },
  { id: "r4",  user_id: MOCK_USER.id, value_mgdl: 65,  meal_context: "bedtime",     recorded_at: d(10),  notes: "Felt a bit dizzy" },
  { id: "r5",  user_id: MOCK_USER.id, value_mgdl: 188, meal_context: "after_meal",  recorded_at: d(18),  notes: "Pizza night 🍕" },
  { id: "r6",  user_id: MOCK_USER.id, value_mgdl: 99,  meal_context: "fasting",     recorded_at: d(24),  notes: null },
  { id: "r7",  user_id: MOCK_USER.id, value_mgdl: 121, meal_context: "before_meal", recorded_at: d(30),  notes: null },
  { id: "r8",  user_id: MOCK_USER.id, value_mgdl: 210, meal_context: "after_meal",  recorded_at: d(48),  notes: "Dessert overload" },
  { id: "r9",  user_id: MOCK_USER.id, value_mgdl: 88,  meal_context: "fasting",     recorded_at: d(55),  notes: null },
  { id: "r10", user_id: MOCK_USER.id, value_mgdl: 76,  meal_context: "bedtime",     recorded_at: d(70),  notes: null },
  // Older than 3 days — hidden in free tier
  { id: "r11", user_id: MOCK_USER.id, value_mgdl: 115, meal_context: "fasting",     recorded_at: d(90),  notes: null },
  { id: "r12", user_id: MOCK_USER.id, value_mgdl: 195, meal_context: "after_meal",  recorded_at: d(110), notes: "Weekend brunch" },
];

let _isPremium = false;

export const mockStore = {
  getReadings: () => [...mockReadings].sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at)),
  addReading: (reading) => {
    const newItem = { ...reading, id: `r${Date.now()}`, user_id: MOCK_USER.id };
    mockReadings = [newItem, ...mockReadings];
    return newItem;
  },
  deleteReading: (id) => {
    mockReadings = mockReadings.filter(r => r.id !== id);
  },
  isPremium: () => _isPremium,
  setPremium: (val) => { _isPremium = val; },
};

// Add deleteAll method
mockStore.deleteAll = () => { mockReadings = []; };
