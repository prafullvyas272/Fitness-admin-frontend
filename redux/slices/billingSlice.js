import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://fitness-app-seven-beryl.vercel.app/api/plans";
const STATS_URL = "https://fitness-app-seven-beryl.vercel.app/api/subscriptions/stats";

/* ================================
   FETCH SUBSCRIPTION STATS
================================ */
export const fetchSubscriptionStats = createAsyncThunk(
  "billing/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const res = await axios.get(STATS_URL, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching stats");
    }
  }
);

/* ================================
   GET ALL PLANS
================================ */
export const fetchPlans = createAsyncThunk(
  "billing/fetchPlans",
  async (_, { rejectWithValue }) => {
    try {
      const adminToken = localStorage.getItem("adminToken");

const res = await axios.get(API_URL, {
  headers: {
    Authorization: `Bearer ${adminToken}`,
  },
});
      return res.data.data.plans;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching plans");
    }
  }
);

/* ================================
   CREATE PLAN
================================ */
export const createPlan = createAsyncThunk(
  "billing/createPlan",
  async (planData, { rejectWithValue }) => {
    try {
      const adminToken = localStorage.getItem("adminToken");

const res = await axios.post(API_URL, planData, {
  headers: {
    Authorization: `Bearer ${adminToken}`,
  },
});
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error creating plan");
    }
  }
);

/* ================================
   UPDATE PLAN
================================ */
export const updatePlan = createAsyncThunk(
  "billing/updatePlan",
  async ({ id, planData }, { rejectWithValue }) => {
    try {
      const adminToken = localStorage.getItem("adminToken");

await axios.put(`${API_URL}/${id}`, planData, {
  headers: {
    Authorization: `Bearer ${adminToken}`,
  },
});
      return { id, planData };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error updating plan");
    }
  }
);

/* ================================
   DELETE PLAN
================================ */
export const deletePlan = createAsyncThunk(
  "billing/deletePlan",
  async (id, { rejectWithValue }) => {
    try {
      const adminToken = localStorage.getItem("adminToken");

await axios.delete(`${API_URL}/${id}`, {
  headers: {
    Authorization: `Bearer ${adminToken}`,
  },
});
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error deleting plan");
    }
  }
);


//assign plan to trainers
export const assignPlanToTrainers = createAsyncThunk(
  "billing/assignPlanToTrainers",
  async ({ planId, trainerIds }, { rejectWithValue }) => {
    try {
      const adminToken = localStorage.getItem("adminToken");

      await axios.put(
        "https://fitness-app-seven-beryl.vercel.app/api/admin-assign-plan",
        { trainerIds, planId },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      return { planId, trainerIds };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error assigning plan");
    }
  }
);

/* ================================
   SLICE
================================ */

const billingSlice = createSlice({
  name: "billing",
  initialState: {
    plans: [],
    stats: {
      activeSubscriptions: 0,
      totalPlans: 0,
      expiringPlans: 0,
    },
    loading: false,
    statsLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // FETCH STATS
      .addCase(fetchSubscriptionStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchSubscriptionStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchSubscriptionStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })

      // FETCH PLANS
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE
      .addCase(createPlan.fulfilled, (state, action) => {
        state.plans.push(action.payload);
      })

      // Add this case in extraReducers builder
.addCase(assignPlanToTrainers.fulfilled, (state, action) => {
  const { planId, trainerIds } = action.payload;
  const index = state.plans.findIndex((p) => p.id === planId);
  if (index !== -1) {
    state.plans[index].assignedTrainers = trainerIds;
  }
})

      // UPDATE
      .addCase(updatePlan.fulfilled, (state, action) => {
  const { id, planData } = action.payload;

  const index = state.plans.findIndex((p) => p.id === id); // ✅ FIXED

  if (index !== -1) {
    state.plans[index] = {
      ...state.plans[index],
      ...planData,
    };
  }
})

      // DELETE
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter(
  (plan) => plan.id !== action.payload
);
      });
  },
});

export default billingSlice.reducer;