// js/contact-form.js

// Инициализация формы только на странице contact.html
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const formStatus = document.getElementById('formStatus');
    const submitButton = form.querySelector('.submit-button');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;

        submitButton.disabled = true;
        submitButton.innerHTML = '<span data-lang="fr">Envoi...</span><span data-lang="en" style="display: none;">Sending...</span><span>→</span>';
        formStatus.style.display = 'none';

        try {
            const response = await fetch('https://telegram-form-worker.kinameri20.workers.dev', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, phone, message })
            });

            const data = await response.json();

            if (data.ok) {
                formStatus.className = 'form-status success';
                formStatus.innerHTML = '<span data-lang="fr">Message envoyé !</span><span data-lang="en" style="display: none;">Message sent!</span>';
                formStatus.style.display = 'block';
                form.reset();

                setTimeout(() => {
                    formStatus.style.display = 'none';
                }, 5000);
            } else {
                throw new Error('Ошибка отправки');
            }
        } catch (error) {
            formStatus.className = 'form-status error';
            formStatus.innerHTML = '<span data-lang="fr">Erreur d’envoi. Réessayez plus tard.</span><span data-lang="en" style="display: none;">Error sending. Please try again later.</span>';
            formStatus.style.display = 'block';
            console.error('Ошибка:', error);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = '<span data-lang="fr">Envoyer</span><span data-lang="en" style="display: none;">Send</span><span>→</span>';
        }
    });
});
