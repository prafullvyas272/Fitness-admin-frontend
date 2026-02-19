import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  trainers: [],
  selectedTrainer: null,
  loading: false,
  error: null,
};

export const fetchTrainerById = createAsyncThunk(
  "trainers/fetchTrainerById",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/trainers/${id}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch trainer");
      }

      return data.data;

    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


/* =========================
   FETCH TRAINERS (ASYNC)
========================= */
export const fetchTrainers = createAsyncThunk(
  "trainers/fetchTrainers",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(
        "https://fitness-app-seven-beryl.vercel.app/api/trainers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message);
      }

      return data.data;

    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTrainer = createAsyncThunk(
  "trainers/createTrainer",
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        "https://fitness-app-seven-beryl.vercel.app/api/trainers",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message);
      }

      return data.data; // created trainer
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTrainerAsync = createAsyncThunk(
  "trainers/updateTrainerAsync",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/trainers/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message);
      }

      return data.data; // updated trainer

    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


const trainerSlice = createSlice({
  name: "trainers",
  initialState,

  reducers: {
    setSelectedTrainer: (state, action) => {
      state.selectedTrainer = action.payload;
    },

    addTrainer: (state, action) => {
      state.trainers.unshift(action.payload);
    },

    updateTrainer: (state, action) => {
      const index = state.trainers.findIndex(
        (t) => t.id === action.payload.id
      );
      if (index !== -1) {
        state.trainers[index] = action.payload;
      }
    },

    updateTrainerStatusRedux: (state, action) => {
      const { id, isActive } = action.payload;
      const trainer = state.trainers.find((t) => t.id === id);
      if (trainer) {
        trainer.isActive = isActive;
      }
    },

    removeTrainer: (state, action) => {
      state.trainers = state.trainers.filter(
        (t) => t.id !== action.payload
      );
    },
    removeCustomerFromTrainer: (state, action) => {
  const customerId = action.payload;

  if (state.selectedTrainer) {
    state.selectedTrainer.assignedCustomersAsTrainer =
      state.selectedTrainer.assignedCustomersAsTrainer.filter(
        (item) => item.customer.id !== customerId
      );
  }
},
  },

  /* =========================
     CONNECT ASYNC THUNK HERE
  ========================= */
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrainers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrainers.fulfilled, (state, action) => {
  state.loading = false;

  state.trainers = action.payload.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
})

      .addCase(fetchTrainers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTrainerById.pending, (state) => {
      state.loading = true;
    })
    .addCase(fetchTrainerById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedTrainer = action.payload;
    })
    .addCase(fetchTrainerById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    .addCase(createTrainer.pending, (state) => {
  state.loading = true;
})
.addCase(createTrainer.fulfilled, (state, action) => {
  state.loading = false;
  state.trainers.unshift(action.payload); // add new trainer to list
})
.addCase(createTrainer.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})
.addCase(updateTrainerAsync.pending, (state) => {
  state.loading = true;
})
.addCase(updateTrainerAsync.fulfilled, (state, action) => {
  state.loading = false;

  const updatedTrainer = action.payload;

  // ✅ Update trainers list instantly
  const index = state.trainers.findIndex(
    (t) => t.id === updatedTrainer.id
  );

  if (index !== -1) {
    state.trainers[index] = updatedTrainer;
  }

  // ✅ Update selectedTrainer if open in view page
  if (
    state.selectedTrainer &&
    state.selectedTrainer.id === updatedTrainer.id
  ) {
    state.selectedTrainer = updatedTrainer;
  }
})

.addCase(updateTrainerAsync.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})
  },
});


export const {
    setTrainers,
  setSelectedTrainer,
  addTrainer,
  updateTrainer,
  removeTrainer,
  setTrainerLoading,
  setTrainerError,
  removeCustomerFromTrainer,
  updateTrainerStatusRedux,
} = trainerSlice.actions;

export default trainerSlice.reducer;
