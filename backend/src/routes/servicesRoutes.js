const express = require("express");

const servicesController =
    require("../controllers/servicesController");

const router = express.Router();

router.get(
    "/",
    servicesController.getServices
);

module.exports = router;