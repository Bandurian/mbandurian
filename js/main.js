// Запускаем основную логику после готовности DOM
document.addEventListener('DOMContentLoaded', () => {
    initGridAnimations();
    initHeadingParallax();
    initThemeSwitcher();
    initLanguageSwitcher();
});

// Отдельно лениво запускаем тяжёлую three.js‑модель после полной загрузки страницы
window.addEventListener('load', () => {
    initThreeModel();
});


/* ===========================
   Grid + переходы страниц
=========================== */

function initGridAnimations() {
    const gridItems = document.querySelectorAll('.grid-item');

    gridItems.forEach((item, index) => {
        item.style.animationDelay = (2.0 + index * 0.05) + 's';
    });

    document.querySelectorAll('.grid-item.content.interactive').forEach(item => {
        item.addEventListener('click', function (e) {
            const text = (this.querySelector('.item-text')?.textContent || '').toUpperCase();

            if (text.includes('PROJET')) {
                transitionToPage(e, 'projects-fr.html');
            } else if (text.includes('CONTACT')) {
                transitionToPage(e, 'contact-fr.html');
            }
        });
    });
}

function transitionToPage(event, pageUrl) {
    const circle = document.createElement('div');
    circle.classList.add('transition-overlay');

    circle.style.left = event.clientX + 'px';
    circle.style.top = event.clientY + 'px';

    const maxDistance = Math.sqrt(
        Math.pow(Math.max(event.clientX, window.innerWidth - event.clientX), 2) +
        Math.pow(Math.max(event.clientY, window.innerHeight - event.clientY), 2)
    );

    circle.style.width = maxDistance * 2 + 'px';
    circle.style.height = maxDistance * 2 + 'px';

    document.body.appendChild(circle);
    document.body.classList.add('page-transitioning');

    // небольшой таймер для старта анимации
    setTimeout(() => circle.classList.add('active'), 10);

    // через 800 мс переходим на страницу
    setTimeout(() => {
        window.location.href = pageUrl;
    }, 800);
}

/* ===========================
   Параллакс заголовка
=========================== */

function initHeadingParallax() {
    const heading = document.querySelector('.main-heading');
    if (!heading) return;

    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        heading.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    });
}



/* ===========================
   Theme switcher
=========================== */

function initThemeSwitcher() {
    const themeButton = document.getElementById('themeButton');
    if (!themeButton) return;

    function getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    }

    let currentTheme = localStorage.getItem('selectedTheme') || getSystemTheme();

    function setTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        currentTheme = theme;
    }

    setTheme(currentTheme);

    themeButton.addEventListener('click', function () {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(currentTheme);
        localStorage.setItem('selectedTheme', currentTheme);
    });

    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        if (!localStorage.getItem('selectedTheme')) {
            const newTheme = e.matches ? 'light' : 'dark';
            setTheme(newTheme);
        }
    });
}

/* ===========================
   Language switcher
=========================== */

function initLanguageSwitcher() {
    const languageButton = document.getElementById('languageButton');
    const languageDropdown = document.getElementById('languageDropdown');
    const currentLanguageSpan = document.getElementById('currentLanguage');
    const languageOptions = document.querySelectorAll('.language-option');

    if (!languageButton || !languageDropdown || !currentLanguageSpan || !languageOptions.length) return;

    let currentLang = localStorage.getItem('selectedLanguage') || 'fr';

    function switchLanguage(lang) {
        currentLang = lang;
        currentLanguageSpan.textContent = lang.toUpperCase();
        document.documentElement.lang = lang;

        languageOptions.forEach(opt => {
            if (opt.getAttribute('data-lang') === lang) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });

        // Переключение текстов с атрибутом data-lang (кроме самих опций)
        document.querySelectorAll('[data-lang]').forEach(element => {
            if (element.classList.contains('language-option')) return;
            if (element.getAttribute('data-lang') === lang) {
                element.style.display = '';
            } else {
                element.style.display = 'none';
            }
        });

        // Плейсхолдеры
        document.querySelectorAll('[data-lang-placeholder]').forEach(input => {
            if (input.getAttribute('data-lang-placeholder') === lang) {
                input.style.display = '';
            } else {
                input.style.display = 'none';
            }
        });
    }

    switchLanguage(currentLang);

    languageButton.addEventListener('click', function (e) {
        e.stopPropagation();
        languageButton.classList.toggle('active');
        languageDropdown.classList.toggle('active');
    });

    languageOptions.forEach(option => {
        option.addEventListener('click', function (e) {
            e.stopPropagation();
            const selectedLang = this.getAttribute('data-lang');

            // если вам нужен редирект на английскую версию страницы, раскомментируйте:
            
            if (selectedLang === 'en') {
                window.location.href = 'portfolio-en.html';
                return;
            }
            

            switchLanguage(selectedLang);
            localStorage.setItem('selectedLanguage', selectedLang);
            languageButton.classList.remove('active');
            languageDropdown.classList.remove('active');
        });
    });

    document.addEventListener('click', function (e) {
        if (!languageButton.contains(e.target) && !languageDropdown.contains(e.target)) {
            languageButton.classList.remove('active');
            languageDropdown.classList.remove('active');
        }
    });
}
