import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =
  "https://fitness-app-seven-beryl.vercel.app/api/workout-videos";

const getToken = () => localStorage.getItem("adminToken");

/* =============================
   GET ALL WORKOUTS
============================= */
export const fetchWorkouts = createAsyncThunk(
  "workout/fetchWorkouts",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      return res.data.data; // ✅ array only

    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

/* =============================
   UPLOAD WORKOUT
============================= */
export const uploadWorkout = createAsyncThunk(
  "workout/uploadWorkout",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post(API_URL, formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data.data; // ✅ return only workout object

    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

/* =============================
   DELETE WORKOUT
============================= */
export const removeWorkout = createAsyncThunk(
  "workout/removeWorkout",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      return id;

    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

/* =============================
   UPDATE WORKOUT
============================= */
export const updateWorkoutAPI = createAsyncThunk(
  "workout/updateWorkoutAPI",
  async ({ id, formData }, thunkAPI) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data.data; // ✅ return updated workout only

    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

/* =============================
   SLICE
============================= */
const workoutSlice = createSlice({
  name: "workout",
  initialState: {
    workouts: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* ================= GET ================= */
      .addCase(fetchWorkouts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkouts.fulfilled, (state, action) => {
        state.loading = false;

        state.workouts = Array.isArray(action.payload)
          ? action.payload.map((item) => ({
              ...item,
              id: item.id || item._id,
            }))
          : [];
      })
      .addCase(fetchWorkouts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= POST ================= */
      .addCase(uploadWorkout.fulfilled, (state, action) => {
        state.workouts.unshift({
          ...action.payload,
          id: action.payload.id || action.payload._id,
        });
      })

      /* ================= DELETE ================= */
      .addCase(removeWorkout.fulfilled, (state, action) => {
        state.workouts = state.workouts.filter(
          (item) => item.id !== action.payload
        );
      })

      /* ================= UPDATE ================= */
      .addCase(updateWorkoutAPI.fulfilled, (state, action) => {
        const index = state.workouts.findIndex(
          (item) => item.id === action.payload.id
        );

        if (index !== -1) {
          state.workouts[index] = {
            ...action.payload,
            id: action.payload.id || action.payload._id,
          };
        }
      });
  },
});

export default workoutSlice.reducer;