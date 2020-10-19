const { Sequelize } = require("sequelize");
const colors = require("colors");

const db = new Sequelize("crud_app", "arunagn", "", {
  host: "localhost",
  dialect: "mysql",
  logging: (msg) => console.log(msg.yellow.bold),
});

const connect = async () => {
  try {
    await db.authenticate();
    console.log("DB connected successfully".magenta.bold);
  } catch (err) {
    console.error(err.message.red.underline);
    process.exit(1);
  }
};

module.exports = { db, connect };
