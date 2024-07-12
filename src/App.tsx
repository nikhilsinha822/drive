import { Route, Routes } from "react-router-dom"
import Home from "./pages/home"
import Login from "./pages/(auth)/login"
import Register from "./pages/(auth)/register"
import Image from "./pages/viewImage"
import axios from "axios"

const App = () => {
  axios.defaults.withCredentials = true;

  return (
    <Routes>
      <Route path='/'>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/image/:imageId" element={<Image />} />
      </Route>
    </Routes>
  )
}

export default App