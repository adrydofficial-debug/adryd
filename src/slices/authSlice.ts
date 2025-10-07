// import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { clearAuth, getAuth, setAuth } from '../services/storage';
// import { User } from '../types/user';

// // 🧱 State
// export interface AuthState {
//   user: User | null;
//   token: string | null;
//   isAuthenticated: boolean;
//   error: string | null;
//   loginSuccess: boolean;
//   registrationSuccess: boolean;
//   currentLoginError: string | null;
//   loading: boolean;
// }

// const initialState: AuthState = {
//   user: null,
//   token: null,
//   isAuthenticated: false,
//   error: null,
//   loginSuccess: false,
//   registrationSuccess: false,
//   currentLoginError: null,
//   loading: false,
// };

// // 🧠 Thunk: Hydrate auth state on app startup
// export const hydrateAuth = createAsyncThunk(
//   'auth/hydrateAuth',
//   async (_, { rejectWithValue }) => {
//     try {
//       console.log('[hydrateAuth] Starting hydration...');
//       const auth = await getAuth();

//       if (!auth?.accessToken || !auth.user) {
//         console.warn('[hydrateAuth] No valid auth found in storage');
//         return rejectWithValue('No stored auth');
//       }

//       console.log('[hydrateAuth] Auth retrieved successfully');
//       return {
//         user: auth.user,
//         accessToken: auth.accessToken,
//         refreshToken: auth.refreshToken,
//       };
//     } catch (err: any) {
//       console.error('[hydrateAuth] Error:', err?.message || err);
//       return rejectWithValue(err.message || 'Hydration failed');
//     }
//   },
// );

// // 🧩 Slice
// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     clearError: state => {
//       state.error = null;
//     },
//     clearLoginSuccess: state => {
//       state.loginSuccess = false;
//     },
//     clearRegistrationSuccess: state => {
//       state.registrationSuccess = false;
//     },
//     clearCurrentLoginError: state => {
//       state.currentLoginError = null;
//     },

//     // ✅ Called when user logs in successfully
//     setUser: (
//       state,
//       action: PayloadAction<{
//         user: User;
//         accessToken: string;
//         refreshToken: string;
//       }>,
//     ) => {
//       const { user, accessToken, refreshToken } = action.payload;

//       console.log('[authSlice:setUser] Fired with:', {
//         user,
//         accessToken: accessToken ? '[REDACTED]' : null,
//         refreshToken: refreshToken ? '[REDACTED]' : null,
//       });

//       state.user = user;
//       state.token = accessToken;
//       state.isAuthenticated = true;
//       state.error = null;
//       state.loginSuccess = true;

//       console.log('[authSlice:setUser] Updated state:', {
//         isAuthenticated: state.isAuthenticated,
//         user: state.user,
//         tokenSet: !!state.token,
//       });

//       // persist to storage
//       setAuth(accessToken, refreshToken, user);

//       console.log('[authSlice:setUser] Saved tokens to storage ✅');
//     },

//     setLoginError: (
//       state,
//       action: PayloadAction<string | { message?: string }>,
//     ) => {
//       state.error =
//         typeof action.payload === 'string'
//           ? action.payload
//           : action.payload?.message || 'An error occurred. Please try again.';
//       state.isAuthenticated = false;
//       state.user = null;
//       state.token = null;
//       state.loginSuccess = false;
//     },

//     // ✅ Log out
//     logout: state => {
//       state.isAuthenticated = false;
//       state.user = null;
//       state.token = null;
//       state.error = null;
//       state.loginSuccess = false;
//       clearAuth();
//     },

//     // ✅ Restore auth from storage
//     setAuthFromStorage: (
//       state,
//       action: PayloadAction<{ user: User | null; accessToken: string }>,
//     ) => {
//       const { user, accessToken } = action.payload;
//       state.user = user;
//       state.token = accessToken;
//       state.isAuthenticated = true;
//       state.error = null;
//       state.currentLoginError = null;
//     },
//   },

//   extraReducers: builder => {
//     builder
//       .addCase(hydrateAuth.pending, state => {
//         state.loading = true;
//       })
//       .addCase(hydrateAuth.fulfilled, (state, action) => {
//         const { user, accessToken } = action.payload;
//         state.loading = false;
//         state.user = user;
//         state.token = accessToken;
//         state.isAuthenticated = true;
//         state.error = null;
//       })
//       .addCase(hydrateAuth.rejected, state => {
//         state.loading = false;
//         state.isAuthenticated = false;
//         state.user = null;
//         state.token = null;
//       });
//   },
// });

// export const {
//   clearError,
//   clearLoginSuccess,
//   clearRegistrationSuccess,
//   clearCurrentLoginError,
//   setUser,
//   setLoginError,
//   logout,
//   setAuthFromStorage,
// } = authSlice.actions;

// export default authSlice.reducer;
