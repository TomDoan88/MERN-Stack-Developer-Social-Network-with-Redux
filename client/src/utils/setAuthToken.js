// PURPOSE OF THIS FILE IS JUST A FUNCTION TAKING IN A TOKEN
// IF TOKEN IS THERE ITS GONNA ADD INTO A HEADER
// IF NOT THEN DELETE FROM HEADER

// We want to do this is when we have a token -> send it to every single requests
// instead of picking and choosing which requests we are sending it with.

import axios from "axios";

const setAuthToken = token => {
  if (token) {
    axios.defaults.headers.common["x-auth-token"] = token;
  } else {
    delete axios.defaults.headers.common["x-auth-token"];
  }
};

export default setAuthToken;
