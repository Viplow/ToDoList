//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _=require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-viplow:test@cluster0.z0gsu.mongodb.net/todolistDB",{useNewUrlParser :true});
const itemSchema={
  name :String
}
const Item=mongoose.model("Item",itemSchema);
const item1=new Item({
  name:"Welcome To Your To Do List"
});
const item2=new Item({
  name:"Hit the + button to add item"
});
const item3=new Item({
  name:"<--- Hit this to delete an item"
});
const defaultItems=[item1,item2,item3];
const listSchema={
  name:String,
  items: [itemSchema]
};
const List=mongoose.model("List",listSchema);
app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    if(foundItems.length==0)
    {

      Item.insertMany(defaultItems,function(err){

      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });



});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname=req.body.list;
  const item=new Item({
    name:itemName
  });
  if(listname==="Today")
  {
  item.save();
  res.redirect("/");
}
else{
  List.findOne({name: listname},function(err,foundlist){
    foundlist.items.push(item);
    foundlist.save();
    res.redirect("/"+listname);
  });
}
});
app.post("/delete",function(req,res){
  const checkedItemId= req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today")
  {
    Item.findByIdAndRemove(checkedItemId,function(err){

    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundlist){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

app.get("/:customListName",function(req,res){
  const customListName =_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!foundList)
    {
      const list= new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customListName);

    }
    else
    {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});

    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started");
});
