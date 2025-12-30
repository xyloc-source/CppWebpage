/**
 * i18n 模組命名空間
 * 提供國際化相關的所有功能
 */
const I18nModule = (function () {
  "use strict";

  const DEFAULT_LANGUAGE = "zh-TW";
  const FALLBACK_LANGUAGE = "zh-TW";
  const ALLOWED_LANGUAGES = ["zh-TW", "zh-CN"]; // 允許的語言代碼白名單（英文用於跳轉，不在此列表）
  const EXTERNAL_LINK_LANGUAGES = ["en"]; // 需要跳轉到外部連結的語言

  // ============================================
  // 工具函數
  // ============================================

  /**
   * 安全地設置元素內容，防止 XSS 攻擊
   * @param {jQuery|HTMLElement} element - 目標元素
   * @param {string} content - 要設置的內容
   * @param {string} method - 設置方法：'html', 'text', 'attr', 'placeholder'
   */
  function safeSetContent(element, content, method = "html") {
    const $el = $(element);
    if (!$el.length) return;

    // 移除潛在的危險標籤和屬性
    const sanitizedContent = sanitizeHtml(content);

    switch (method) {
      case "text":
        $el.text(sanitizedContent);
        break;
      case "attr":
        $el.attr("label", sanitizedContent);
        break;
      case "placeholder":
        $el.attr("placeholder", sanitizedContent);
        break;
      case "html":
      default:
        $el.html(sanitizedContent);
        break;
    }
  }

  /**
   * 簡單的 HTML 清理函數
   * @param {string} html - 要清理的 HTML 字串
   * @returns {string} 清理後的 HTML
   */
  function sanitizeHtml(html) {
    if (typeof html !== "string") return "";
    // 移除 script 標籤
    return html.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    );
  }

  /**
   * 驗證語言代碼是否在允許列表中
   * @param {string} lang - 語言代碼
   * @returns {boolean} 是否有效
   */
  function isValidLanguage(lang) {
    return typeof lang === "string" && ALLOWED_LANGUAGES.includes(lang);
  }

  /**
   * 檢查是否為外部連結語言
   * @param {string} lang - 語言代碼
   * @returns {boolean} 是否為外部連結語言
   */
  function isExternalLinkLanguage(lang) {
    return typeof lang === "string" && EXTERNAL_LINK_LANGUAGES.includes(lang);
  }

  /**
   * 更新語言切換按鈕的 active 狀態
   * @param {string} lang - 當前語言代碼
   */
  function updateLangActive(lang) {
    if (!isValidLanguage(lang)) {
      console.warn(`Invalid language code: ${lang}`);
      return;
    }

    const $langLinks = $(".lang_list a");
    $langLinks.removeClass("active");
    $langLinks.each(function () {
      const linkLang = $(this).data("lang");
      if (linkLang === lang) {
        $(this).addClass("active");
      }
    });
  }

  /**
   * 應用國際化翻譯
   */
  function applyI18n() {
    if (typeof i18next === "undefined" || !i18next.isInitialized) {
      console.warn("i18next is not initialized");
      return;
    }

    const currentLang = i18next.language;

    $("[data-i18n]").each(function () {
      const $el = $(this);
      const key = $el.data("i18n");

      if (!key) {
        console.warn("Missing i18n key on element:", this);
        return;
      }

      try {
        const value = i18next.t(key);

        if (!value || value === key) {
          console.warn(`Translation missing for key: ${key}`);
          return;
        }

        const tag = this.tagName.toUpperCase();

        switch (tag) {
          case "INPUT":
          case "TEXTAREA":
            safeSetContent($el, value, "placeholder");
            break;
          case "OPTGROUP":
            safeSetContent($el, value, "attr");
            break;
          case "OPTION":
            safeSetContent($el, value, "text");
            break;
          default:
            safeSetContent($el, value, "html");
            break;
        }
      } catch (error) {
        console.error(`Error applying translation for key ${key}:`, error);
      }
    });

    // 更新語言切換按鈕狀態
    updateLangActive(currentLang);

    // 設置表單驗證訊息
    setupFormValidation();
  }

  /**
   * 設置表單驗證
   */
  function setupFormValidation() {
    $("[required]").each(function () {
      const $el = $(this);

      $el.off("invalid input"); // 移除舊的事件監聽器，避免重複綁定

      $el.on("invalid", function () {
        try {
          const message = i18next.t("contact.form.requiredMessage");
          this.setCustomValidity(message || "此欄位為必填");
        } catch (error) {
          console.error("Error setting validation message:", error);
          this.setCustomValidity("此欄位為必填");
        }
      });

      $el.on("input", function () {
        this.setCustomValidity("");
      });
    });
  }

  /**
   * 處理語言切換
   * @param {number} animationDuration - 動畫持續時間（毫秒）
   */
  function handleLanguageChange(animationDuration = 300) {
    $("body").on("click", ".lang_list a", function (e) {
      const $link = $(this);
      const lang = $link.data("lang");

      // 如果沒有語言代碼，允許預設行為（可能是外部連結）
      if (!lang) {
        return true;
      }

      // 優先檢查是否為需要跳轉的語言（如英文）
      if (isExternalLinkLanguage(lang)) {
        // 允許導航到外部連結，不進行語言切換
        return true;
      }

      // 驗證語言代碼是否在允許列表中
      if (!isValidLanguage(lang)) {
        console.warn(`Invalid language code: ${lang}`);
        // 如果語言無效，允許預設行為（可能是外部連結）
        return true;
      }

      // 阻止預設行為，進行語言切換
      e.preventDefault();

      // 切換語言
      i18next.changeLanguage(lang, function (error) {
        if (error) {
          console.error("Failed to change language:", error);
          return;
        }
        applyI18n();
      });

      // 關閉下拉選單
      $link.closest(".lang_list").slideUp(animationDuration);
    });
  }

  /**
   * 初始化 i18next
   */
  function initializeI18n() {
    if (
      typeof i18next === "undefined" ||
      typeof i18nextHttpBackend === "undefined"
    ) {
      console.error("i18next or i18nextHttpBackend is not loaded");
      return false;
    }

    i18next.use(i18nextHttpBackend).init(
      {
        lng: DEFAULT_LANGUAGE,
        fallbackLng: FALLBACK_LANGUAGE,
        load: "currentOnly",
        debug: false,
        backend: {
          loadPath: "/locales/{{lng}}/translation.json",
        },
      },
      function (error) {
        if (error) {
          console.error("Failed to initialize i18next:", error);
          return;
        }
        applyI18n();
      }
    );

    return true;
  }

  /**
   * 等待 i18next 庫載入並初始化
   * @param {number} timeout - 超時時間（毫秒），預設 10 秒
   * @returns {Promise} 初始化完成的 Promise
   */
  function waitAndInitialize(timeout = 10000) {
    return new Promise((resolve, reject) => {
      // 如果庫已經載入，直接初始化
      if (
        typeof i18next !== "undefined" &&
        typeof i18nextHttpBackend !== "undefined"
      ) {
        const success = initializeI18n();
        resolve(success);
        return;
      }

      // 等待庫載入
      const checkInterval = 100;
      const startTime = Date.now();
      const checkI18n = setInterval(function () {
        if (
          typeof i18next !== "undefined" &&
          typeof i18nextHttpBackend !== "undefined"
        ) {
          clearInterval(checkI18n);
          const success = initializeI18n();
          resolve(success);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkI18n);
          console.error("i18next libraries failed to load within timeout");
          reject(new Error("i18next libraries failed to load"));
        }
      }, checkInterval);
    });
  }

  // 通用API
  return {
    // 常數
    DEFAULT_LANGUAGE,
    FALLBACK_LANGUAGE,
    ALLOWED_LANGUAGES,
    EXTERNAL_LINK_LANGUAGES,

    // 工具函數
    isValidLanguage,
    isExternalLinkLanguage,
    updateLangActive,

    // 核心功能
    applyI18n,
    setupFormValidation,
    handleLanguageChange,
    initializeI18n,
    waitAndInitialize,
  };
})();
