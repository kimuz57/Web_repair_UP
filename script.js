
// --- Navigation System ---
function showPage(pageId) {
    // 1. ซ่อนทุกหน้า
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 2. แสดงหน้าที่ต้องการ
    const targetPage = document.getElementById(pageId);
    if(targetPage) {
        targetPage.classList.add('active');
    }

    // 3. จัดการการโหลดข้อมูลพิเศษ
    if (pageId === 'dashboard-page') {
        renderRequests('all');
    }

    // 4. เลื่อนจอไปบนสุด
    window.scrollTo(0, 0);
}
//home page
document.addEventListener('DOMContentLoaded', () => {

    const slides = document.querySelector(".slides");
    const dots = document.querySelectorAll(".dot");
    let images = document.querySelectorAll(".slides img");

    // 🔥 clone รูปแรก
    const firstClone = images[0].cloneNode(true);
    slides.appendChild(firstClone);

    images = document.querySelectorAll(".slides img");

    let index = 0;
    const total = images.length;

    function updateDots(i){
        dots.forEach(d => d.classList.remove("active"));
        if(i < dots.length) dots[i].classList.add("active");
        else dots[0].classList.add("active");
    }

    function moveSlide(){
        index++;
        slides.style.transform = `translateX(-${index * 100}%)`;
        slides.style.transition = "transform 0.6s ease-in-out";
        updateDots(index);
    }

    slides.addEventListener("transitionend", () => {
        // ถึง clone (รูปสุดท้ายปลอม)
        if(index === total - 1){
            slides.style.transition = "none";
            index = 0;
            slides.style.transform = `translateX(0%)`;
        }
    });

    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            index = i;
            slides.style.transform = `translateX(-${index * 100}%)`;
            slides.style.transition = "transform 0.6s ease-in-out";
            updateDots(index);
        });
    });

    setInterval(moveSlide, 4000);
});


