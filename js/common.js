const ANIMATION_DURATION = 300; // 動畫持續時間（毫秒）

function init() {
  // 等待 DOM 和必要的庫載入完成
  if (typeof jQuery === "undefined") {
    console.error("jQuery is not loaded");
    return;
  }

  $(document).ready(function () {
    // 初始化 header 模組（如果已載入）
    if (typeof HeaderModule !== "undefined") {
      // 初始化 header
      HeaderModule.initEvents(ANIMATION_DURATION);

      // 載入 header
      HeaderModule.loadHeader().catch(function (error) {
        console.error("Failed to load header:", error);
      });
    } else {
      console.warn(
        "HeaderModule is not loaded. Header features will not work."
      );
    }

    // 初始化 i18n 模組
    if (typeof I18nModule !== "undefined") {
      // 設置語言切換事件處理
      I18nModule.handleLanguageChange(ANIMATION_DURATION);

      // 等待並初始化 i18next
      I18nModule.waitAndInitialize().catch(function (error) {
        console.error("Failed to initialize i18n module:", error);
      });
    } else {
      console.warn("I18nModule is not loaded. i18n features will not work.");
    }
  });
}

init();
