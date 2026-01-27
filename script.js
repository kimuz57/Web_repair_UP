//แก้ IP ตรงนี้ให้ตรงกับเครื่องคุณ (ipconfig)
const BASE_URL = 'http://192.168.1.180:3000'; 

// เช็คสถานะ Login เพื่อปรับ Navbar
function checkLoginStatus() {
    try {
        console.log("🔍 กำลังเช็คสถานะล็อกอิน...");
        const userStr = localStorage.getItem('user');
        console.log("📦 ข้อมูลในเครื่อง:", userStr);

        let user = null;
        if (userStr) {
            user = JSON.parse(userStr);
        }

        const navLogin = document.getElementById('nav-login');
        const navSignup = document.getElementById('nav-signup');
        const navLogout = document.getElementById('nav-logout');

        // ถ้าหาปุ่มไม่เจอ ให้จบการทำงาน (กัน Error)
        if (!navLogin || !navSignup || !navLogout) {
            console.warn("⚠️หาปุ่ม Navbar ไม่เจอ (อาจจะอยู่หน้านี้ไม่มี Navbar?)");
            return;
        }

        if (user) {
            console.log("✅ยืนยัน: ล็อกอินอยู่แล้ว (User ID: " + user.id + ")");
            navLogin.style.display = 'none';
            navSignup.style.display = 'none';
            navLogout.style.display = 'block';
        } else {
            console.log("⚪ ยังไม่ล็อกอิน");
            navLogin.style.display = 'block';
            navSignup.style.display = 'block';
            navLogout.style.display = 'none';
        }
    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดใน checkLoginStatus:", error);
    }
}

// ออกจากระบบ
function logout() {
    localStorage.removeItem('user');
    alert('ออกจากระบบเรียบร้อย');
    window.location.href = 'index.html'; //ย้ายกลับหน้าแรก
}
// ฟังก์ชันสำหรับปุ่มในหน้าแรก (Services)
function handleServiceClick(destination) {
    // 1. เช็คว่าล็อกอินหรือยัง?
    const user = localStorage.getItem('user');

    if (!user) {
        //ถ้ายังไม่ล็อกอิน
        alert('กรุณาเข้าสู่ระบบก่อนใช้งาน');
        window.location.href = 'login.html'; //ไปหน้า Login
    } else {
        //ถ้าล็อกอินแล้ว
        if (destination.startsWith('#')) {
            // กรณีเป็น Link ภายในหน้า เลื่อนลงไป Footer
            const element = document.querySelector(destination);
            if(element) element.scrollIntoView({ behavior: 'smooth' });
        } else {
            // กรณีเป็น Link ไปหน้าอื่น
            window.location.href = destination;
        }
    }
}

// เมนูมือถือ
function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    if(navMenu) navMenu.classList.toggle('active');
}

// ระบบสมาชิก (Authentication)
// 1. Login
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // ดึงตัวจัดการข้อความสีแดง
    const emailError = document.getElementById('email-error');
    const resendContainer = document.getElementById('resend-container');
    
    // รีเซ็ต Error เดิม
    if(emailError) { emailError.style.display = 'none'; emailError.innerText = ''; }
    if(resendContainer) resendContainer.innerHTML = ''; 

    fetch(`${BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            //ล็อกอินสำเร็จ
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // ย้ายไปหน้า Dashboard.html
            window.location.href = 'dashboard.html'; 

        } else {
            //กรณี Error
            if(emailError) {
                emailError.innerText = data.message;
                emailError.style.display = 'block';
            } else {
                alert(data.message);
            }

            // เช็คว่าต้องยืนยันตัวตนไหม
            if (data.needs_verify === true && resendContainer) {
                resendContainer.innerHTML = `
                    <a href="#" onclick="resendVerification(event)" style="color: #6a1b9a; font-size: 0.8rem; text-decoration: none; margin-top: 10px; display: inline-block;">
                        ยังไม่ได้รับอีเมล? <b>กดส่งอีกครั้ง</b>
                    </a>
                `;
            }
        }
    })
    .catch(err => {
        console.error(err);
        alert('ไม่สามารถเชื่อมต่อ Server ได้');
    });
}

// 2. Signup
function handleSignup(event) {
    event.preventDefault();

    const firstName = document.getElementById('signup-firstname').value;
    const lastName = document.getElementById('signup-lastname').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    const emailError = document.getElementById('signup-email-error');
    const confirmError = document.getElementById('signup-confirm-error');

    if(emailError) { emailError.style.display = 'none'; }
    if(confirmError) { confirmError.style.display = 'none'; }

    if (password !== confirmPassword) {
        if(confirmError) {
            confirmError.innerText = 'รหัสผ่านไม่ตรงกัน';
            confirmError.style.display = 'block';
        } else {
            alert('รหัสผ่านไม่ตรงกัน');
        }
        return;
    }

    fetch(`${BASE_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            document.getElementById('signup-success-modal').style.display = 'flex';
            // window.location.href = 'login.html';
        } else {
            if (data.target === 'email' && emailError) {
                emailError.innerText = data.message;
                emailError.style.display = 'block';
            } else {
                alert('เกิดข้อผิดพลาด: ' + data.message);
            }
        }
    })
    .catch(err => {
        console.error(err);
        alert('ไม่สามารถเชื่อมต่อ Server ได้');
    });
}

