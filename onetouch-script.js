// NAVBAR
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// MOBILE NAV
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
    });
});

// FEATURE TABS
const tabs = document.querySelectorAll('.feature-tab');
const panels = document.querySelectorAll('.feature-panel, .founders-panel');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        panels.forEach(p => {
            p.classList.remove('active');
            if (p.dataset.panel === target) {
                p.classList.add('active');
            }
        });
    });
});


// COUNTER ANIMATION
function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const decimals = parseInt(el.dataset.decimal) || 0;
    const useComma = el.dataset.comma === 'true';
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        let val = eased * target;
        val = decimals > 0 ? val.toFixed(decimals) : Math.round(val);
        if (useComma) val = Number(val).toLocaleString();
        el.textContent = prefix + val + suffix;
        if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

// SCROLL REVEAL
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const siblings = entry.target.parentElement.querySelectorAll('.fade-up:not(.visible)');
                const idx = Array.from(siblings).indexOf(entry.target);
                setTimeout(() => entry.target.classList.add('visible'), Math.max(0, idx) * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number[data-target]').forEach(el => counterObserver.observe(el));
} else {
    document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
        const t = parseFloat(el.dataset.target);
        const s = el.dataset.suffix || '';
        const p = el.dataset.prefix || '';
        const d = parseInt(el.dataset.decimal) || 0;
        let v = d > 0 ? t.toFixed(d) : t;
        if (el.dataset.comma === 'true') v = Number(v).toLocaleString();
        el.textContent = p + v + s;
    });
}

// Development
// const API_URL = "https://gbb4e16f60f7d6b-atpots01.adb.ap-hyderabad-1.oraclecloudapps.com/ords/maze/public/enquiry";
// const BRANCH_CODE = "M-IND";
// const BUSINESS_UNIT_CODE = "MIND-HO";

// Production
const API_URL = "https://gbb4e16f60f7d6b-otsprod.adb.ap-hyderabad-1.oraclecloudapps.com/ords/onetouch/crm/enquiry";
const BRANCH_CODE = "OTS";
const BUSINESS_UNIT_CODE = "OTS-EKM";

async function submitEnquiry(
    apiUrl,
    branchCode,
    businessUnitCode,
    requestBody
) {
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "branch_code": branchCode,
                "business_unit_code": businessUnitCode,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status} - ${response.statusText}`
            );
        }

        const data = await response.text();

        return {
            success: true,
            status: response.status,
            data: data
        };

    } catch (error) {

        console.error("API Error:", error);

        return {
            success: false,
            error: error.message
        };
    }
}

async function handleContactFormSubmit() {

    const status = document.getElementById("contact_status");
    const button = document.querySelector(".submit-contact-form");

    const name = document.getElementById("contact_name").value.trim();
    const email = document.getElementById("contact_email").value.trim();
    const phone = document.getElementById("contact_phone").value.trim();
    const message = document.getElementById("contact_message").value.trim();


    // -----------------------------
    // Required field validation
    // -----------------------------
    if (!name || !email || !phone || !message) {

        status.textContent = "Please fill in all fields.";
        status.className = "contact-status show warning";

        return;
    }


    // -----------------------------
    // Email validation
    // -----------------------------
    const emailPattern =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(email)) {

        status.textContent =
            "Please enter a valid email address.";

        status.className = "contact-status show warning";

        document.getElementById("contact_email").focus();

        return;
    }


    // -----------------------------
    // Mobile number validation
    // -----------------------------
    // Allows:
    // 9876543210
    // +919876543210
    // 919876543210
    const mobilePattern =
        /^(?:\+91|91)?[6-9]\d{9}$/;

    // Remove spaces and hyphens before validation
    const cleanPhone = phone.replace(/[\s-]/g, "");

    if (!mobilePattern.test(cleanPhone)) {

        status.textContent =
            "Please enter a valid 10-digit mobile number.";

        status.className = "contact-status show warning";

        document.getElementById("contact_phone").focus();

        return;
    }


    // -----------------------------
    // Show processing message
    // -----------------------------
    status.textContent = "Submitting your enquiry...";
    status.className = "contact-status show info";

    button.disabled = true;


    // -----------------------------
    // Request body
    // -----------------------------
    const requestBody = {
        name: name,
        email: email,
        phone: cleanPhone,
        subject: "Website Enquiry",
        message: message
    };


    try {

        const result = await submitEnquiry(
            API_URL,
            BRANCH_CODE,
            BUSINESS_UNIT_CODE,
            requestBody
        );


        if (result.success) {

            status.textContent =
                "Thank you! Your enquiry has been submitted successfully.";

            status.className = "contact-status show success";


            // Clear form
            document.getElementById("contact_name").value = "";
            document.getElementById("contact_email").value = "";
            document.getElementById("contact_phone").value = "";
            document.getElementById("contact_message").value = "";

        } else {

            status.textContent =
                "We couldn't submit your enquiry. Please try again.";

            status.className = "contact-status show error";

            console.error("API Error:", result.error);
        }

    } catch (error) {

        status.textContent =
            "Something went wrong. Please try again later.";

        status.className = "contact-status show error";

        console.error("Contact form error:", error);

    } finally {

        button.disabled = false;

    }
}