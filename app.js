//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB")

const itemsSchema ={
  name: String
};

const Item = mongoose.model("item" , itemsSchema);

const task1 = new Item({
name: "Buy Food"
});

const task2 = new Item({
name: "Cook Food"
});

const task3 = new Item({
name: "Eat Food"
});

const defaultItems = [task1 , task2 , task3];

const listSchema = {
  name: String , 
  items: [itemsSchema]
};

const List = mongoose.model("list" , listSchema)

app.get("/", function(req, res) {

  Item.find({} , function(err , foundItems){


  if(foundItems.length ===0){

    Item.insertMany(defaultItems , function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Success");
      }
    });  
    res.redirect("/");
  }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
  });
});

app.get("/:customListName" , function(req , res){
 const costumListName =_.capitalize(req.params.customListName);

  List.findOne({name:costumListName} , function(err , foundList){
    if(!err){
      if(!foundList){
        // create new list
        const list = new List({
          name: costumListName,
          items: defaultItems
        });
        list.save();
        res.redirect('/' + costumListName);
      } else{
        //show existing list
        res.render("list" , {listTitle: foundList.name , newListItems: foundList.items})
      }
    }
  });
  
 


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name:listName} , function(err , foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

 
});

app.post("/delete" , function(req, res){
 const checkedItemId = req.body.checkbox;
 const listName = req.body.listName;

 if(listName === "Today"){
  Item.findByIdAndRemove(checkedItemId , function(err){
    if(!err){
      console.log("Success");
      res.redirect("/");
    }
  });
 } else{
   List.findOneAndUpdate({name: listName} , {$pull: {items: {_id: checkedItemId}}} , function(err , foundList){
     if(!err){
       res.redirect("/" + listName);
     }
   });
 }

 

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