// ฟังก์ชันส่งอีเมลยืนยันซ้ำ
function resendVerification(e) {
    if(e) e.preventDefault();
    const email = document.getElementById('login-email').value;
    if (!email) {
        alert('กรุณากรอกอีเมลก่อนครับ');
        return;
    }

    const link = e.target;
    const originalText = link.innerHTML;
    link.innerHTML = '⏳ กำลังส่ง...';
    link.style.pointerEvents = 'none';

    fetch(`${BASE_URL}/api/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        link.innerHTML = originalText;
        link.style.pointerEvents = 'auto';
    })
    .catch(err => {
        alert('เชื่อมต่อ Server ไม่ได้');
        link.innerHTML = originalText;
        link.style.pointerEvents = 'auto';
    });
}

// ระบบแจ้งซ่อม (Dashboard & Requests)
// 1. ส่งเรื่องแจ้งซ่อม
function handleSubmitRequest(e) {
    e.preventDefault();

    const userStr = localStorage.getItem('user');
    if (!userStr) {
        alert("กรุณาเข้าสู่ระบบก่อนแจ้งซ่อม!");
        window.location.href = 'login.html'; //ไปหน้า Login
        return;
    }
    const user = JSON.parse(userStr);

    const problemTitle = document.getElementById('request-title').value;
    const building = document.getElementById('request-building').value;
    const detail = document.getElementById('request-detail').value;
    const fileInput = document.getElementById('request-image');

    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('problem_title', problemTitle);
    formData.append('building', building);
    formData.append('detail', detail);

    if (fileInput.files.length > 0) {
        formData.append('image', fileInput.files[0]); 
    }

    fetch(`${BASE_URL}/api/requests`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            document.getElementById('success-modal').style.display = 'flex';
            e.target.reset(); 
            resetUploadBox();
        } else {
            alert("บันทึกไม่สำเร็จ: " + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("ติดต่อ Server ไม่ได้");
    });
}

// 2. ดึงรายการมาโชว์ (Dashboard)
function renderRequests(filterStatus) {
    const listContainer = document.getElementById('requestList');
    if (!listContainer) return; // ถ้าไม่ใช่หน้า Dashboard ให้หยุดทำงาน

    listContainer.innerHTML = '<p style="text-align:center;">กำลังโหลดข้อมูล...</p>';
    
    // ดึง User ปัจจุบัน
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    fetch(`${BASE_URL}/api/requests`)
    .then(response => response.json())
    .then(data => {
        let filteredData;

        //Logic กรองข้อมูล
        if (filterStatus === 'mine') {
            if (!currentUser) {
                listContainer.innerHTML = '<p style="text-align:center;">กรุณาเข้าสู่ระบบ</p>';
                return;
            }
            filteredData = data.filter(item => item.user_id === currentUser.id);
        } else if (filterStatus === 'all') {
            filteredData = data;
        } else {
            filteredData = data.filter(item => item.status === filterStatus);
        }

        listContainer.innerHTML = '';

        if (filteredData.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align:center; padding:30px; color:#999;">
                    <i class="fas fa-folder-open" style="font-size:2rem; margin-bottom:10px;"></i>
                    <p>ไม่พบรายการแจ้งซ่อม</p>
                </div>
            `;
            return;
        }

        filteredData.forEach(item => {
            let statusObj = getStatusInfo(item.status);
            const dateStr = new Date(item.created_at).toLocaleDateString('th-TH', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            const reporterName = item.first_name ? `${item.first_name} ${item.last_name}` : 'ไม่ระบุ';

            // รูปภาพ
            const imageSrc = item.image_path 
                ? `${BASE_URL}/uploads/${item.image_path}`
                : "https://placehold.co/150x150/png?text=Repair";

            // จัดการรีวิว
            let reviewHTML = '';
            if (item.status === 'completed') {
                if (item.rating) {
                    let stars = '';
                    for(let i=1; i<=5; i++) {
                        stars += `<i class="fas fa-star" style="color: ${i <= item.rating ? '#ffca28' : '#ddd'}; font-size: 0.9rem;"></i>`;
                    }
                    reviewHTML = `<div class="review-badge"><div>${stars}</div><small style="color:#666;">"${item.review_comment || '-'}"</small></div>`;
                } else {
                    if (currentUser && currentUser.id === item.user_id) {
                        reviewHTML = `
                            <button onclick="openReviewModal(${item.id})" class="btn-outline" style="width:100%; margin-top:10px; font-size:0.9rem;">
                                <i class="far fa-star"></i> ให้คะแนนงานซ่อม
                            </button>
                        `;
                    }
                }
            }

            // Admin Controls
            let adminControls = '';
            if (currentUser && currentUser.role === 'admin') {
                adminControls = `
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #eee;">
                        <small style="color:#666;">แอดมิน: เปลี่ยนสถานะ</small>
                        <select onchange="updateStatus(${item.id}, this.value)" style="width:100%; padding: 5px; margin-top:5px; border-radius: 4px; border: 1px solid #ddd; cursor: pointer;">
                            <option value="received" ${item.status === 'received' ? 'selected' : ''}>🔴 รับเรื่องแล้ว</option>
                            <option value="progress" ${item.status === 'progress' ? 'selected' : ''}>🟡 กำลังดำเนินการ</option>
                            <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>🟢 เสร็จสิ้น</option>
                        </select>
                    </div>
                `;
            }

            const card = document.createElement('div');
            card.className = 'request-card';
            card.innerHTML = `
                <img src="${imageSrc}" class="card-img" alt="รูปประกอบ" onclick="window.open(this.src)" style="cursor: pointer;">
                <div class="card-content">
                    <div class="card-info">
                        <h4>${item.building} <small style="color:#666; font-size:0.8rem;">(${reporterName})</small></h4>
                        <div class="card-date"><i class="far fa-clock"></i> ${dateStr}</div>
                        <p style="font-weight:bold;">${item.problem_title}</p>
                        <p style="font-size:0.9rem; color:#666;">${item.detail || '-'}</p>
                    </div>
                    <div style="margin-top:10px;">
                        <span class="status-badge ${statusObj.class}">${statusObj.text}</span>
                        ${adminControls} ${reviewHTML}
                    </div>
                </div>
            `;
            listContainer.appendChild(card);
        });
    })
    .catch(error => {
        console.error(error);
        listContainer.innerHTML = '<p style="text-align:center; color:red;">โหลดข้อมูลไม่สำเร็จ</p>';
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
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if(event) event.target.classList.add('active');
    renderRequests(status);
}

//อัปเดตสถานะสำหรับ Admin
function updateStatus(requestId, newStatus) {
    let statusText = '';
    if(newStatus === 'received') statusText = 'รับเรื่องแล้ว';
    if(newStatus === 'progress') statusText = 'กำลังดำเนินการ';
    if(newStatus === 'completed') statusText = 'เสร็จสิ้น';

    if(!confirm(`ยืนยันที่จะเปลี่ยนสถานะเป็น "${statusText}" ใช่หรือไม่?`)) {
        renderRequests('all');
        return;
    }

    fetch(`${BASE_URL}/api/requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'ok') {
            renderRequests('all'); // โหลดข้อมูลใหม่
        } else {
            alert('เกิดข้อผิดพลาด: ' + data.message);
        }
    })
    .catch(err => console.error(err));
}

// ระบบรีวิว & Modal & สไลด์โชว์
let currentRating = 0;

function openReviewModal(requestId) {
    document.getElementById('review-request-id').value = requestId;
    currentRating = 0;
    document.getElementById('review-comment').value = '';
    updateStarUI(0);
    document.getElementById('review-modal').style.display = 'flex';
}

function closeReviewModal() {
    document.getElementById('review-modal').style.display = 'none';
}

function selectStar(rating) {
    currentRating = rating;
    updateStarUI(rating);
}

function updateStarUI(rating) {
    for (let i = 1; i <= 5; i++) {
        const star = document.getElementById(`star-${i}`);
        if (i <= rating) star.classList.add('active');
        else star.classList.remove('active');
    }
}

function submitReview() {
    if (currentRating === 0) {
        alert('กรุณากดเลือกดาวอย่างน้อย 1 ดวง');
        return;
    }
    const requestId = document.getElementById('review-request-id').value;
    const comment = document.getElementById('review-comment').value;

    fetch(`${BASE_URL}/api/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, rating: currentRating, review_comment: comment })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'ok') {
            alert('ขอบคุณสำหรับการรีวิว!');
            closeReviewModal();
            renderRequests('completed');
        } else {
            alert('เกิดข้อผิดพลาด');
        }
    });
}

