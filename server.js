const express=require('express');
const fs=require('fs');
const cors = require('cors');
const app=express();
const port=3000;

app.use(cors());



app.get('/budget',(req,res)=>{
    fs.readFile("budget-data.json", "utf8", (err, budget) => {
        if (err) {
          console.log("File read failed:", err);
          return;
        }else{
            res.json(JSON.parse(budget));
        }
      });
});

app.listen(port,()=>{
    console.log(`API served at http://localhost:${port}`);
});