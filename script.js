document.addEventListener("DOMContentLoaded", loadAppointments);

function formatDate(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}

function isOverlapping(newStart, newEnd, existingStart, existingEnd) {
    return newStart < existingEnd && newEnd > existingStart;
}

function createAppointment() {
    const title = document.getElementById("title").value;
    const date = document.getElementById("date").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;

    if (!title || !date || !startTime || !endTime) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
    }

    const formattedDate = formatDate(date);
    const now = new Date();
    const appointmentDate = new Date(date + "T" + startTime);
    const status = appointmentDate < now ? "❌ ผ่านไปแล้ว" : "✅ ยืนยันแล้ว";

    let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
    let isConflict = false;

    const newStartTime = new Date(`${date}T${startTime}`);
    const newEndTime = new Date(`${date}T${endTime}`);

    appointments.forEach(app => {
        const existingStart = new Date(`${date}T${app.startTime}`);
        const existingEnd = new Date(`${date}T${app.endTime}`);

        if (app.date === formattedDate && isOverlapping(newStartTime, newEndTime, existingStart, existingEnd)) {
            isConflict = true;
        }
    });

    const finalStatus = isConflict ? `⚠️ ซ้ำซ้อน - ${status}` : status;

    const appointment = {
        id: Date.now().toString(),
        title,
        date: formattedDate,
        startTime,
        endTime,
        status: finalStatus,
        cancelled: false,
        isConflict
    };

    appointments.push(appointment);
    localStorage.setItem("appointments", JSON.stringify(appointments));

    loadAppointments();
}

function loadAppointments() {
    const tableBody = document.querySelector("#appointmentTable tbody");
    tableBody.innerHTML = "";

    let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
    appointments.forEach((appointment) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${appointment.date}</td>
            <td>${appointment.startTime}</td>
            <td>${appointment.endTime}</td>
            <td>${appointment.title}</td>
            <td>${appointment.cancelled ? "🚫 ถูกยกเลิก" : appointment.status}</td>
            <td>
                <button class="cancel-btn" onclick="cancelAppointment('${appointment.id}')">🚫 ยกเลิก</button>
            </td>
            <td>
                <button class="delete-btn" onclick="deleteAppointment('${appointment.id}')">🗑️ ลบทิ้ง</button>
            </td>
        `;

        if (appointment.status.includes("❌ ผ่านไปแล้ว")) {
            row.classList.add("past-appointment");
        }
        if (appointment.isConflict) {
            row.classList.add("conflict-appointment");
        }
        if (appointment.cancelled) {
            row.classList.add("cancelled-appointment");
        }

        tableBody.appendChild(row);
    });
}

function cancelAppointment(id) {
    let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
    appointments = appointments.map(app => {
        if (app.id === id) app.cancelled = true;
        return app;
    });
    localStorage.setItem("appointments", JSON.stringify(appointments));

    loadAppointments();
}

function deleteAppointment(id) {
    let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
    appointments = appointments.filter(app => app.id !== id);
    localStorage.setItem("appointments", JSON.stringify(appointments));

    loadAppointments();
}

function clearAppointments() {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลทั้งหมด?")) {
        localStorage.removeItem("appointments");
        alert("ล้างข้อมูลสำเร็จ!");
        location.reload();
    }
}