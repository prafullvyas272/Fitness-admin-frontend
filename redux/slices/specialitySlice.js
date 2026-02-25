import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const baseURL = "https://fitness-app-seven-beryl.vercel.app/api";

/* ================= FETCH ================= */

export const fetchSpecialities = createAsyncThunk(
  "speciality/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${baseURL}/specialities`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error();

      return data?.data || [];
    } catch (error) {
      return rejectWithValue("Failed to fetch specialities");
    }
  }
);

/* ================= CREATE ================= */

export const createSpeciality = createAsyncThunk(
  "speciality/create",
  async (name, { rejectWithValue }) => {
    try {
      const res = await fetch(`${baseURL}/specialities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error();

      return name;
    } catch (error) {
      return rejectWithValue("Failed to create speciality");
    }
  }
);

/* ================= DELETE ================= */

export const deleteSpeciality = createAsyncThunk(
  "speciality/delete",
  async (id, { rejectWithValue }) => {
    try {
      await fetch(`${baseURL}/specialities/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      return id;
    } catch (error) {
      return rejectWithValue("Failed to delete speciality");
    }
  }
);

/* ================= SLICE ================= */

const specialitySlice = createSlice({
  name: "speciality",
  initialState: {
    skills: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpecialities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpecialities.fulfilled, (state, action) => {
        state.loading = false;
        state.skills = action.payload;
      })
      .addCase(fetchSpecialities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createSpeciality.fulfilled, (state, action) => {
        state.skills.push({
          id: Date.now(),
          name: action.payload,
        });
      })

      .addCase(deleteSpeciality.fulfilled, (state, action) => {
        state.skills = state.skills.filter(
          (skill) => skill.id !== action.payload
        );
      });
  },
});

export default specialitySlice.reducer;