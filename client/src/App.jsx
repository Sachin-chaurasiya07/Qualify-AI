import React from "react"
import {Routes , Route} from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { useEffect } from "react"
import { setUserData } from "./redux/userSlice"
import { useDispatch , useSelector } from "react-redux"
import axios from "axios"
import InterviewPage from './pages/InterviewPage.jsx'
import InterviewHistory from "./pages/InterviewHistory.jsx"
import Pricing from "./pages/Pricing.jsx"
import InterviewReport from "./pages/InterviewReport.jsx"

export const ServerUrl = "https://qualify-ai.onrender.com"

function App(){
  const dispatch = useDispatch()

  useEffect(()=>{
    const getUser = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user", {withCredentials:true})
        dispatch(setUserData(result.data))
      } catch (error) {
        console.log(error)
        dispatch(setUserData(null))
      }

    }
    getUser()

  },[])

  return(
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/auth' element ={<Auth/>}/>
      <Route path="/interview" element={<InterviewPage/>}/>
      <Route path="/history" element={<InterviewHistory/>}/>
      <Route path="/pricing" element={<Pricing/>}/>
      <Route path="/report/:id" element={<InterviewReport/>}/>



    </Routes>
  )
}

export default App
