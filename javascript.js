document.addEventListener("DOMContentLoaded", () => {
  // ============================================
  // КАСТОМНАЯ ПОЛОСА ПРОКРУТКИ
  // ============================================

  const wrapper = document.querySelector(".reviews__wrapper");
  const thumb = document.querySelector(".reviews__scrollbar-thumb");
  const track = document.querySelector(".reviews__scrollbar-track");

  if (wrapper && thumb && track) {
    // Обновление ширины бегунка
    function updateThumbWidth() {
      const scrollWidth = wrapper.scrollWidth;
      const clientWidth = wrapper.clientWidth;

      if (scrollWidth <= clientWidth) {
        thumb.style.display = "none";
        return;
      }

      thumb.style.display = "block";
      const thumbWidth = (clientWidth / scrollWidth) * 100;
      thumb.style.width = `${thumbWidth}%`;
    }

    // Обновление позиции бегунка
    function updateThumbPosition() {
      const scrollLeft = wrapper.scrollLeft;
      const scrollWidth = wrapper.scrollWidth;
      const clientWidth = wrapper.clientWidth;

      const maxScroll = scrollWidth - clientWidth;
      const scrollPercent = scrollLeft / maxScroll;
      const trackWidth = track.clientWidth;
      const thumbWidth = thumb.offsetWidth;
      const maxThumbLeft = trackWidth - thumbWidth;

      thumb.style.left = `${scrollPercent * maxThumbLeft}px`;
    }

    // Скролл при клике на трек
    track.addEventListener("click", (e) => {
      const trackRect = track.getBoundingClientRect();
      const clickX = e.clientX - trackRect.left;
      const thumbWidth = thumb.offsetWidth;
      const trackWidth = track.clientWidth;
      const scrollWidth = wrapper.scrollWidth;
      const clientWidth = wrapper.clientWidth;

      const maxScroll = scrollWidth - clientWidth;
      const clickPercent = clickX / trackWidth;
      const newScrollLeft = clickPercent * maxScroll;

      wrapper.scrollLeft = newScrollLeft;
    });

    // Drag-to-scroll для бегунка
    let isDragging = false;

    thumb.addEventListener("mousedown", (e) => {
      isDragging = true;
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      const trackRect = track.getBoundingClientRect();
      const thumbWidth = thumb.offsetWidth;
      const trackWidth = track.clientWidth;

      let newLeft = e.clientX - trackRect.left - thumbWidth / 2;
      newLeft = Math.max(0, Math.min(newLeft, trackWidth - thumbWidth));

      const scrollPercent = newLeft / (trackWidth - thumbWidth);
      const scrollWidth = wrapper.scrollWidth;
      const clientWidth = wrapper.clientWidth;
      const maxScroll = scrollWidth - clientWidth;

      wrapper.scrollLeft = scrollPercent * maxScroll;
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
    });

    // Слушаем события скролла
    wrapper.addEventListener("scroll", () => {
      updateThumbPosition();
    });

    // При изменении размера окна
    window.addEventListener("resize", () => {
      updateThumbWidth();
      updateThumbPosition();
    });

    // Инициализация
    updateThumbWidth();
    updateThumbPosition();
  }

  // ============================================
  // DRAG-TO-SCROLL (зажатие мыши на карточках)
  // ============================================

  if (wrapper) {
    let isDown = false;
    let startX;
    let scrollLeft;

    wrapper.addEventListener("mousedown", (e) => {
      isDown = true;
      wrapper.style.cursor = "grabbing";
      startX = e.pageX - wrapper.offsetLeft;
      scrollLeft = wrapper.scrollLeft;
    });

    wrapper.addEventListener("mouseleave", () => {
      isDown = false;
      wrapper.style.cursor = "grab";
    });

    wrapper.addEventListener("mouseup", () => {
      isDown = false;
      wrapper.style.cursor = "grab";
    });

    wrapper.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - wrapper.offsetLeft;
      const walk = (x - startX) * 1.5;
      wrapper.scrollLeft = scrollLeft - walk;
    });

    wrapper.addEventListener("touchstart", (e) => {
      isDown = true;
      startX = e.touches[0].pageX - wrapper.offsetLeft;
      scrollLeft = wrapper.scrollLeft;
    });

    wrapper.addEventListener("touchmove", (e) => {
      if (!isDown) return;
      const x = e.touches[0].pageX - wrapper.offsetLeft;
      const walk = (x - startX) * 1.5;
      wrapper.scrollLeft = scrollLeft - walk;
    });

    wrapper.addEventListener("touchend", () => {
      isDown = false;
    });

    wrapper.style.cursor = "grab";
  }

  // ============================================
  // КЛИК НА МОБИЛЬНЫХ (ОВЕРЛЕЙ)
  // ============================================

  const cards = document.querySelectorAll(".reviews__card");

  function closeAllCards() {
    cards.forEach((card) => {
      card.classList.remove("is-active");
    });
  }

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile && cards.length > 0) {
    cards.forEach((card) => {
      card.addEventListener("click", (e) => {
        e.stopPropagation();

        if (card.classList.contains("is-active")) {
          card.classList.remove("is-active");
        } else {
          closeAllCards();
          card.classList.add("is-active");
        }
      });
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".reviews__card")) {
        closeAllCards();
      }
    });

    if (wrapper) {
      wrapper.addEventListener("scroll", () => {
        closeAllCards();
      });
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  ymaps.ready(init);

  function init() {
    var map = new ymaps.Map("russiaMap", {
      center: [62.0, 100.0],
      zoom: 4,
      controls: ["zoomControl", "fullscreenControl"],
    });

    // Координаты городов
    var cities = {
      Москва: [55.7558, 37.6176],
      Казань: [55.7887, 49.1221],
      Волгоград: [48.708, 44.5133],
      Уфа: [54.7355, 55.9919],
      "Санкт-Петербург": [59.9343, 30.3351],
    };

    // Массив для хранения точек
    var points = [];

    // Функция добавления точки
    function addPoint(city, name, activity, result) {
      var coords = cities[city];
      if (!coords) return;

      var placemark = new ymaps.Placemark(
        coords,
        {
          hintContent: `${name}: ${result} км (${activity})`,
          balloonContent: `
                    <strong>${name}</strong><br>
                    Город: ${city}<br>
                    Активность: ${activity}<br>
                    Результат: ${result} км<br>
                    Дата: ${new Date().toLocaleDateString("ru-RU")}
                `,
        },
        {
          preset: "islands#redSportIcon",
          draggable: false,
        },
      );

      map.geoObjects.add(placemark);
      points.push(placemark);
    }

    // Добавляем демо-точки (можно удалить)
    addPoint("Москва", "Алексей", "Бег", "42");
    addPoint("Санкт-Петербург", "Мария", "Прыжок", "170");
    addPoint("Казань", "Дмитрий", "Бросок", "35");

    // Модальное окно и форма (ваш существующий код)
    var modal = document.querySelector(".modalAdd");
    var overlay = document.getElementById("overlay");
    var fixButtons = document.querySelectorAll(".meterWallBtn");
    var closeBtn = document.querySelector(".modalAdd--close");
    var form = document.querySelector(".modalAdd--form");

    function openModal() {
      if (modal) modal.style.display = "block";
      if (overlay) overlay.style.display = "block";
    }

    function closeModal() {
      if (modal) modal.style.display = "none";
      if (overlay) overlay.style.display = "none";
      if (form) form.reset();
    }

    fixButtons.forEach((btn) => {
      btn.addEventListener("click", openModal);
    });

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (overlay) overlay.addEventListener("click", closeModal);

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        var name = document.getElementById("name").value;
        var citySelect = document.getElementById("city");
        var city = citySelect?.options[citySelect.selectedIndex]?.text;
        var result = document.getElementById("number").value;
        var activitySelect = document.getElementById("activity");
        var activity =
          activitySelect?.options[activitySelect.selectedIndex]?.text;

        if (
          !name ||
          !city ||
          !result ||
          !activity ||
          city === "-- Выберите из списка --"
        ) {
          alert("Пожалуйста, заполните все поля");
          return;
        }

        addPoint(city, name, activity, result);
        closeModal();
        alert(`Спасибо, ${name}! Ваш результат добавлен`);
      });
    }

    // Фикс размера
    setTimeout(function () {
      map.container.fitToViewport();
    }, 100);
  }
});
