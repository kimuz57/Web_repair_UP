// require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// เชื่อมต่อ DB (ใช้ค่าจาก .env เหมือนเดิม)
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'bqsk3s5fmjuk3o7huyv3-mysql.services.clever-cloud.com',
    user: process.env.DB_USER || 'ucnvjlhzsov07dhy',
    password: process.env.DB_PASSWORD || 'Orcn29WG0MSSSoz2qqra',
    database: process.env.DB_NAME || 'bqsk3s5fmjuk3o7huyv3' //เช็คชื่อ DB ให้ถูกนะครับ
});
const saltRounds = 10;

db.query('SELECT id, password FROM users', async (err, users) => {
    if (err) throw err;

    for (let user of users) {
        // เช็คก่อนว่ารหัสนี้ถูก Hash ไปหรือยัง (bcrypt hash จะขึ้นต้นด้วย $2b$ หรือ $2a$)
        if (user.password.startsWith('$2')) {
            console.log(`ID: ${user.id} ถูก Hash อยู่แล้ว`);
            continue;
        }

        // เริ่มการ Hash
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        
        // Update กลับลงไปใน Database
        db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id], (updErr) => {
            if (updErr) console.error(`ID: ${user.id} ผิดพลาด:`, updErr);
            else console.log(`ID: ${user.id} แปลงเป็น Hash เรียบร้อย! ✅`);
        });
    }
});
