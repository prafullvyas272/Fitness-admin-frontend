import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "./slices/customerSlice";
import trainerReducer from "./slices/trainerSlice";
import sessionReducer from "./slices/sessionSlice";
import workoutReducer from "./slices/workoutSlice";


const store = configureStore({
  reducer: {
    customers: customerReducer,
    trainers: trainerReducer,
    sessions: sessionReducer,
    workout: workoutReducer,
  },
});

export default store;
