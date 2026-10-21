require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// POST/users
app.post("/users",async(req,res)=>{
  try{
    const{ username,email,fullname,bio}=req.body

    if(!username || !email || !fullname){
      return res.status(400).json({error:"username, email and fullname are required"})
    }

    const data={
      username,
      email,
      fullname,
    }

    if(bio!==undefined){
      data.bio=bio
    }

    const user=await prisma.user.create({
      data
    })
    res.status(201).json(user)

  }catch(error){
    if(error.code==="P2002"){
      return res.status(409).json({error:"username or email already taken"})
    }
    res.status(500).json({error:"Internal server error"})
  }
});

// GET/users
app.get("/users",async(req,res)=>{
  try{
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  }catch(error){
    res.status(500).json({error:"Internal server error"})
  }
});

// GET/users/:id
app.get("/users/:id",async(req,res)=>{
  try{
    const id=parseInt(req.params.id);

    const user=await prisma.user.findUnique({
      where:{id},
    })

    if(!user){
      return res.status(404).json({error:"User not found"})
    }

    res.status(200).json(user);
  }catch(error){
    res.status(500).json({error:"Internal server error"})
  }
});

// PATCH/users/:id
app.patch("/users/:id",async(req,res)=>{
  try{
    const id=parseInt(req.params.id)

    const {fullname,bio,isPrivate}=req.body
    const data={}

    if(fullname !== undefined){
      data.fullname=fullname

    }
    if(bio !== undefined){
      data.bio=bio
    }
    if(isPrivate !== undefined){
      data.isPrivate=isPrivate
    }

    const user=await prisma.user.update({
      where:{id},
      data,
    })
    res.status(200).json(user)
  }catch(error){
    if(error.code==="P2025") {
      return res.status(404).json({error:"User not found"});
    }
    res.status(500).json({error:"Internal server error"})
  }
});

// DELETE/users/:id
app.delete("/users/:id",async(req,res)=>{
  try{
    const id=parseInt(req.params.id)

    await prisma.user.delete({
      where:{id}
    })
    res.status(204).send()
  }catch(error){
    if(error.code==="P2025"){
      return res.status(404).json({error:"User not found"})
    }
    res.status(500).json({error:"Internal server error"})
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
