import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE = "https://fitness-app-seven-beryl.vercel.app/api";
const tok = () => localStorage.getItem("adminToken");

/* ── GET all (paginated, filterable by status) ── */
export const fetchMentors = createAsyncThunk(
  "mentors/fetchAll",
  async ({ page = 1, pageSize = 10, status = "" } = {}, { rejectWithValue }) => {
    try {
      let url = `${BASE}/mentors?page=${page}&pageSize=${pageSize}`;
      if (status) url += `&status=${status}`;
      const res  = await fetch(url, { headers: { Authorization: `Bearer ${tok()}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch mentors");
      const list       = data.data?.mentors                  ?? [];
      const pagination = data.data?.pagination               ?? {};
      const total      = pagination.total                    ?? list.length;
      const totalPages = pagination.totalPages               ?? Math.ceil(total / pageSize);
      return { list, total, totalPages, page: pagination.page ?? page, pageSize: pagination.pageSize ?? pageSize };
    } catch (e) { return rejectWithValue(e.message); }
  }
);

/* ── GET single ── */
export const fetchMentorById = createAsyncThunk(
  "mentors/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res  = await fetch(`${BASE}/mentors/${id}`, { headers: { Authorization: `Bearer ${tok()}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      return data.data;
    } catch (e) { return rejectWithValue(e.message); }
  }
);

/* ── POST create ── */
export const createMentor = createAsyncThunk(
  "mentors/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res  = await fetch(`${BASE}/mentors`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tok()}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create mentor");
      return data.data;
    } catch (e) { return rejectWithValue(e.message); }
  }
);

/* ── PUT update (multipart/form-data) ── */
export const updateMentor = createAsyncThunk(
  "mentors/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res  = await fetch(`${BASE}/mentors/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${tok()}` },
        body: formData,          // fields: firstName, lastName, phone, title, experience,
                                 //         region, maxPTs, status, specialityIds, profilePhoto
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update mentor");
      return data.data;
    } catch (e) { return rejectWithValue(e.message); }
  }
);

/* ── GET unassigned trainers ── */
export const fetchUnassignedTrainers = createAsyncThunk(
  "mentors/fetchUnassigned",
  async (_, { rejectWithValue }) => {
    try {
      const res  = await fetch(`${BASE}/mentors/trainers/unassigned`, {
        headers: { Authorization: `Bearer ${tok()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      return data.data || [];
    } catch (e) { return rejectWithValue(e.message); }
  }
);

/* ── POST assign trainers ── */
export const assignTrainers = createAsyncThunk(
  "mentors/assignTrainers",
  async ({ mentorId, trainerIds }, { rejectWithValue }) => {
    try {
      const res  = await fetch(`${BASE}/mentors/${mentorId}/assign-trainers`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tok()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ trainerIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to assign");
      return data.data;
    } catch (e) { return rejectWithValue(e.message); }
  }
);

/* ── DELETE unassign trainer ── */
export const unassignTrainer = createAsyncThunk(
  "mentors/unassignTrainer",
  async ({ mentorId, trainerId }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/mentors/${mentorId}/unassign-trainer/${trainerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tok()}` },
      });
      if (!res.ok) throw new Error("Failed to unassign");
      return trainerId;
    } catch (e) { return rejectWithValue(e.message); }
  }
);

/* ── DELETE mentor ── */
export const deleteMentor = createAsyncThunk(
  "mentors/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/mentors/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tok()}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      return id;
    } catch (e) { return rejectWithValue(e.message); }
  }
);

/* ── Slice ── */
const mentorSlice = createSlice({
  name: "mentors",
  initialState: {
    list:               [],
    selected:           null,
    unassignedTrainers: [],
    loading:            false,
    saving:             false,
    assigning:          false,
    error:              null,
    total:              0,
    totalPages:         1,
    page:               1,
    pageSize:           10,
  },
  reducers: {
    clearSelected: (state) => { state.selected = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMentors.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchMentors.fulfilled, (s, a) => {
        s.loading     = false;
        s.list        = a.payload.list;
        s.total       = a.payload.total;
        s.totalPages  = a.payload.totalPages;
        s.page        = a.payload.page;
        s.pageSize    = a.payload.pageSize;
      })
      .addCase(fetchMentors.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchMentorById.pending,   (s) => { s.loading = true;  s.selected = null; })
      .addCase(fetchMentorById.fulfilled, (s, a) => { s.loading = false; s.selected = a.payload; })
      .addCase(fetchMentorById.rejected,  (s) => { s.loading = false; })

      .addCase(createMentor.pending,   (s) => { s.saving = true; })
      .addCase(createMentor.fulfilled, (s, a) => { s.saving = false; if (a.payload) s.list.unshift(a.payload); })
      .addCase(createMentor.rejected,  (s) => { s.saving = false; })

      .addCase(updateMentor.pending,   (s) => { s.saving = true; })
      .addCase(updateMentor.fulfilled, (s) => { s.saving = false; })
      .addCase(updateMentor.rejected,  (s) => { s.saving = false; })

      .addCase(fetchUnassignedTrainers.fulfilled, (s, a) => { s.unassignedTrainers = a.payload; })

      .addCase(assignTrainers.pending,   (s) => { s.assigning = true; })
      .addCase(assignTrainers.fulfilled, (s) => { s.assigning = false; })
      .addCase(assignTrainers.rejected,  (s) => { s.assigning = false; })

      .addCase(unassignTrainer.pending,   (s) => { s.assigning = true; })
      .addCase(unassignTrainer.fulfilled, (s) => { s.assigning = false; })
      .addCase(unassignTrainer.rejected,  (s) => { s.assigning = false; })

      .addCase(deleteMentor.fulfilled, (s, a) => {
        s.list  = s.list.filter((m) => (m._id || m.id) !== a.payload);
        s.total = Math.max(0, s.total - 1);
      });
  },
});

export const { clearSelected } = mentorSlice.actions;
export default mentorSlice.reducer;
