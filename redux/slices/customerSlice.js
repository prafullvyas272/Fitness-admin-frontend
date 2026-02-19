import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null,
};

const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setCustomers: (state, action) => {
      state.customers = action.payload;
    },
    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },
    addCustomer: (state, action) => {
      state.customers.push(action.payload);
    },
    updateCustomer: (state, action) => {
      const index = state.customers.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
    },
    removeCustomer: (state, action) => {
      state.customers = state.customers.filter(
        (c) => c.id !== action.payload
      );
    },
    setCustomerLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCustomerError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCustomers,
  setSelectedCustomer,
  addCustomer,
  updateCustomer,
  removeCustomer,
  setCustomerLoading,
  setCustomerError,
} = customerSlice.actions;

export default customerSlice.reducer;
