// js/contact-form.js (исправленный)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const formStatus = document.getElementById('formStatus');
  const submitButton = form.querySelector('.submit-button');

  // Утилиты
  const sanitizeNumber = (countryCodeRaw, phoneRaw) => {
    // Убираем всё кроме цифр и плюса в countryCode
    let cc = String(countryCodeRaw || '').trim();
    cc = cc.replace(/[^\d+]/g, '');

    // Если пользователь ввёл + в начале — убираем его (мы добавляем + отдельно)
    cc = cc.replace(/^\+/, '');

    // Оставляем только цифры из phoneRaw
    let p = String(phoneRaw || '').trim();
    p = p.replace(/\D/g, '');

    // Если телефон пуст — вернём пустую строку
    if (!p) return '';

    return `+${cc}${p}`;
  };

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Берём значения (защита на случай отсутствия элементов)
    const nameEl = document.getElementById('name');
    const emailEl = document.getElementById('email');
    const countryCodeEl = document.getElementById('countryCode');
    const phoneEl = document.getElementById('phone');
    const messageEl = document.getElementById('message');

    const name = nameEl ? nameEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim() : '';
    const countryCode = countryCodeEl ? countryCodeEl.value.trim() : '';
    const phoneRaw = phoneEl ? phoneEl.value.trim() : '';
    const message = messageEl ? messageEl.value.trim() : '';

    const phone = sanitizeNumber(countryCode, phoneRaw);

    // Простая валидация
    if (!name || !email || !message) {
      formStatus.className = 'form-status error';
      formStatus.innerHTML = '<span>Veuillez remplir tous les champs requis.</span>';
      formStatus.style.display = 'block';
      return;
    }

    // UX: блокируем кнопку и показываем статус
    submitButton.disabled = true;
    submitButton.innerHTML = '<span data-lang="fr">Envoi...</span><span data-lang="en" style="display:none;">Sending...</span><span>→</span>';
    if (formStatus) formStatus.style.display = 'none';

    // Для отладки — логируем что будем отправлять
    console.log('Submitting contact form:', { name, email, phone, message });

    try {
      const response = await fetch('https://telegram-form-worker.kinameri20.workers.dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Если бекенд требует специальных заголовков, добавь их здесь
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          message
        })
      });

      // Логи для отладки CORS/статуса
      console.log('Fetch response status:', response.status, response.statusText);

      // Проверяем сетевой/HTTP статус
      if (!response.ok) {
        // Если backend вернул ответ, попробуем прочитать тело (JSON/текст)
        let text = '';
        try {
          text = await response.text();
        } catch (err) {
          text = '[cannot read response body]';
        }
        throw new Error(`Network error: ${response.status} ${response.statusText} — ${text}`);
      }

      // Пытаемся распарсить JSON
      let data;
      try {
        data = await response.json();
      } catch (err) {
        throw new Error('Invalid JSON from server');
      }

      console.log('Worker response data:', data);

      // Логика успешного ответа — зависит от того, что возвращает worker
      if (data && (data.ok === true || data.result)) {
        formStatus.className = 'form-status success';
        formStatus.innerHTML = '<span data-lang="fr">Message envoyé !</span><span data-lang="en" style="display:none;">Message sent!</span>';
        formStatus.style.display = 'block';
        form.reset();
        // сбрасываем счётчик/высоту для textarea, если нужно
        document.querySelectorAll('.js-autogrow-textarea').forEach(ta => {
          ta.style.height = 'auto';
        });
        setTimeout(() => {
          formStatus.style.display = 'none';
        }, 5000);
      } else {
        // Если сервер вернул ok:false или неизвестную структуру
        let errText = (data && data.error) ? data.error : 'Server returned an error';
        throw new Error(errText);
      }
    } catch (error) {
      console.error('Ошибка отправки формы:', error);
      formStatus.className = 'form-status error';
      formStatus.innerHTML = '<span data-lang="fr">Erreur d’envoi. Réessayez plus tard.</span><span data-lang="en" style="display:none;">Error sending. Please try again later.</span>';
      formStatus.style.display = 'block';
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = '<span data-lang="fr">Envoyer</span><span data-lang="en" style="display:none;">Send</span><span>→</span>';
    }
  });
});
