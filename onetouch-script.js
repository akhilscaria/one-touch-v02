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


const API_URL = "https://gbb4e16f60f7d6b-atpots01.adb.ap-hyderabad-1.oraclecloudapps.com/ords/maze/public/enquiry";
const BRANCH_CODE = "M-IND";
const BUSINESS_UNIT_CODE = "MIND-HO";

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


    // Get form values
    const name = document.getElementById("contact_name").value.trim();
    const email = document.getElementById("contact_email").value.trim();
    const phone = document.getElementById("contact_phone").value.trim();
    const message = document.getElementById("contact_message").value.trim();


    // Basic validation
    if (!name || !email || !phone || !message) {

        status.textContent = "Please fill in all fields.";

        return;
    }


    status.textContent = "Submitting enquiry...";
    button.disabled = true;


    // Request body
    const requestBody = {
        name: name,
        email: email,
        phone: phone,
        subject: "Website Enquiry",
        message: message
    };


    // Call API
    const result = await submitEnquiry(
        API_URL,
        BRANCH_CODE,
        BUSINESS_UNIT_CODE,
        requestBody
    );


    if (result.success) {

        status.textContent = "Enquiry submitted successfully.";

        // Clear form
        document.getElementById("contact_name").value = "";
        document.getElementById("contact_email").value = "";
        document.getElementById("contact_phone").value = "";
        document.getElementById("contact_message").value = "";

    } else {

        status.textContent =
            "Unable to submit enquiry. Please try again.";

        console.error(result.error);
    }


    button.disabled = false;
}