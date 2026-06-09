import React from "react";
import { VscRobot } from "react-icons/vsc";
import { HiOutlineSparkles } from "react-icons/hi2";
import {motion} from "motion/react";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import{auth, provider} from '../utils/firebase';
import { ServerUrl } from "../App.jsx";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";






function Auth({isModel = false}){
    const dispatch = useDispatch()


    const handleGoogleAuth = async ()=> {
        try{
            const response = await signInWithPopup(auth ,provider)
            let User = response.user
            let name = User.displayName
            let email = User.email
            const result = await axios.post(ServerUrl + "/api/auth/google",
            {name , email} , {withCredentials:true})
            dispatch(setUserData(result.data))
        }catch(error){
            console.log(error)
            dispatch(setUserData(null))

        }

    }
    return(
        <div className={`w-full ${isModel ? "py-4" : "min-h-screen bg-[#b5cbcd] flex items-center justify-center px-6 py-20"}`}>
            <motion.div 
            initial={{opacity:0,y:-60}}
            animate={{opacity:1 , y:0}}
            transition={{duration:1.05}}
            className={`w-full ${isModel ? "max-w-md p-8 rounded-3xl" : "max-w-lg p-12 rounded-32px" } bg-white shadow-2xl border border-gray-200`}>
                <div className="flex item-center justify-center gap-3 mb-6">
                    <div className="bg-black text-white p-2 rounded-lg">
                        <VscRobot size={18}/>
                    </div>

                    <h2 className="font-semibold text-lg">Qualify-AI</h2>

                </div>
                <h1 className="text-2xl md:text-3xl font-semibold text-center leading-snug mb-4">
                    Continue with{" "}
                    
                    <span className='bg-green-100 text-green-600 font-stretch-normal px-3 py-1 rounded-full inline-flex items-center gap-2'>
                        <HiOutlineSparkles size={18}/>
                        AI Based Interview
                    </span>
                    </h1>
                <p className="text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8">
                    Sign in to begin AI powered mock interviews, monitor your progress and unlock detailed performance insights.
                    </p>
                    <motion.button
                    onClick={handleGoogleAuth}
                    whileHover={{opacity:1 , scale:1.03}}
                    whileTap={{opacity:1 , scale:0.98}}
                    className="w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md"
                    >
                        <FcGoogle size={20} />
                        Continue with Google
                    </motion.button>

            </motion.div>
        </div>
    )
}

export default Auth