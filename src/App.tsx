import { Route, Routes } from "react-router-dom"
import Home from "./pages/home"
import Login from "./pages/(auth)/login"
import Register from "./pages/(auth)/register"

const App = () => {
  return (
    <Routes>
      <Route path='/'>
        <Route index element={<Home />} />
        <Route path="/login" index element={<Login />} />
        <Route path="/register" index element={<Register />} />
      </Route>
    </Routes>
  )
}

export default App