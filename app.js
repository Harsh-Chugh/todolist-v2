//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const itemSchema = {
  name: String
}

const Item = mongoose.model("Item", itemSchema);

const listSchema = {
  name: String, 
  items: [itemSchema]
}
const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});


const item2 = new Item({
  name: "Hit + to add a new item"
});


const item3 = new Item({
  name: "Check the checkbox to delete an item"
});

const defaultItems = [item1, item2, item3];



app.get("/", function(req, res) {

  // const items = [];
  async function getItems(){
  
    const items = await Item.find().exec();

    if(items.length === 0){

      Item.insertMany(defaultItems);

      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  }
  
  getItems();

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
  }
  else{

      async function getList(){

      const foundList = await List.findOne({name: listName}).exec();

      foundList.items.push(item);
      foundList.save();  

      }

      getList();

      res.redirect("/" + listName); 
  }



});

app.post("/delete", function(req, res){
  
    const itemID = req.body.checkbox;
    const listTitle = req.body.list;

    

    if(listTitle === "Today"){
       async function deleteItem(){
      
        await Item.findByIdAndRemove(itemID);
      }
  
      deleteItem();

      res.redirect("/");

    }
    else{

        async function deleteItem(){

            await List.findOneAndUpdate({name: listTitle}, {$pull: {items: {_id: itemID}}});

        }

        deleteItem();

        res.redirect("/" + listTitle);

        
    }

    


});

app.get("/:listTitle", function(req, res){

    const listTitle = _.capitalize(req.params.listTitle);

    async function getListItems(){

        const foundList = await List.findOne({name: listTitle}).exec();

        if(!foundList){

          const list = new List({
            name: listTitle,
            items: defaultItems
          });
          
          list.save();

          res.redirect("/" + listTitle);
        }
        else
        {
          
          res.render("list", {listTitle: listTitle, newListItems: foundList.items});

        }
    }
    
    getListItems();

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
