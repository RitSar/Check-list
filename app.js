const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
// mongodb+srv://admin-rittik:rittik2000@cluster0.zn9dt.mongodb.net/todolistDB
// mongodb://localhost:27017/todolistDB
mongoose.connect("mongodb+srv://admin-rittik:rittik2000@cluster0.zn9dt.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
const itemsSchema = {
  name: String,
  check: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your check list.",
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

const listSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model("List", listSchema);

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
    List.find({}, (err, found) => {
      if (found.length === 0) {
        const list = new List({
          name: "Initializer"
        });
        list.save();
      }
    });
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
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
    check: "off"
  });
  if (listName === date) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/check", (req, res) => {
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === date) {
    Item.findById(checkItemId, (err, item) => {
      if (err) console.log(err);
      else {
        if (item.check == "off") {
          Item.findByIdAndUpdate({
            _id: checkItemId
          }, {
            check: "on"
          }, (err) => {
            if (err) console.log(err);
            else console.log("Successfully checked");
          });
        } else if (item.check == "on") {
          Item.findByIdAndUpdate({
            _id: checkItemId
          }, {
            check: "off"
          }, (err) => {
            if (err) console.log(err);
            else console.log("Successfully unchecked");
          });
        }
      }
    });
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, (err, all) => {
      all.items.forEach((item, i) => {
        if (item.id == checkItemId) {
          if (item.check == "off") {
            List.findOneAndUpdate({
              'items._id': checkItemId
            }, {
              '$set': {
                'items.$.check': "on"
              }
            }, (err) => {
              if (err) console.log(err);
            });
          } else if (item.check == "on") {
            List.findOneAndUpdate({
              'items._id': checkItemId
            }, {
              '$set': {
                'items.$.check': "off"
              }
            }, (err) => {
              if (err) console.log(err);
            });
          }
        }
      });

    });
    res.redirect("/" + listName);
  }

});

app.post("/delete", (req, res) => {
  const deletedItemId = req.body.bin;
  const listName = req.body.listName;
  if (listName === date) {
    Item.findByIdAndRemove(deletedItemId, (err) => {
      if (err) console.log(err);
      else console.log("Successfully deleted item from database.");
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: deletedItemId
        }
      }
    }, (err, foundList) => {
      if (!err) res.redirect("/" + listName);
    })
  }

});

app.get("/favicon.ico", (req, res) => {
  return 1;
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: [item1, item2, item3]
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });

});

app.post("/work", (req, res) => {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
})

let port = process.env.PORT;
if (port == null || port == "") port = 3000;
app.listen(port, () => {
  console.log("Server has started successfully.");
});