// ======= 로그인 요청 =======
const res = await fetch("/.netlify/functions/get-upload-url?name="+encodeURIComponent(file.name), {
headers:{ "Authorization":"Bearer "+token }
});
if(!res.ok){ document.getElementById("uploadMsg").textContent = "업로드 URL 발급 실패"; return; }
const { url, path } = await res.json();


// 서명 URL에 직접 PUT 업로드
const put = await fetch(url, { method:"PUT", body:file, headers:{"content-type":"application/vnd.openxmlformats-officedocument.presentationml.presentation"} });
if(put.ok){
document.getElementById("uploadMsg").textContent = `업로드 성공: ${path}`;
refreshList();
} else {
document.getElementById("uploadMsg").textContent = "업로드 실패";
}
});
}


// ======= 파일 목록/다운로드 =======
const fileList = document.getElementById("fileList");
async function refreshList(){
const token = localStorage.getItem("auth_token");
const res = await fetch("/.netlify/functions/list-files",{ headers:{ "Authorization":"Bearer "+token }});
const { files } = await res.json();
fileList.innerHTML = "";
files.forEach(file=>{
const li = document.createElement("li");


// 파일명 + 업로드 날짜
const uploaded = new Date(file.created_at).toLocaleString("ko-KR", {
year:"numeric", month:"2-digit", day:"2-digit",
hour:"2-digit", minute:"2-digit"
});


const a = document.createElement("a");
a.textContent = `${file.name} (업로드: ${uploaded})`;
a.href = "#";
a.addEventListener("click", async (e)=>{
e.preventDefault();
const r = await fetch("/.netlify/functions/get-download-url?name="+encodeURIComponent(file.name), {
headers:{ "Authorization":"Bearer "+token }
});
const { url } = await r.json();
location.href = url; // 다운로드
});
li.appendChild(a);
fileList.appendChild(li);
});
}