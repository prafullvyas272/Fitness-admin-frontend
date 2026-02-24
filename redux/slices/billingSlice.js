import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  plans: [],
};

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    addPlan: (state, action) => {
      state.plans.push(action.payload);
    },

    updatePlan: (state, action) => {
      const { index, updatedPlan } = action.payload;
      state.plans[index] = updatedPlan;
    },

    deletePlan: (state, action) => {
      state.plans.splice(action.payload, 1);
    },
  },
});

export const { addPlan, updatePlan, deletePlan } = billingSlice.actions;
export default billingSlice.reducer;