axios.defaults.baseURL = "http://localhost";
//FORMDATA
(function () {
    const select = document.querySelector(".box1 .select");
    const input = document.querySelector(".box1 input");
    const list = document.querySelector(".list");
    const descri = document.querySelector(".descri");
    const upload = document.querySelector(".box1 .upload");

    let file;
    select.addEventListener("click", () => {
        if (select.classList.contains("disable")) return;
        input.click();
    });
    input.addEventListener("change", () => {
        const _file = input.files[0];
        if (!/png|jpg|jpeg/i.test(_file.type)) {
            alert("文件只能是 PNG/JPG/JPEG 格式的");
            return;
        }
        if (_file.size > 1024 * 1024) {
            alert("文件不能超过1MB");
            return;
        }
        file = _file;
        descri.classList.add("disable");
        list.innerHTML = `
            <span>${_file.name}</sapn><em>删除</em>
        `;
    })
    list.addEventListener("click", (event) => {
        if (event.target.tagName === "EM") {
            list.innerHTML = ``;
            descri.classList.remove("disable");
        }
    });
    upload.addEventListener("click", () => {
        if (!file) {
            alert("请先选择文件");
            return;
        }
        if (upload.classList.contains("disable")) return;
        select.classList.add("disable");
        upload.classList.add("disable");
        const fm = new FormData();
        fm.append("file", file);
        fm.append("filename", file.name);
        axios.post("/upload_single", fm, {
            headers: {
                "Content-Type": "multipart/from-data"
            }
        }).then(
            response => {
                if (response.data.code) {
                    alert("上传失败，请稍后重试");
                    return;
                }
                alert("上传成功");
            }
        ).finally(() => {
            file = null;
            descri.classList.remove("disable");
            list.innerHTML = "";
            select.classList.remove("disable");
            upload.classList.remove("disable");
        })
    })
})();
//base64
(function () {
    const select = document.querySelector(".box2 .select");
    const upload = document.querySelector(".box2 .upload")
    const input = document.querySelector(".box2 input");
    const img_box = document.querySelector(".box2 div");

    select.addEventListener("click", () => {
        if(select.classList.contains("disable")) return;
        input.click();
    })
    let result;
    let img;
    input.addEventListener("change", async () => {
        const file = input.files[0];
        result = await new Promise((resolve) => {
            const fr = new FileReader();
            fr.readAsDataURL(file);
            fr.onload = () => {
                result = fr.result;
                resolve(result);
            }
        })
        img = document.createElement("img");
        img.src = result;
        img_box.appendChild(img);
    })
    upload.addEventListener("click", () => {
        if(!result) {
            alert("请先选择文件");
            return;
        }
        if(upload.classList.contains("disable")) return;
        select.classList.add("disable");
        upload.classList.add("disable");
        axios.post("/upload_base64", Qs.stringify({
            file: encodeURIComponent(result)
        })).then(response => {
            if (response.data.code) {
                alert("上传失败，请重新上传");
                return;
            }
            alert("上传成功");
        }).finally(() => {
            result = "";
            select.classList.remove("disable");
            upload.classList.remove("disable");
            img_box.removeChild(img);
        })
    })
})();

//单一文件上传，进度管控
(function () {
    const button = document.querySelector(".box3 button");
    const input = document.querySelector(".box3 input");
    const value = document.querySelector(".box3 .value")

    button.addEventListener("click", () => {
        if(button.classList.contains("disable")) return;
        input.click();
    })
    input.addEventListener("change", () => {
        let file = input.files[0];
        const fm = new FormData();
        fm.append("file", file);
        axios.post("/upload_single", fm, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            onUploadProgress: (event) => {
                let { loaded, total } = event;
                value.parentElement.style.display = "block";
                value.style.width = `${loaded / total * 100}%`;
            }
        }).then(async response => {
            value.style.width = "100%";
            await new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, 3000);
            })
            if (response.data.code) {
                alert("上传失败");
                return;
            }
            alert("上传成功");
        }).finally(() => {
            file = null;
            value.parentElement.style.display = "none";
            value.style.width = `0%`;
            button.classList.remove("disable");
        })
    })
})();

