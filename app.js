const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.navbar__menu');

menu.addEventListener('click', function() {
    menu.classList.toggle('is-active');
    menuLinks.classList.toggle('active');
});


const loginBtn = document.getElementById("login-btn");
const loginPopup = document.getElementById("login-popup");
const closePopup = document.getElementById("close-popup");

loginBtn.addEventListener("click", function() {
  loginPopup.style.display = "block";
});

closePopup.addEventListener("click", function() {
  loginPopup.style.display = "none";
});