// --- Authentication Logic (Mock) ---
// ================================
// ฟังก์ชัน Register (เชื่อม Server)
// ================================
function handleSignup(e) {
    e.preventDefault();
    
    // ดึงค่า input ตามลำดับใน HTML
    const inputs = e.target.querySelectorAll('input');
    const firstName = inputs[0].value;
    const lastName = inputs[1].value;
    const email = inputs[2].value;
    const password = inputs[3].value;
    const confirmPassword = inputs[4].value;

    if(password !== confirmPassword) {
        alert("รหัสผ่านไม่ตรงกัน");
        return;
    }

    // เตรียมข้อมูลส่งไปหลังบ้าน
    const userData = { 
        first_name: firstName, 
        last_name: lastName, 
        email: email, 
        password: password 
    };

    // ยิงไปหา Server
    fetch('http://localhost:3000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
    .then(async response => {
        if (response.ok) {
            alert("✅ สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
            showPage('login-page');
        } else {
            const errorText = await response.text();
            alert("❌ ไม่สำเร็จ: " + errorText);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("ติดต่อ Server ไม่ได้ (อย่าลืมรัน node server.js)");
    });
}

// ================================
// ฟังก์ชัน Login (เชื่อม Server)
// ================================
function handleLogin(event) {
    event.preventDefault();

    // 1. ดึงค่าจาก id ที่เราเพิ่งเติมไป
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // 2. รีเซ็ต Error เก่าให้หายไปก่อน (ซ่อนตัวแดง)
    const emailError = document.getElementById('email-error');
    const passError = document.getElementById('password-error');
    
    emailError.style.display = 'none';
    passError.style.display = 'none';
    emailError.innerText = '';
    passError.innerText = '';

    // 3. ส่งข้อมูลไปเช็คที่ Server
    fetch('https://ชื่อ-app-ของคุณ.onrender.com/login', { // <-- อย่าลืมเปลี่ยนลิงก์
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            // ล็อกอินผ่าน
            alert('เข้าสู่ระบบสำเร็จ!');
            localStorage.setItem('token', data.token);
            localStorage.setItem('user_id', data.user.id);
            localStorage.setItem('role', data.user.role);
            
            showPage('dashboard-page');
            checkLoginStatus(); // อัปเดตเมนู
        } else {
            // ล็อกอินไม่ผ่าน -> เช็คว่าผิดตรงไหน
            if (data.target === 'email') {
                emailError.innerText = data.message; // ใส่ข้อความ
                emailError.style.display = 'block';  // โชว์ตัวแดง
            } else if (data.target === 'password') {
                passError.innerText = data.message;  // ใส่ข้อความ
                passError.style.display = 'block';   // โชว์ตัวแดง
            } else {
                alert(data.message); // กรณี Error อื่นๆ
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ Server');
    });
}

function logout() {
    // รีเซ็ต Navbar
    document.getElementById('nav-login').style.display = 'block';
    document.getElementById('nav-signup').style.display = 'block';
    document.getElementById('nav-logout').style.display = 'none';
    
    showPage('home-page');
}

// --- Dashboard Logic ---
// ฟังก์ชันแสดงรายการแจ้งซ่อม (ดึงจาก Server)
function renderRequests(filterStatus) {
    const listContainer = document.getElementById('requestList');
    listContainer.innerHTML = '<p style="text-align:center;">กำลังโหลดข้อมูล...</p>';

    // 1. ยิงไปขอข้อมูลจาก Server
    fetch('http://localhost:3000/api/requests')
    .then(response => response.json())
    .then(data => {
        
        // 2. กรองสถานะ (Filter)
        const filteredData = filterStatus === 'all' 
            ? data 
            : data.filter(item => item.status === filterStatus);

        listContainer.innerHTML = ''; // เคลียร์ข้อความกำลังโหลด

        if (filteredData.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align:center; padding:30px; color:#999;">
                    <i class="fas fa-folder-open" style="font-size:2rem; margin-bottom:10px;"></i>
                    <p>ไม่พบรายการแจ้งซ่อม</p>
                </div>
            `;
            return;
        }

        // 3. วนลูปสร้างการ์ด
        filteredData.forEach(item => {
            let statusObj = getStatusInfo(item.status);
            
            // แปลงวันที่จาก SQL ให้สวยงาม
            const dateObj = new Date(item.created_at);
            const dateStr = dateObj.toLocaleDateString('th-TH');

            // ใช้รูป Default ถ้าไม่มีรูป (เพราะเรายังไม่ได้ทำระบบอัปโหลดไฟล์จริง)
            const imageSrc = item.image_path || "https://placehold.co/150x150/png?text=Repair";

            const card = document.createElement('div');
            card.className = 'request-card';
            card.innerHTML = `
                <img src="${imageSrc}" alt="รูปประกอบ" class="card-img">
                <div class="card-content">
                    <div class="card-info">
                        <h4>${item.building}</h4>
                        <div class="card-date"><i class="far fa-clock"></i> ${dateStr}</div>
                        <p style="font-weight:bold;">${item.problem_title}</p>
                        <p style="font-size:0.9rem; color:#666;">${item.detail || '-'}</p>
                    </div>
                    <div style="margin-top:10px;">
                        <span class="status-badge ${statusObj.class}">
                            ${statusObj.text}
                        </span>
                    </div>
                </div>
            `;
            listContainer.appendChild(card);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        listContainer.innerHTML = '<p style="text-align:center; color:red;">โหลดข้อมูลไม่สำเร็จ (ตรวจสอบ Server)</p>';
    });
}

function getStatusInfo(status) {
    switch(status) {
        case 'received': return { text: 'รับเรื่องแล้ว', class: 'status-received' };
        case 'progress': return { text: 'กำลังดำเนินการ', class: 'status-progress' };
        case 'completed': return { text: 'เสร็จสิ้น', class: 'status-completed' };
        default: return { text: status, class: '' };
    }
}

function filterStatus(status) {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    renderRequests(status);
}

// --- Form Submission ---
function handleSubmitRequest(e) {
    e.preventDefault();

    // 1. ดึง ID ของคนที่ Login อยู่
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        alert("กรุณาเข้าสู่ระบบก่อนแจ้งซ่อม!");
        showPage('login-page');
        return;
    }

    // 2. ดึงค่าจากฟอร์ม
    // (ต้องแน่ใจว่าลำดับ input ใน HTML ตรงกัน: 0=หัวข้อ, 1=ตึก, 2=ชื่อผู้แจ้ง, 3=รายละเอียด)
    const inputs = e.target.querySelectorAll('input, select, textarea');
    
    const problemTitle = inputs[0].value; // หัวข้อ
    const building = inputs[1].value;     // ตึก
    // inputs[2] คือชื่อผู้แจ้ง (เราใช้จาก Login แทนได้ หรือจะส่งไปก็ได้)
    const detail = inputs[3].value;       // รายละเอียด

    // 3. เตรียมข้อมูลส่ง
    const requestData = {
        user_id: userId,
        problem_title: problemTitle,
        building: building,
        detail: detail
    };

    // 4. ส่งไปหา Server
    fetch('http://localhost:3000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (response.ok) {
            // แสดงหน้าสำเร็จ
            document.getElementById('success-modal').style.display = 'flex';
            // เคลียร์ฟอร์ม
            e.target.reset();
        } else {
            alert("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("ติดต่อ Server ไม่ได้");
    });
}

function closeModal() {
    document.getElementById('success-modal').style.display = 'none';
    showPage('dashboard-page');
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // เริ่มต้นที่หน้า Home
    showPage('home-page');
});