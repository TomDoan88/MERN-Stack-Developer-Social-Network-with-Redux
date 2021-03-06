import { REGISTER_SUCCESS, REGISTER_FAIL, USER_LOADED, AUTH_ERROR } from "../actions/types";

const intialState = {
  token: localStorage.getItem("token"),
  isAuthenticated: null,
  loading: true,
  user: null
};

// Reducers ALWAYS take in type and payload
export default function(state = intialState, action) {
  const { type, payload } = action;

  // REGISTER SUCCES = we get a token back -> User logged in right away
  // payload comes from ???? ACTION..point an arrow to it
  switch (type) {
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: payload
      };
    case REGISTER_SUCCESS:
      localStorage.setItem("token", payload.token);
      return {
        ...state,
        ...payload,
        isAuthenticated: true,
        loading: false
      };
    case REGISTER_FAIL:
    case AUTH_ERROR:
      // clears all the AUTH state, clear all tokens from localStorage
      // reason = we don't want a token that is not valid in localStorage
      localStorage.removeItem("token");
      return {
        ...state,
        token: null,
        isAuthenticated: true,
        loading: false
      };
    default:
      return state;
  }
}
