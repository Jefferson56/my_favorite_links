const express = require("express");
const conexion = require("../conexion.js");
const router = express.Router();
const passport = require("passport"); //Se llama al módulo passport para hacer uso de este en este módulo

const { isLoggedIn, isNotLoggedIn } = require("../lib/auth.js");

router.get("/signup", isNotLoggedIn, (req, res) => {
  res.render("auth/signup");
});

router.post("/signup", isNotLoggedIn, passport.authenticate("local.signup", {
    successRedirect: "/profile", //A dónde lo va a enviar cuando esté funcionando, es decir la vista a la que se va a enviar al usuario cuando se autentique correctamente
    failureRedirect: "/signup", //Redireccionará a la ruta /signup cuando la autenticación no salga bien
    failureFlash: true, //Se configura para enviar mensajes de error si hay errores
  })
); //Se trae la función local.signup desde el módulo passport

router.get("/signin", isNotLoggedIn, (req, res) => {
  res.render("auth/signin");
});

router.post("/signin", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local.signin", {
    successRedirect: "/profile",
    failureRedirect: "/signin",
    failureFlash: true,
  })(req, res, next);
});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/signin");
  });
});

router.get("/profile", isLoggedIn, (req, res) => {
  //Con isLoggedIn protegemos la ruta profile
  res.render("profile"); //Se está renderizando la vista profile
});

module.exports = router;