//多文件上传，进度管控
(function () {
    const select = document.querySelector(".box4 .select");
    const upload = document.querySelector(".box4 .upload");
    const input = document.querySelector(".box4 input");
    const list = document.querySelector(".box4 .list");

    select.addEventListener("click", () => {
        if(select.classList.contains("disable")) return;
        input.click();
    })
    let files;
    input.addEventListener("change", () => {
        files = Array.from(input.files);
        let str = "";
        files = files.map((item) => {
            return {
                file: item,
                key: (Date.now() * Math.random()).toString(16).replace(".", "")
            }
        })
        files.forEach((item) => {
            str += `<li key=${item.key}><span>${item.file.name}</span><em>删除</em></li>`
        })
        list.innerHTML = str;
    });
    list.addEventListener("click", (event) => {
        if (event.target.tagName === "EM") {
            list.removeChild(event.target.parentElement);
            files = files.filter(item => item.key !== event.target.parentElement.getAttribute("key"));
        }
    })
    upload.addEventListener("click", () => {
        if(upload.classList.contains("disable")) return;
        if(!files) {
            alert("请先选择文件");
            return;
        }
        select.classList.add("disable");
        upload.classList.add("disable");
        const lis = Array.from(document.querySelectorAll("li"));
        let ps = [];
        ps = files.map((item) => {
            const li = lis.find((li) => li.getAttribute("key") === item.key);
            const em = li.querySelector("em");
            const fm = new FormData();
            fm.append("file", item.file);
            return axios.post("/upload_single", fm, {
                headers: {
                    "Content-Type": "multipart-form-data"
                },
                onUploadProgress(event) {
                    let { loaded, total } = event;
                    em.innerHTML = `${(loaded / total * 100).toFixed(2)}%`;
                }
            }).then(
                response => {
                    if(response.data.code){
                        return Promise.reject();
                    }
                    return;
                }
            )
        })
        Promise.all(ps).then(() => {
            alert('文件上传成功');
        }).catch(() => {
            alert("文件上传失败");
        }).finally(() => {
            files = null;
            select.classList.remove("disable");
            upload.classList.remove("disable");
            list.innerHTML = "";
        })
    })

})();

//拖拽上传
(function () {
    const a = document.querySelector(".box5 .drag a");
    const input = document.querySelector(".box5 input");
    const box = document.querySelector(".box5");

    let file;
    a.addEventListener("click", () => {
        if(file) return;
        input.click();
    })
    function upload(file) {
        const fm = new FormData();
        fm.append("file", file);
        return axios.post("/upload_single", fm, {
            headers: {
                "Content-Type": "multipart-form-data"
            }
        }).then((response) => {
            if (response.data.code) {
                alert("上传失败，请稍后重试");
                return;
            }
            alert("上传成功");
        })
    }
    input.addEventListener("change", async () => {
        file = input.files[0];
        await upload(file);
        file = null;
    })
    box.addEventListener("dragover", (event) => {
        event.preventDefault();
    })
    box.addEventListener("drop", async (event) => {
        event.preventDefault();
        file = event.dataTransfer.files[0];
        await upload(file);
        file = null;
    })

})();

// 文件切片与断点续传
(function () {
    const input = document.querySelector(".box6 input");
    const upload = document.querySelector(".box6 .upload");
    const value = document.querySelector(".box6 .value");
    const instance = axios.create({
        baseURL:"http://localhost"
    });
    instance.interceptors.response.use((response) => {
        return response.data;
    })

    upload.addEventListener("click", () => {
        if(upload.classList.contains("disable")) return;
        input.click();
    })
    let file;
    const changeBuffer = (file) => {
        return new Promise(resolve => {
            const fr = new FileReader();
            fr.readAsArrayBuffer(file);
            fr.onload = () => {
                const spark = new SparkMD5.ArrayBuffer();
                spark.append(fr.result);
                const HASH = spark.end();
                resolve(HASH);
            }
        })
    }

    input.addEventListener("change", async () => {
        file = input.files[0];
        if (!file) return;
        if(upload.classList.contains("disable")) return;
        upload.classList.add("disable");
        value.parentElement.style.display = "block";
        const HASH = await changeBuffer(file);
        // 获取已经上传的切片信息
        let data = await instance.get("/upload_already",{
            params:{
                HASH
            }
        });
        let already = [];
        if (data.code) return;
        already = data.fileList;
        //实现文件切片处理
        let max = 1024 * 100;
        let count = Math.ceil(file.size / max);
        if (count > 100) {
            count = 100;
            max = Math.ceil(file.size / count);
        }
        // 管控进度条
        let index = 0;
        const complete = async () => {
            index++;
            value.style.width = `${index / count * 100}%`;
            // 当所有切片都上传成功，我们合并切片
            if (index < count) return;
            value.style.width = "100%";
            try {
                const data = await instance.post("/upload_merge", Qs.stringify({
                    HASH
                }));
                if (data.code) throw "";
                alert("文件上传成功");
            } catch (error) {
                alert('文件上传失败');
            } finally{
                file = null;
                value.style.width = "0%";
                value.parentElement.style.display = "none";
                upload.classList.remove("disable");
            }
        }
        let chunks = [];
        let suffix = /.([a-z0-9]+)$/i.exec(file.name)[1];
        for (let i = 0; i < count; i++) {
            chunks.push({
                file: file.slice(i * max, (i + 1) * max),
                filename: `${HASH}_${i + 1}.${suffix}`
            })
        }
        // 上传
        chunks.forEach(async chunk => {
            if (already.length > 0 && already.includes(chunk.filename)) {
                complete();
                return;
            }
            const fm = new FormData();
            fm.append("chunk", chunk.file);
            fm.append("chunkname", chunk.filename);
            const data = await instance.post("/upload_chunk", fm, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })
            if (data.code) {
                alert('当前切片上传失败，请您稍后再试~~');
                return;
            }
            complete();
        })
    })
})();
