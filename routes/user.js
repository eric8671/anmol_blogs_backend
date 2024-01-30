import express from "express"
import User from "../models/UserSchema.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import getAuth from "../middleware/auth.js"
import dotenv from "dotenv"

dotenv.config()

const UserRouter = express.Router()

UserRouter.use(express.json())

UserRouter.get("/",async(req,res)=>{
    await User.find()
    .then((result)=>{
        res.status(200).json(result)
    })
    .catch(err=>{
        res.status(400).json({error:err})
    })
})


UserRouter.post("/register",async(req,res)=>{
    try {
        const{name,email,password} = req.body;
        console.log(req.body);
        if(name&&email&&password){
        const hashPassword = await bcrypt.hash(password, 10);
        const user = await User.create({name,email,password:hashPassword});
        res.status(200).json({msg:"user registered successfully",user:user});
        }
        else{
            res.status(400).json({msg:"please fill the required fields"})
        }
        
    } catch (error) {
        // Handle errors (e.g., duplicate email, database error)
        console.log('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    
})


UserRouter.post("/login",async(req,res)=>{
    try{
        const{email, password}=req.body;
        const existUser = await User.findOne({email})
        if(!existUser){
            res.status(404).json({error:"user not found"})
        }
        const comparePassword= await bcrypt.compare(password,existUser.password)
        if(!comparePassword){
            res.status(404).json({msg:"Wrong Password"})
        }
        const token=jwt.sign({id:existUser._id},process.env.SECRET)
        res.status(201).json({msg:"User logged in", token:token})
    }
    catch(error){
        res.status(400).json({error: error})
    }
})
UserRouter.get("/auth",getAuth,(req,res)=>{
    res.status(200).json(req.auth)
})

export default UserRouter;