import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/* ================= FETCH SESSIONS ================= */

export const fetchTrainerSessions = createAsyncThunk(
  "sessions/fetchTrainerSessions",
  async (trainerId) => {
    const token = localStorage.getItem("adminToken");

    const res = await fetch(
      `https://fitness-app-seven-beryl.vercel.app/api/trainers/${trainerId}/sessions`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    return data.data || [];
  }
);

const sessionSlice = createSlice({
  name: "sessions",
  initialState: {
    sessions: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrainerSessions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrainerSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchTrainerSessions.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default sessionSlice.reducer;