function closeModal() {
    document.getElementById('success-modal').style.display = 'none';
    window.location.href = 'dashboard.html';
}

function closeSignupModal() {
    document.getElementById('signup-success-modal').style.display = 'none';
    window.location.href = 'login.html';
}

function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    if(navMenu) navMenu.classList.toggle('active');
}

// 🚀 เริ่มต้นทำงาน (Main Execution) - สำคัญมาก!
document.addEventListener('DOMContentLoaded', () => {
    // 1. เช็ค Login
    checkLoginStatus();

    // 2. เช็คว่าอยู่หน้าไหน แล้วรันโค้ดของหน้านั้น
    const path = window.location.pathname;

    //หน้า Dashboard
    if (path.includes('dashboard.html')) {
        // เช็คก่อนว่าล็อกอินยัง
        if(!localStorage.getItem('user')) {
            alert('กรุณาเข้าสู่ระบบ');
            window.location.href = 'login.html';
        } else {
            renderRequests('all'); // โหลดข้อมูล
        }
    }

    //หน้าแจ้งซ่อม (Add Request)
    if (path.includes('add_request.html')) {
        if(!localStorage.getItem('user')) {
            alert('กรุณาเข้าสู่ระบบ');
            window.location.href = 'login.html';
        }
    }

    // หน้าแรก (Home)
    // เช็คหลายแบบเผื่อกรณีเปิด root (/) หรือ index.html
    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        startSlideshow(); 
    }

    // ตั้งค่า Image Preview รันทุกหน้าที่มี input นี้
    setupImagePreview();
});

