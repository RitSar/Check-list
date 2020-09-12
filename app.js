const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

var today = new Date();
var items = ["Buy food","Cook food","Eat food"];
var options = {
  weekday: "long",
  day: "numeric",
  month: "long"
}
var date = today.toLocaleDateString("en-US", options);

app.get("/",(req,res)=>{
  res.render("list", {
    date: date,
    newListItems: items
  });
});

app.post("/",function(req,res){
  item = req.body.newItem;
  items.push(item);
  res.redirect("/");
});

app.listen(3000,()=>{
  console.log("Server started on port 3000");
});
