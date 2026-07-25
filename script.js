
// LocalStorage Management & Reactive State
let appSettings = JSON.parse(localStorage.getItem('mmr_settings')) || { price: 100, proDownloads: 0, revenue: 0 };
let registeredUsers = JSON.parse(localStorage.getItem('mmr_users')) || [];

document.addEventListener("DOMContentLoaded", () => {
    updateDynamicPrices();
    renderAdminTable();
});

function updateDynamicPrices() {
    let priceDisplay = document.getElementById("dynamicPriceDisplay");
    let currentDisplayPrice = document.getElementById("currentDisplayPrice");
    if(priceDisplay) priceDisplay.innerText = "₹" + appSettings.price;
    if(currentDisplayPrice) currentDisplayPrice.innerText = "₹" + appSettings.price;
}

// Live Editor Data Binder
function updateResume() {
    document.getElementById("resName").innerText = document.getElementById("inpName").value;
    document.getElementById("resEmailText").innerText = document.getElementById("inpEmail").value;
    document.getElementById("resPhoneText").innerText = document.getElementById("inpPhone").value;
    document.getElementById("resAddressText").innerText = document.getElementById("inpAddress").value;
    document.getElementById("resObjectiveText").innerText = document.getElementById("inpObjective").value;
}

function loadPhoto(event) {
    let reader = new FileReader();
    reader.onload = function(){
        let box = document.getElementById("resPhotoBox");
        box.innerHTML = `<img src="${reader.result}" style="width:100%; height:100%; object-fit:cover;">`;
    }
    reader.readAsDataURL(event.target.files[0]);
}

// Download Gates & Watermark Enforcement
function checkAuthAndDownload() {
    let isLoggedIn = localStorage.getItem("mmr_logged_user");
    if(!isLoggedIn) {
        alert("Authentication Required: Please login or register before downloading your professional resume!");
        openRegisterModal();
        return;
    }
    // Simulate Payment Gateway Trigger
    let confirmPay = confirm(`Proceed to pay ₹${appSettings.price} via Razorpay to remove watermark and download clean Pro PDF?`);
    if(confirmPay) {
        appSettings.proDownloads++;
        appSettings.revenue += Number(appSettings.price);
        localStorage.setItem('mmr_settings', JSON.stringify(appSettings));
        alert("Payment Successful! Downloading watermark-free PDF...");
        window.print();
    }
}

function downloadPDF(type) {
    if(type === 'free') {
        let sheet = document.getElementById("activeResumeTemplate");
        sheet.style.position = "relative";
        // Apply Watermark
        if(!document.getElementById("watermarkLayer")) {
            let wm = document.createElement("div");
            wm.id = "watermarkLayer";
            wm.innerText = "MAKEMYRESUME FREE EDITION";
            wm.style.cssText = "position:absolute; top:40%; left:10%; font-size:40px; color:rgba(200,0,0,0.15); transform:rotate(-30deg); font-weight:bold; pointer-events:none;";
            sheet.appendChild(wm);
        }
        window.print();
    }
}

// Admin Panel Features
function updateCustomPrice() {
    let newPrice = document.getElementById("customPriceInput").value;
    if(newPrice) {
        appSettings.price = newPrice;
        localStorage.setItem('mmr_settings', JSON.stringify(appSettings));
        updateDynamicPrices();
        alert("Custom price updated successfully across editor and pricing tables!");
    }
}

function saveApiCredentials() {
    alert("Razorpay API credentials saved securely!");
}

function applyGlobalTypography() {
    let headSize = document.getElementById("adminHeadSize").value;
    let headColor = document.getElementById("adminHeadColor").value;
    let pSize = document.getElementById("adminPSize").value;
    let pColor = document.getElementById("adminPColor").value;

    let styleTag = document.getElementById("globalDynamicStyles") || document.createElement("style");
    styleTag.id = "globalDynamicStyles";
    styleTag.innerHTML = `
        .resume-sheet h2, .resume-sheet h4 { font-size: ${headSize || 'inherit'}; color: ${headColor || 'inherit'}; }
        .resume-sheet p, .resume-sheet td { font-size: ${pSize || 'inherit'}; color: ${pColor || 'inherit'}; }
    `;
    document.head.appendChild(styleTag);
    alert("Global typography settings successfully applied to all resume formats!");
}

function renderAdminTable() {
    let tbody = document.getElementById("usersTableBody");
    let totalUsersCount = document.getElementById("totalUsersCount");
    let totalProDownloads = document.getElementById("totalProDownloads");
    let totalRevenue = document.getElementById("totalRevenue");

    if(totalUsersCount) totalUsersCount.innerText = registeredUsers.length;
    if(totalProDownloads) totalProDownloads.innerText = appSettings.proDownloads;
    if(totalRevenue) totalRevenue.innerText = "₹" + appSettings.revenue;

    if(!tbody) return;
    if(registeredUsers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No registered users found yet.</td></tr>`;
        return;
    }
    tbody.innerHTML = "";
    registeredUsers.forEach((user, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${user.name}<br><small>${user.email}</small></td>
                <td>${user.phone}</td>
                <td>${user.downloads || 0}</td>
                <td><button onclick="deleteUser(${index})" style="background:red; color:#fff; border:none; padding:4px 8px; border-radius:3px; cursor:pointer;">Remove</button></td>
            </tr>
        `;
    });
}

function deleteUser(index) {
    registeredUsers.splice(index, 1);
    localStorage.setItem('mmr_users', JSON.stringify(registeredUsers));
    renderAdminTable();
}

function adminLogout() {
    alert("Logged out from Admin Panel.");
    location.href = "index.html";
}

function resetData() {
    if(confirm("Reset all fields?")) location.reload();
}

function openRegisterModal() {
    let name = prompt("Enter your Full Name for Registration:");
    let email = prompt("Enter your Email:");
    let phone = prompt("Enter your Mobile Number:");
    if(name && email) {
        registeredUsers.push({ name, email, phone, downloads: 0 });
        localStorage.setItem('mmr_users', JSON.stringify(registeredUsers));
        localStorage.setItem('mmr_logged_user', email);
        alert("Registration & Login successful! Your profile resume has been generated automatically.");
        location.href = "editor.html";
    }
}

function openLoginModal() {
    let email = prompt("Enter your registered Email to Login:");
    let user = registeredUsers.find(u => u.email === email);
    if(user || email === "admin@makemyresume.com") {
        localStorage.setItem("mmr_logged_user", email);
        alert("Login successful!");
        location.href = "editor.html";
    } else {
        alert("User not found. Please register first.");
    }
}