// สไลด์โชว์แบบ Infinite Loop พื้นหลัง home page
function startSlideshow() {
    const slidesContainer = document.querySelector(".slides");
    const dots = document.querySelectorAll(".dot");
    let originalImages = document.querySelectorAll(".slides img"); // รูปชุดเดิม

    // 1. เช็คความพร้อม
    if (!slidesContainer || originalImages.length === 0 || document.getElementById('first-clone')) return;
    // 2. สร้างร่างแยก (Clone) หัว-ท้าย
    const firstClone = originalImages[0].cloneNode(true);
    const lastClone = originalImages[originalImages.length - 1].cloneNode(true);

    firstClone.id = 'first-clone';
    lastClone.id = 'last-clone';

    slidesContainer.append(firstClone);   // เอารูปแรก(ปลอม) ไปต่อท้าย
    slidesContainer.prepend(lastClone);   // เอารูปสุดท้าย(ปลอม) มาแปะหน้า

    // ดึงรูปทั้งหมดใหม่ รวมตัว Clone ที่เพิ่งเพิ่ม
    const allSlides = document.querySelectorAll(".slides img");

    // 3. ตั้งค่าเริ่มต้น
    let counter = 1; // เริ่มที่ 1 เพราะ 0 คือรูปสุดท้ายปลอม
    const size = 100; // เลื่อนทีละ 100%
    slidesContainer.style.transform = 'translateX(' + (-size * counter) + '%)';

    let slideInterval;

    // ฟังก์ชันเลื่อนภาพ
    const nextSlide = () => {
        if (counter >= allSlides.length - 1) return;
        slidesContainer.style.transition = "transform 0.5s ease-in-out";
        counter++;
        slidesContainer.style.transform = 'translateX(' + (-size * counter) + '%)';
        updateDots();
    };

    const prevSlide = () => {
        if (counter <= 0) return;
        slidesContainer.style.transition = "transform 0.5s ease-in-out";
        counter--;
        slidesContainer.style.transform = 'translateX(' + (-size * counter) + '%)';
        updateDots();
    };

    // 4.Transition End
    slidesContainer.addEventListener('transitionend', () => {
        // ถ้าเลื่อนไปเจอ "รูปแรก(ปลอม)" -> วาร์ปกลับไป "รูปแรก(จริง)"
        if (allSlides[counter].id === 'first-clone') {
            slidesContainer.style.transition = "none"; //ปิด Animation ชั่วคราว
            counter = 1; // ย้ายตำแหน่ง
            slidesContainer.style.transform = 'translateX(' + (-size * counter) + '%)';
        }

        // ถ้าเลื่อนถอยหลังไปเจอ "รูปท้าย(ปลอม)" -> วาร์ปไป "รูปท้าย(จริง)"
        if (allSlides[counter].id === 'last-clone') {
            slidesContainer.style.transition = "none";
            counter = allSlides.length - 2; // ตำแหน่งรูปสุดท้ายจริง
            slidesContainer.style.transform = 'translateX(' + (-size * counter) + '%)';
        }
    });

    // 5.Dots
    const updateDots = () => {
        dots.forEach(dot => dot.classList.remove('active'));
        // คำนวณ Index ของจุด ต้องลบ 1 เพราะมี Clone ตัวหน้า
        let dotIndex = counter - 1;
        if (dotIndex < 0) dotIndex = originalImages.length - 1; // กรณีอยู่ที่ clone หน้า
        if (dotIndex >= originalImages.length) dotIndex = 0;    // กรณีอยู่ที่ clone ท้าย

        if (dots[dotIndex]) dots[dotIndex].classList.add('active');
    };

    // 6. กดจุดเพื่อเปลี่ยนรูป
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            clearInterval(slideInterval); // หยุด Auto แป๊บนึง
            slidesContainer.style.transition = "transform 0.5s ease-in-out";
            counter = i + 1; // +1 ชดเชย clone ตัวหน้า
            slidesContainer.style.transform = 'translateX(' + (-size * counter) + '%)';
            updateDots();
            startAutoSlide(); // เริ่ม Auto ต่อ
        });
    });

    // 7. ระบบสัมผัส Swipe
    let startX = 0;
    slidesContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        clearInterval(slideInterval);
    });

    slidesContainer.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;

        if (Math.abs(diff) > 50) { // ต้องลากเกิน 50px ถึงจะเปลี่ยน
            if (diff > 0) nextSlide(); // ปัดซ้าย
            else prevSlide(); // ปัดขวา
        }
        startAutoSlide();
    });

    // เริ่ม Auto Slide
    const startAutoSlide = () => {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 4000);
    };

    startAutoSlide();
}

