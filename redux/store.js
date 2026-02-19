import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "./slices/customerSlice";
import trainerReducer from "./slices/trainerSlice";
import sessionReducer from "./slices/sessionSlice";


const store = configureStore({
  reducer: {
    customers: customerReducer,
    trainers: trainerReducer,
    sessions: sessionReducer,
  },
});

export default store;
