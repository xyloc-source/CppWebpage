$(".lang_active").click(function () {
    $(this).parents(".lang").find(".lang_list").slideToggle(300);
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