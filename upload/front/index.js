axios.defaults.baseURL = "http://localhost";
// FORMDATA
(function(){
    const select = document.querySelector(".box1 .select");
    const input = document.querySelector(".box1 input");
    const list = document.querySelector(".list");
    const descri = document.querySelector(".descri");
    const upload = document.querySelector(".box1 .upload");

    let file;
    select.addEventListener("click",() => {
        if(select.classList.contains("disable")) return;
        input.click();
    });
    input.addEventListener("change",() => {
        const _file = input.files[0];
        console.log(_file);
        if(!/png|jpg|jpeg/i.test(_file.type)){
            alert("文件只能是 PNG/JPG/JPEG 格式的");
            return;
        }
        if(_file.size > 1024*1024){
            alert("文件不能超过1MB");
            return;
        }
        file = _file;
        descri.classList.add("disable");
        list.innerHTML = `
            <span>${_file.name}</sapn><em>删除</em>
        `;    
    })
    list.addEventListener("click",(event) => {
        if(event.target.tagName === "EM"){
            list.innerHTML = ``;
            descri.classList.remove("disable");
        }
    });
    upload.addEventListener("click",() => {
        if(!file){
            alert("请先选择文件");
            return;
        }
        if(upload.classList.contains("disable")) return;
        select.classList.add("disable");
        upload.classList.add("disable");
        const fm = new FormData();
        fm.append("file",file);
        fm.append("filename",file.name);
        axios.post("/uploadFm",fm,{
            headers:{
                "Content-Type":"multipart/from-data"
            }
        }).then(
            response => {
                if(response.data.code){
                    alert("上传失败，请稍后重试");
                    return;
                }
                alert("上传成功");
            }
        ).finally(() => {
            file = null;
            select.classList.remove("disable");
            upload.classList.remove("disable");
        })
    })
})();
//base64
