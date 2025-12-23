$(".lang_active").click(function () {
    $(this).parents(".lang").find(".lang_list").slideToggle(300);
    $(this).toggleClass("dropdown");
});

$(".qrcode_active").click(function () {
  $(this).parents(".qrcode").find(".qrcode_list").slideToggle(300);
  $(this).toggleClass("dropdown");
});

$(".menu").click(function () {
    $("header nav>ul").addClass("active");
})

$(".menu-close").click(function () {
  $("header nav>ul").removeClass("active");
});

$("header nav a").click(function () {
    $("header nav>ul").removeClass("active");
})

$(document).click(function (event) {
  var area = $(".qrcode");
  if (!area.is(event.target) && area.has(event.target).length === 0) {
    $(".qrcode_list").slideUp(300);
    $(".qrcode_active").removeClass("dropdown");
  }

  var langArea = $(".lang");
  if (!langArea.is(event.target) && langArea.has(event.target).length === 0) {
    $(".lang_list").slideUp(300);
    $(".lang_active").removeClass("dropdown");
  }
});