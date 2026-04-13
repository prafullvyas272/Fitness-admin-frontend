import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";


/* ================= FETCH CUSTOMERS ================= */

export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        "https://fitness-app-seven-beryl.vercel.app/api/customers",
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

      return data.data.reverse(); // newest first
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/* ================= DELETE ================= */

export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/customers/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/* ================= TOGGLE STATUS ================= */

export const toggleCustomerStatus = createAsyncThunk(
  "customers/toggleStatus",
  async ({ id, isActive }, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/customers/${id}/toggle-active`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      return { id, isActive };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/* ================= ASSIGN TRAINER ================= */

export const assignTrainer = createAsyncThunk(
  "customers/assignTrainer",
  async ({ trainerId, customerId }, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        "https://fitness-app-seven-beryl.vercel.app/api/assign-customer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ trainerId, customerId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      return { customerId, trainerId };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  "customers/fetchCustomerById",
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/customers/${id}/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      return data.data;

    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async ({ id, payload }, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");

      const isFormData = payload instanceof FormData;

      const response = await fetch(
        `https://fitness-app-seven-beryl.vercel.app/api/customers/${id}`,
        {
          method: "PUT",
          headers: isFormData
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
          body: isFormData ? payload : JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      return data.data;

    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (data, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");

      const isFormData = data instanceof FormData;

      const response = await fetch(
        "https://fitness-app-seven-beryl.vercel.app/api/customers",
        {
          method: "POST",
          headers: isFormData
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
          body: isFormData ? data : JSON.stringify(data),
        }
      );

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message);
      }

      return resData.data;

    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/* ================= SLICE ================= */

const customerSlice = createSlice({
  name: "customers",
  initialState: {
    customers: [],
    loading: false,
    error: null,
    selectedCustomer: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter(
          (c) => c.id !== action.payload
        );
      })

      .addCase(toggleCustomerStatus.fulfilled, (state, action) => {
        const { id, isActive } = action.payload;

        const customer = state.customers.find((c) => c.id === id);
        if (customer) customer.isActive = isActive;
      })

      .addCase(fetchCustomerById.fulfilled, (state, action) => {
  state.selectedCustomer = action.payload;
})

.addCase(updateCustomer.fulfilled, (state, action) => {
  state.selectedCustomer = action.payload;
})
.addCase(assignTrainer.fulfilled, (state, action) => {
  const { customerId, trainerId } = action.payload;

  const customer = state.customers.find(
    (c) => c.id === customerId
  );

  if (customer) {
    customer.assignedTrainers = [
      { trainerId }
    ];
  }

  if (state.selectedCustomer?.id === customerId) {
    state.selectedCustomer.assignedTrainers = [
      { trainerId }
    ];
  }
})
  },
});

export default customerSlice.reducer;