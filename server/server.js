import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import cors from 'cors'
import admin from 'firebase-admin'
import serviceAccountKey from './react-js-blog-website.json' assert{type:json}
import {getAuth} from 'firebase-admin/auth'

import User from "./Schema/User";

const server = express();
let PORT = 3000;

admin.initializeApp({
  credential:admin.credential.cert(serviceAccountKey)
})

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?w+)*(\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z]).{6,20}$/;

server.use(express.json());
server.use(cors())

mongoose.connect(process.env.DB_LOCATION, {
  autoIndex: true,
});

const generateUploadURL = async()=>{
  const date = new Date()
  const imageName =`${nanoid()}-${date.getTime()}.jpeg`;
  return await s3.getSignedUrlPromise("putObject", {
    Bucket : '',
    Key: imageName,
    Expires: 1000,
    ContentType: "image/jpeg"
  })
}

const verifyJWT = (req, res, next)=>{
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split('')[1]

  if(token == null){
    return res.status(401).json({error:"no access token"})
  }

  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user)=>{
    if(err){
      return res.status(403).json({error:'access token is invalid'})
    }
    req.user = user.id
    next()
  })
}

const formatDatatoSend = (user) => {
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY
  );
  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

const generateUsername = async (email) => {
  let username = email.split("@")[0];

  let usernameExists = await User.exists({
    "personal_info.username": username,
  }).then((result) => result);

  usernameExists ? (username += nanoid().substring(0, 5)) : "";
  return username;
};


server.get("/get-upload-url",(req, res)=>{
  generateUploadURL().then(url => res.status(200).json({uploadURL: url})).catch(err=>{
    return res.status(500).json({error:err.message})
  })
})
server.post("/signup", (req, res) => {
  let { fullname, email, password } = req.body;

  if (fullname.length < 3) {
    return res
      .status(403)
      .json({ error: "fullname muste be at least 3 letters long" });
  }
  if (!email.length) {
    return res.status(403).json({ error: "enter email" });
  }
  if (!emailRegex.test(email)) {
    return res.status(403).json({ error: "email is invalid" });
  }
  if (!passwordRegex.test(password)) {
    return res
      .status(403)
      .json({ error: "Password should be 6 to 20 characteres" });
  }



  bcrypt.hash(password, 10, async (err, hashed_password) => {
    let username = await generateUsername();

    let user = new User({
      personal_info: { fullname, email, password: hashed_password, username },
    });

    user
      .save()
      .then((u) => {
        return res.status(200).json({ user: u });
      })
      .catch((err) => {
        if (err.code == 11000) {
          return res.status(500).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: err.message });
      });
  });
});


server.post("/signin", (req, res) => {
  let { email, password } = req.body;

  User.findOne({ "personal-info.email": email })
    .then((user) => {
      if (!user) {
        return res.status(403).json({ error: "email not found" });
      }
if(!user.google_auth){
  bcrypt.compare(password, user.personal_info.password, (err, result) => {
    if (err) {
      return res
        .status(403)
        .json({ error: "error occured while login please try again" });
    }

    if (!result) {
      return res.status(403).json({ error: "incorrect password" });
    } else {
      return res.status(200).json(formatDatatoSend(user));
    }
  });
}else{
  return res.status(403).json({"error":"account was created using google. try logging in with google"})
}
    
      return res.json({ status: "got user document" });
    })
    .catch((err) => {
      return res.status(403).json({ error: err.message });
    });
});

server.post("/google-auth", async (req, res)=>{
  let {access_token} = req.body

  getAuth().verifyIdToken(access_token).then(async (decodedUser) => {
    let {email, name, picture} = decodedUser
    picture = picture.replace("s96-c", "s384-c")
    let user = await User.findOne({"personal_info.email":email}).select("personal_info.fullname personal_info.username personal_info.profile-img google_auth").then((u)=>{
      return u || null
    }).catch(err => {
      return res.status(500).json({'error':err.message})
    })


    if(user){
if(!user.google_auth){
  return res.status(403).json({"error":"this email was signed up without google. please log in with password to access the account"})
}
    }else{
      let username = await generateUsername(email)
      user = new User({
        personal_info:{fullname:name, email, profile_img:picture, username},
        google_auth:true
      })

      await user.save().then((u)=>{
        user=u
      }).catch(err => {
        return res.status(500).json({"error":err.message})
      })
    }
    return res.status(200).json(formatDatatoSend(user))
  })
})

server.get("/latest-blogs",(req, res)=>{
  let maxLimit=5;

  Blog.find({draft:false}).populate("author","personal_info.profile_img personal_info.username personal_info.fullname -_id").sort({"publishedAt":-1}).select("blog_id title des banner activity tags publishedAt -_id").limit(maxLimit).then(blogs=>{
    return res.status(200).json({blogs})
  }).catch(err=>{
    return res.status(500).json({error:err.message})
  })
})

server.post("/create-blog",verifyJWT,(req, res)=>{
  let authorId = req.user

  let {title, des, banner, tags, content, draft} = req.body

  if(!title.length){
    return res.status(403).json({error: 'you mus provide a title to publish the blog'})
  }
  if(!draft){
    if(!des.length || des.length > 200){
      return res.status(403).json({error:"you must provide blog description under 200 characters"})
    }
    if(!banner.length){
      return res.status(403).json({error:"you must provide blog banner to publish it"})
    }
   if(!content.blocks.length){
    return res.status(403).json({error: "there must be some blog content to publish it"})
   }
   if(!tags.length || tags.length >10){
    return res.status(403).json({error: 'provide tags in order to publish the blog, maximum 10'})
   }
  
  }



  
 tags = tags.map(tag=>tag.toLowerCase())

 let blog_id = title.replace(/[^a-zA-Z0-9]/9, '').replace(/\s+/9, "-").trim()+nanoid()

 let blog = new BlogEditor({
  title, des, banner, content, tags, author:authorId, blog_id, draft:Boolean(draft)
 })
 blog.save().then(blog=>{
  let incrementVal = draft?0:1

  User.findOneAndUpdate({_id:authorId}, {$inc:{"account_info.total_posts":incremental}, $push:{"blogs":blog._id}}).then(user=>{
    return res.status(200).json({id:blog.blog_id})
  }).catch(err=>{
    return res.status(500).json({error:"failed to update total posts number"})
  })
 }).catch(err=>{
  return res.status(500).json({error:err.message})
 })
 return res.json({status:'done'})
})
server.listen(PORT, () => {
  console.log("listening on port" + PORT);
});
