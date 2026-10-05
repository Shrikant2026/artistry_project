require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
    console.log(
        `RUPANJALI'S MAKEUP ARTISTRY API running on port ${PORT}`
    );
});