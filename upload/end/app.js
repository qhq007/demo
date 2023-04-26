const express = require("express");
const multer = require("multer");
const fs = require("fs");
const SparkMD5 = require("spark-md5");
const app = express();


const storage = multer.diskStorage({
    destination: __dirname + "/upload",
    //req.body中未存储任何信息、且其file参数只装载极有限的信息
    filename: function (_, file, cb) {
        const filename = Date.now() + "." + file.mimetype.split("/")[1];
        cb(null, filename);
    }
});
const upload = multer({ storage });
// 检测文件是否存在
const exist = (path) => {
    return new Promise(resolve => {
        fs.access(path, err => {
            if (err) {
                resolve(false);
                return;
            }
            resolve(true);
        })
    })
}

//request.body默认最大值为100kb，大于就会报错
app.use(express.urlencoded({ extended: true, limit: "4mb" }));
app.use((req, res, next) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "*");
    req.method === 'OPTIONS' ? res.send() : next();
})

//FormData
app.post("/upload_single", upload.single("file"), (req, res) => {
    if(exist(req.file.path)){
        res.send({
            code: 0,
            mesage: 'upload success'
        })
    }
})

//base64,自动生成名字
app.post("/upload_base64", (req, res) => {
    let file = decodeURIComponent(req.body.file);
    const type = /^data:image\/(\w+)/.exec(file);
    file = file.replace(/^data:image\/\w+;base64,/, "");
    file = Buffer.from(file, 'base64');
    const spark = new SparkMD5.ArrayBuffer();
    spark.append(file);
    const filename = __dirname + `/upload/${spark.end()}.${type[1]}`;

    fs.writeFile(filename, file, (err) => {
        if (err) return;
        res.send({
            code: 0,
            mesage: 'upload success'
        })
    });
})

const _storage = multer.memoryStorage();
const upload2 = multer({ _storage });

app.post("/upload_merge",async (req,res) => {
    const path = __dirname + "/upload" + `/${req.body.HASH}`;
    if(exist(path)){
        const fileList = fs.readdirSync(path);
        const suffix = /\.([0-9a-z]+)$/i.exec(fileList[0])[1];
        fileList.sort((a, b) => {
            let reg = /_(\d+)/;
            return reg.exec(a)[1] - reg.exec(b)[1];
        }).forEach(item => {
            fs.appendFileSync(__dirname+"/upload"+`/${req.body.HASH}.${suffix}`, fs.readFileSync(__dirname+"/upload"+`/${req.body.HASH}/${item}`));
            fs.rmSync(__dirname+"/upload"+`/${req.body.HASH}/${item}`);
        });
        fs.rmdirSync(__dirname+"/upload"+`/${req.body.HASH}`);
        res.send({
            code:0,
            codeText:"sucess"
        })
    }
})

app.post("/upload_chunk",upload2.single("chunk"),async (req, res) => {
    const HASH = /^([^_]+)_(\d+)/.exec(req.body.chunkname)[1];
    const path = __dirname + "/upload" + `/${HASH}`;
    const result = await exist(path);
    try {
        if(!result){
            fs.mkdirSync(path,{recursive:true})
        }
        fs.writeFileSync(path+`/${req.body.chunkname}`,req.file.buffer);
        res.send({
            code: 0,
            codeText:"sucess"
        })
    } catch (error) {
        res.send({
            code:1,
            codeText:"error"
        })
    }
})
app.get("/upload_already", async (req,res) => {
    const HASH = req.query.HASH;
    let fileList = [];
    const path = __dirname + "/upload" + `/${HASH}`;
    if(!await exist(path)){
        res.send({
            code: 0,
            fileList: [] 
        })
        return;
    } 
    fileList = fs.readdirSync(path);
    fileList = fileList.sort((a, b) => {
        const reg = /_(\d+)/;
        return reg.test(a)[1] - reg.test(b)[1];
    })
    res.send({
        code: 0,
        fileList: fileList
    })
})

app.listen(80, () => {
    console.log("running");
})