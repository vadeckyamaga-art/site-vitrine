// main.js
// Comportements généraux du site : menu mobile, carrousels (flèches + défilement
// automatique), et envoi du formulaire de contact via Formspree.

document.addEventListener('includesLoaded', () => {
    // Année dans le footer
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Menu mobile
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
        navMenu.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', () => navMenu.classList.remove('open'))
        );
    }

    // Boutons flèches des carrousels
    document.querySelectorAll('.track-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const track = document.getElementById(btn.dataset.target);
            const card = track.querySelector('.product-card');
            if (!card) return;
            const step = card.getBoundingClientRect().width + 22; // largeur carte + gap
            track.scrollBy({ left: btn.classList.contains('next') ? step : -step, behavior: 'smooth' });
        });
    });

    // Défilement automatique doux des carrousels
    document.querySelectorAll('.scroll-track').forEach(track => {
        let dir = 1;
        setInterval(() => {
            if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 5) dir = -1;
            if (track.scrollLeft <= 0) dir = 1;
            track.scrollBy({ left: dir * 1.2, behavior: 'auto' });
        }, 30);
    });

    // Formulaire de contact -> Formspree (AJAX) + message de confirmation
    const form = document.getElementById('contactForm');
    if (form) {
        const successMsg = document.getElementById('formSuccess');
        const errorMsg = document.getElementById('formError');

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            successMsg.style.display = 'none';
            errorMsg.style.display = 'none';

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    successMsg.style.display = 'block';
                    form.reset();
                } else {
                    errorMsg.style.display = 'block';
                }
            } catch (err) {
                errorMsg.style.display = 'block';
            }
        });
    }
});