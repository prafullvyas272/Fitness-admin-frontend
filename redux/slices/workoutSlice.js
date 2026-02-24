import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  workouts: [],
  search: "",
  filterTag: "",
  currentPage: 1,
  itemsPerPage: 6,
};

const workoutSlice = createSlice({
  name: "workout",
  initialState,
  reducers: {
    addWorkout: (state, action) => {
      state.workouts.push(action.payload);
    },
    deleteWorkout: (state, action) => {
      state.workouts = state.workouts.filter(
        (item) => item.id !== action.payload
      );
    },
    updateWorkout: (state, action) => {
      const index = state.workouts.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.workouts[index] = action.payload;
      }
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setFilterTag: (state, action) => {
      state.filterTag = action.payload;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
});

export const {
  addWorkout,
  deleteWorkout,
  updateWorkout,
  setSearch,
  setFilterTag,
  setPage,
} = workoutSlice.actions;

export default workoutSlice.reducer;