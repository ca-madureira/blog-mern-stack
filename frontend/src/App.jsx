import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { Routes, Route } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";
const App = () => {
  const [userAuth, setUserAuth] = useState();

  useEffect(() => {
    let userInSession = lookInSession("user");

    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });
  }, []);
  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <Routes>
        <Route path='/' element={<Navbar />}>
          <Route path='signin' element={<h1>Sign in page</h1>} />
          <Route path='signup' element={<h1>sign up</h1>} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default App;
