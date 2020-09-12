const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

let today = new Date();
let items = ["Buy food", "Cook food", "Eat food"];
let options = {
  weekday: "long",
  day: "numeric",
  month: "long"
}
let date = today.toLocaleDateString("en-US", options);
let workItems = [];
app.get("/", (req, res) => {
  res.render("list", {
    listTitle: date,
    newListItems: items
  });
});

app.post("/", function(req, res) {
  item = req.body.newItem;
  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/Work");
  } else {
    items.push(item);
    res.redirect("/");
  }

});

app.get("/work", (req, res) => {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
})

app.post("/work", (req, res) => {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
})

app.listen(3000, () => {
  console.log("Server started on port 3000");
});