import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "./slices/customerSlice";
import trainerReducer from "./slices/trainerSlice";
import sessionReducer from "./slices/sessionSlice";
import workoutReducer from "./slices/workoutSlice";
import billingReducer from "./slices/billingSlice";
import specialityReducer from "./slices/specialitySlice";
import mentorReducer from "./slices/mentorSlice";



const store = configureStore({
  reducer: {
    customers: customerReducer,
    trainers: trainerReducer,
    sessions: sessionReducer,
    workout: workoutReducer,
    billing: billingReducer,
    speciality: specialityReducer,
    mentors: mentorReducer,
  },
});

export default store;
