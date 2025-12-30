/**
 * Header 模組命名空間
 * 提供 header 相關的所有功能
 */
const HeaderModule = (function () {
  "use strict";

  const DEFAULT_ANIMATION_DURATION = 300; // 預設動畫持續時間（毫秒）

  /**
   * 處理語言切換按鈕點擊
   * @param {number} animationDuration - 動畫持續時間（毫秒）
   */
  function handleLangToggle(animationDuration = DEFAULT_ANIMATION_DURATION) {
    $("body").on("click", ".lang_active", function () {
      $(this)
        .parents(".lang")
        .find(".lang_list")
        .slideToggle(animationDuration);
      $(this).toggleClass("dropdown");
    });
  }

  /**
   * 處理 QR Code 切換按鈕點擊
   * @param {number} animationDuration - 動畫持續時間（毫秒）
   */
  function handleQrcodeToggle(animationDuration = DEFAULT_ANIMATION_DURATION) {
    $("body").on("click", ".qrcode_active", function () {
      $(this)
        .parents(".qrcode")
        .find(".qrcode_list")
        .slideToggle(animationDuration);
      $(this).toggleClass("dropdown");
    });
  }

  /**
   * 處理選單開關
   */
  function handleMenuToggle() {
    $("body").on("click", ".menu", function () {
      $("header nav>ul").addClass("active");
    });

    $("body").on("click", ".menu-close", function () {
      $("header nav>ul").removeClass("active");
    });

    $("body").on("click", "header nav a", function () {
      $("header nav>ul").removeClass("active");
    });
  }

  /**
   * 處理點擊外部區域關閉下拉選單
   * @param {number} animationDuration - 動畫持續時間（毫秒）
   */
  function handleOutsideClick(animationDuration = DEFAULT_ANIMATION_DURATION) {
    $(document).on("click", function (event) {
      const $qrcodeArea = $(".qrcode");
      if (
        !$qrcodeArea.is(event.target) &&
        $qrcodeArea.has(event.target).length === 0
      ) {
        $(".qrcode_list").slideUp(animationDuration);
        $(".qrcode_active").removeClass("dropdown");
      }

      const $langArea = $(".lang");
      if (
        !$langArea.is(event.target) &&
        $langArea.has(event.target).length === 0
      ) {
        $(".lang_list").slideUp(animationDuration);
        $(".lang_active").removeClass("dropdown");
      }
    });
  }

  /**
   * 安全地載入 header.html
   * @param {string} headerPath - header.html 的路徑，預設為 "header.html"
   * @param {string} placeholderId - placeholder 元素的 ID，預設為 "header-placeholder"
   * @returns {Promise} 載入完成的 Promise
   */
  function loadHeader(
    headerPath = "header.html",
    placeholderId = "header-placeholder"
  ) {
    return new Promise(function (resolve, reject) {
      const headerPlaceholder = document.getElementById(placeholderId);
      if (!headerPlaceholder) {
        const error = new Error(
          `Header placeholder element with id "${placeholderId}" not found`
        );
        console.warn(error.message);
        reject(error);
        return;
      }

      fetch(headerPath)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then((html) => {
          headerPlaceholder.innerHTML = html;

          // 載入 header 後重新應用 i18n（如果已初始化）
          if (
            typeof I18nModule !== "undefined" &&
            typeof i18next !== "undefined" &&
            i18next.isInitialized
          ) {
            I18nModule.applyI18n();
          }

          resolve();
        })
        .catch((error) => {
          console.error(`Failed to load ${headerPath}:`, error);
          const headerPlaceholder = document.getElementById(placeholderId);
          if (headerPlaceholder) {
            headerPlaceholder.innerHTML = "<p>無法載入頁首內容</p>";
          }
          reject(error);
        });
    });
  }

  /**
   * 初始化所有 header 相關的事件處理
   * @param {number} animationDuration - 動畫持續時間（毫秒）
   */
  function initEvents(animationDuration = DEFAULT_ANIMATION_DURATION) {
    handleLangToggle(animationDuration);
    handleQrcodeToggle(animationDuration);
    handleMenuToggle();
    handleOutsideClick(animationDuration);
  }

  // 通用API
  return {
    // 常數
    DEFAULT_ANIMATION_DURATION,

    // 事件處理函數
    handleLangToggle,
    handleQrcodeToggle,
    handleMenuToggle,
    handleOutsideClick,

    // 核心功能
    loadHeader,
    initEvents,
  };
})();
