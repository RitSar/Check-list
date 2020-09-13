const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const itemsSchema = {
  name: String,
  check: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todo list.",
  check: "off"
});
const item2 = new Item({
  name: "Use + to add a new item.",
  check: "off"
});
const item3 = new Item({
  name: "<-- Check to strike through.",
  check: "off"
});


let today = new Date();
let options = {
  weekday: "long",
  day: "numeric",
  month: "long"
}
let date = today.toLocaleDateString("en-US", options);
let workItems = [];

app.get("/", (req, res) => {
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany([item1, item2, item3], (err) => {
        if (err) console.log(err);
        else console.log("Successfully added default items to database.");
      });
      res.redirect("/");
    }
    res.render("list", {
      listTitle: date,
      newListItems: foundItems
    });
  });

});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName,
    check: "off"
  });
  item.save();
  res.redirect("/");
});

// app.post("/check", (req, res) => {
//   const checkItemId = req.body.checkbox;
//   let checker = "";
//   Item.findById(checkItemId, (err, item) => {
//     if (err) console.log(err);
//     else {
//       if (item.check == "off") {
//         Item.findByIdAndUpdate(checkItemId, {
//           check: "on"
//         }, (err) => {
//           if (err) console.log(err);
//           else console.log("Successfully checked");
//         });
//       } else {
//         Item.findByIdAndUpdate(checkItemId, {
//           check: "off"
//         }, (err) => {
//           if (err) console.log(err);
//           else console.log("Successfully unchecked");
//         });
//       }
//     }
//   });
//   res.redirect("/");
// });

app.post("/delete", (req, res) => {
  const deletedItemId = req.body.bin;
  Item.findByIdAndRemove(deletedItemId, (err) => {
    if (err) console.log(err);
    else console.log("Successfully deleted item from database.");
  });
  res.redirect("/");
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