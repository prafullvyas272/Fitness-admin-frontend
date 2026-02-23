import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchTrainerBookings = createAsyncThunk(
  "sessions/fetchTrainerBookings",
  async (trainerId, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/trainers/${trainerId}/bookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      return data.data.bookings;

    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
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
      .addCase(fetchTrainerBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrainerBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchTrainerBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default sessionSlice.reducer;