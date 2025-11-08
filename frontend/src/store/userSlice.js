import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: undefined, // undefined = abhi load ho raha hai
  loading: true,   // pehle load state true
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserDetails: (state, action) => {
      state.user = action.payload
      state.loading = false // jab data aagaya, loading false
    },
    setUserLoading: (state, action) => {
      state.loading = action.payload
    },
    logoutUser: (state) => {
      state.user = null
      state.loading = false
    }
  },
})

export const { setUserDetails, setUserLoading, logoutUser } = userSlice.actions

export default userSlice.reducer
