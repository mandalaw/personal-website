const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.navbar__menu');
const navbarItems = document.querySelectorAll('.navbar__item');
let fullname = document.getElementById("fullname")
let first = document.getElementById("first")
let last = document.getElementById("last")
let mail = document.getElementById("email")
let photo = document.getElementById("photo")
let id_num = document.getElementById("id_num")
let sign = document.getElementById("sign")
let out = document.getElementById("out")
let info = document.getElementById("info")

const loginBtn = document.getElementById("login-btn");
const loginPopup = document.getElementById("login-popup");
const closePopup = document.getElementById("close-popup");


menu.addEventListener('click', function() {
    menu.classList.toggle('is-active');
    menuLinks.classList.toggle('active');
});


loginBtn.addEventListener("click", function() {
  loginPopup.style.display = "block";
});

// closePopup.addEventListener("click", function() {
//   loginPopup.style.display = "none";
// });

// Show All Data in Web from localStorage
function show_L_data() {
  if (localStorage.getItem("infos")) {
    let infosLparse = JSON.parse(localStorage.getItem("infos"))
 
    info.classList.remove("d-none")
    sign.classList.add("d-none")
    out.classList.remove("d-none")
 
    fullname.innerHTML = infosLparse.fullnameL
    photo.src = infosLparse.photo_linkL
    first.innerHTML = infosLparse.firstL
    last.innerHTML = infosLparse.lastL
    mail.innerHTML = infosLparse.mailL
    id_num.innerHTML = infosLparse.id_numL

    // Show navbar items
    navbarItems.forEach(item => {
      item.style.display = "block";
    })
    
  } else {
    info.classList.add("d-none")
    sign.classList.remove("d-none")
    out.classList.add("d-none")

    // Hide navbar items
    navbarItems.forEach(item => {
      item.style.display = "none";
    })
  }
 
}

window.addEventListener("load",show_L_data())



// Sign in // Sign in // Sign in // Sign in
function handleCredentialResponse(response) {

  // decodeJwtResponse() is a custom function defined by you
  // to decode the credential response.
  const responsePayload = decodeJwtResponse(response.credential);

  let infos = {
    fullnameL: responsePayload.name,
    photo_linkL: responsePayload.picture,
    firstL: responsePayload.given_name,
    lastL: responsePayload.family_name,
    mailL: responsePayload.email,
    id_numL: responsePayload.sub
  }

  let infosL = JSON.stringify(infos)

  localStorage.setItem("infos",infosL)

  show_L_data()
}


// decodeJwtResponse()
function decodeJwtResponse(data) {
  let tokens = data.split(".");
  return JSON.parse(atob(tokens[1]))
}

// Sign Out
out.addEventListener("click", ()=>{
  localStorage.clear()
  info.classList.add("d-none")
  sign.classList.remove("d-none")
  out.classList.add("d-none")

  // Hide navbar items
  navbarItems.forEach(item => {
    item.style.display = "none";
  })
})
