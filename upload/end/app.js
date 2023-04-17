const express = require("express");
const multer = require("multer");
const app = express();

const storage = multer.diskStorage({
    destination: __dirname+"/upload",
    filename:function(_,file,cb){
        const filename = Date.now()+"."+file.mimetype.split("/")[1];
        cb(null,filename);
    }
});
const upload = multer({storage});


app.use((req,res,next) => {
    res.set("Access-Control-Allow-Origin","*");
    req.method === "OPTIONS" ? res.send("支持跨域请求"): next();
})

app.post("/uploadFm",upload.single("file"),(req,res) => {
    res.send({
        code: 0,
        mesage: 'upload success'
    })
})

app.listen(80,() => {
    console.log("running");
})