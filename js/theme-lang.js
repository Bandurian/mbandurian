/* ═══════════════════════════════════════════════════════════════
   THEME SWITCHER
═══════════════════════════════════════════════════════════════ */

function initThemeSwitcher() {
    const themeButton = document.getElementById('themeButton');

    if (!themeButton) return;

    // Определяем системную тему
    function getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    }

    // Текущая тема: из localStorage или системная
    let currentTheme = localStorage.getItem('selectedTheme') || getSystemTheme();

    // Устанавливаем тему на странице
    function setTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        currentTheme = theme;
    }

    // Применяем начальную тему
    setTheme(currentTheme);

    // Переключение при клике
    themeButton.addEventListener('click', function() {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(currentTheme);
        localStorage.setItem('selectedTheme', currentTheme);
    });

    // Следим за системной темой (если пользователь не выбрал вручную)
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        if (!localStorage.getItem('selectedTheme')) {
            const newTheme = e.matches ? 'light' : 'dark';
            setTheme(newTheme);
        }
    });
}


/* ═══════════════════════════════════════════════════════════════
   LANGUAGE SWITCHER
═══════════════════════════════════════════════════════════════ */

function initLanguageSwitcher() {
    const languageButton = document.getElementById('languageButton');
    const languageDropdown = document.getElementById('languageDropdown');
    const currentLanguageSpan = document.getElementById('currentLanguage');
    const languageOptions = document.querySelectorAll('.language-option');

    if (!languageButton || !languageDropdown || !currentLanguageSpan || !languageOptions.length) return;

    // Текущий язык: из localStorage или французский по умолчанию
    let currentLang = localStorage.getItem('selectedLanguage') || 'fr';

    // Функция переключения языка
    function switchLanguage(lang) {
        currentLang = lang;
        currentLanguageSpan.textContent = lang.toUpperCase();
        document.documentElement.lang = lang;

        // Обновляем выбранный пункт в dropdown
        languageOptions.forEach(opt => {
            if (opt.getAttribute('data-lang') === lang) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });

        // Показываем/скрываем тексты по data-lang
        document.querySelectorAll('[data-lang]').forEach(element => {
            if (element.classList.contains('language-option')) return;
            if (element.getAttribute('data-lang') === lang) {
                element.style.display = '';
            } else {
                element.style.display = 'none';
            }
        });

        // Плейсхолдеры в формах
        document.querySelectorAll('[data-lang-placeholder]').forEach(input => {
            if (input.getAttribute('data-lang-placeholder') === lang) {
                input.style.display = '';
            } else {
                input.style.display = 'none';
            }
        });
    }

    // Устанавливаем начальный язык
    switchLanguage(currentLang);

    // Открытие/закрытие dropdown
    languageButton.addEventListener('click', function(e) {
        e.stopPropagation();
        languageButton.classList.toggle('active');
        languageDropdown.classList.toggle('active');
    });

    // Выбор языка
    languageOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const selectedLang = this.getAttribute('data-lang');
            switchLanguage(selectedLang);
            localStorage.setItem('selectedLanguage', selectedLang);
            languageButton.classList.remove('active');
            languageDropdown.classList.remove('active');
        });
    });

    // Закрытие dropdown при клике вне его
    document.addEventListener('click', function(e) {
        if (!languageButton.contains(e.target) && !languageDropdown.contains(e.target)) {
            languageButton.classList.remove('active');
            languageDropdown.classList.remove('active');
        }
    });
}


// Запускаем оба переключателя, когда DOM готов
document.addEventListener('DOMContentLoaded', () => {
    initThemeSwitcher();
    initLanguageSwitcher();
});