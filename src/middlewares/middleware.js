export const isLogged = (req, res, next) => {
    if (req.user.email) next(); // NOsecomo hacer estooo AAAAAA
    else res.redirect("/login");
};