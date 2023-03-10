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
const MainBtn = document.getElementById("main-btn");
  // Google Sheet API Method: spreadsheets.values.append (Begin)

src="https://apis.google.com/js/api.js"

    // Google Sheet API Method: spreadsheets.values.append (End)

document.getElementById("close-popup").addEventListener("click", function(event) {
      event.preventDefault();
      loginPopup.style.display = "none";
      // your code to close the popup
    });

    

menu.addEventListener('click', function() {
    menu.classList.toggle('is-active');
    menuLinks.classList.toggle('active');
});


loginBtn.addEventListener("click", function() {
  loginPopup.style.display = "block";
});




// Show All Data in Web from localStorage
function show_L_data() {
  if (localStorage.getItem("infos")) {
        // User is signed in
    let infosLparse = JSON.parse(localStorage.getItem("infos"))
 
    info.classList.remove("d-none")
    sign.classList.add("d-none")
    sign.classList.remove("g_id_signin")
    out.classList.remove("d-none")
 
    fullname.innerHTML = infosLparse.fullnameL
    console.log(fullname.innerHTML)
    photo.src = infosLparse.photo_linkL
    console.log(photo.src)
    first.innerHTML = infosLparse.firstL
    console.log(first.innerHTML)
    last.innerHTML = infosLparse.lastL
    console.log(last.innerHTML)
    mail.innerHTML = infosLparse.mailL
    console.log(mail.innerHTML)
    id_num.innerHTML = infosLparse.id_numL
    console.log(id_num.innerHTML)

    // Show navbar items
    navbarItems.forEach(item => {
      item.style.display = "block";
      loginBtn.textContent = "Signed In";

    // Show the card element
    info.style.display = "display";
    out.style.display = "display";
    })
    
  } else {
    // User is not signed in

    info.classList.add("d-none")
    sign.classList.remove("d-none")
    out.classList.add("d-none")
    // Hide navbar items
    navbarItems.forEach(item => {
      item.style.display = "none";
      loginBtn.textContent = "Sign In";

    // Hide the card element
    info.style.display = "none";
    out.style.display = "none";
    }
    )
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
  // Log the infos assigned 
  console.log(infos)

  let infosL = JSON.stringify(infos)

  localStorage.setItem("infos",infosL)
  show_L_data()
  // Reload the window to update the UI
  window.location.reload();
}


// decodeJwtResponse()
function decodeJwtResponse(data) {
  let tokens = data.split(".");
  return JSON.parse(atob(tokens[1]))
}

// Sign Out
out.addEventListener("click", (event)=>{
  event.preventDefault();
  localStorage.clear();
  info.classList.add("d-none");
  sign.classList.remove("d-none");
  out.classList.add("d-none");

  // Hide navbar items
  navbarItems.forEach(item => {
    item.style.display = "none";
  }
  
  )
})


window.addEventListener('load', function () {
  var element = document.body;
  element.classList.add("dark-mode");
}
);

function myFunction() {
  var element = document.body;
  element.classList.toggle("dark-mode");
}

MainBtn.addEventListener('click', function() {
  setTimeout(function() {
    loginBtn.click();
  }, 0);
});





  // // Google Sheet API Method: spreadsheets.values.append (Begin)
  // /**
  //  * Sample JavaScript code for sheets.spreadsheets.values.append
  //  * See instructions for running APIs Explorer code samples locally:
  //  * https://developers.google.com/explorer-help/code-samples#javascript
  //  */

  // function authenticate() {
  //   return gapi.auth2.getAuthInstance()
  //       .signIn({scope: "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets"})
  //       .then(function() { console.log("Sign-in successful"); },
  //             function(err) { console.error("Error signing in", err); });
  // }
  // function loadClient() {
  //   gapi.client.setApiKey("AIzaSyCUi5ramQkN12uHW6jbPmQalJEZTGb11i4");
  //   return gapi.client.load("https://sheets.googleapis.com/$discovery/rest?version=v4")
  //       .then(function() { console.log("GAPI client loaded for API"); },
  //             function(err) { console.error("Error loading GAPI client for API", err); });
  // }
  // // Make sure the client is loaded and sign-in is complete before calling this method.
  // function execute() {
  //   return gapi.client.sheets.spreadsheets.values.append({
  //     "spreadsheetId": "1deccHApL7r195bkRumleEQvXFEO-ECgO6Ifk0Aijhos",
  //     "range": "MandalawiLog",
  //     "includeValuesInResponse": false,
  //     "insertDataOption": "INSERT_ROWS",
  //     "responseDateTimeRenderOption": "SERIAL_NUMBER",
  //     "responseValueRenderOption": "FORMATTED_VALUE",
  //     "valueInputOption": "USER_ENTERED",
  //     "resource": {
  //       "majorDimension": "rows",
  //       "values": [
  //         [
  //           "Ahmed",
  //           "Mandalawi",
  //           "Mandaalwi@mail.com",
  //           "198844949949",
  //           "www.helloworld.com/pic",
  //           "Ahmed Mandalawi"
  //         ]
  //       ]
  //     }
  //   })
  //       .then(function(response) {
  //               // Handle the results here (response.result has the parsed body).
  //               console.log("Response", response);
  //             },
  //             function(err) { console.error("Execute error", err); });
  // }
  // gapi.load("client:auth2", function() {
  //   gapi.auth2.init({client_id: "222067586540-090c5ubn4vf6487rcqg29it7n4eoc22h.apps.googleusercontent.com"});
  // });

  // // Google Sheet API Method: spreadsheets.values.append (End)

  // Promise.resolve(window.gapi.auth2.getAuthInstance().signIn())
  // .then(() => { loadClient })
  // execute()
