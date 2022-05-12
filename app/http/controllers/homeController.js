function homeController() {
  return {
    index(req, res) {
      {
        res.render("home.ejs");
      }
    },
    aboutus(req, res) {
      res.render("aboutus.ejs");
    },
  };
}

module.exports = homeController;
