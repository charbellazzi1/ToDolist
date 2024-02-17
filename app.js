import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";

//mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});
mongoose.connect("mongodb+srv://charbelazzy:justme2003@cluster0.ndgorna.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser: true});
const app = express();
const itemSchema = {
  name: String
};
const Item= mongoose.model("Item", itemSchema);
 const item1 = new Item({
    name: "Welcome to your todolist!"
  });
  const item2 = new Item({
    name: "Hit the + button to add a new item."
  });
  const item3 = new Item({
    name: "<-- Hit this to delete an item."
  });
  const defaultItems = [item1, item2, item3];
  const listSchema = {
    name: String,
    items: [itemSchema]
  };
  const List = mongoose.model("List", listSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res) {

  Item.find({}).then(function(foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems).then(function(){
     console.log("Successfully saved default items to DB.");
   }).catch(function(err){
     console.log(err);
   })
   res.redirect("/");
  }
   else{
    res.render("list", {listTitle: "Today", newListItems:foundItems});
  }});

 

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item= new Item({
    name: itemName
  });
  if(listName === "Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name:listName}).then((foundList)=>{
    foundList.items.push(item);
    foundList.save();
    res.redirect('/'+listName);
  });

}
});
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName= req.body.listName;
  console.log(checkedItemId);
  if(listName === "Today"){
  Item.findByIdAndDelete(checkedItemId).then(function(){
    console.log("Successfully deleted checked item.");
    res.redirect("/");
  }
  ).catch(function(err){
    console.log(err);
  }
  );
}else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function(foundList){
    console.log('Successfully deleted checked item from ${listName}.');
    res.redirect("/"+listName);
}
).catch(function(err){
  console.log(err);
});
}
});
app.get("/:customListName", function(req, res){
  const customListName =_.capitalize( req.params.customListName);
  console.log(customListName);
  List.findOne({name: customListName}).then(function(foundList){
    if(foundList === null){
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save().then(function(){
        res.redirect("/"+customListName);
      });
    }
    else{
      res.render("list", {listTitle: foundList.name, newListItems:foundList.items});
    }
  });
});
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