function setupImagePreview() {
    const fileInput = document.getElementById('request-image');
    const uploadBox = document.querySelector('.file-upload-box');

    if (fileInput && uploadBox) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                const file = this.files[0];
                const reader = new FileReader();
                reader.onload = function(e) {
                    const icon = uploadBox.querySelector('i');
                    if(icon) icon.style.display = 'none';

                    let previewImg = document.getElementById('preview-selected-img');
                    if (!previewImg) {
                        previewImg = document.createElement('img');
                        previewImg.id = 'preview-selected-img';
                        previewImg.style.height = '120px';
                        previewImg.style.objectFit = 'contain';
                        previewImg.style.borderRadius = '8px';
                        previewImg.style.marginBottom = '10px';
                        const textP = uploadBox.querySelector('p');
                        uploadBox.insertBefore(previewImg, textP);
                    }
                    previewImg.src = e.target.result;
                    previewImg.style.display = 'block';

                    const textP = uploadBox.querySelector('p');
                    if (textP) {
                        textP.innerHTML = `<span style="color:green;font-weight:bold;">✅ ${file.name}</span>`;
                    }
                    uploadBox.style.borderColor = 'green';
                    uploadBox.style.backgroundColor = '#f1f8e9';
                }
                reader.readAsDataURL(file);
            }
        });
    }
}

function resetUploadBox() {
    const uploadBox = document.querySelector('.file-upload-box');
    const fileInput = document.getElementById('request-image');
    if(fileInput) fileInput.value = '';
    
    const previewImg = document.getElementById('preview-selected-img');
    const icon = uploadBox.querySelector('i');
    const textP = uploadBox.querySelector('p');

    if(previewImg) previewImg.remove();
    if(icon) icon.style.display = 'block';
    if(textP) textP.innerHTML = 'คลิกเพื่อเลือกไฟล์รูปภาพ';
    
    if(uploadBox) {
        uploadBox.style.borderColor = '#ddd';
        uploadBox.style.backgroundColor = 'transparent';
    }
}