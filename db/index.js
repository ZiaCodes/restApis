const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/review_app',{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
    .then(()=>{
        console.log("😍 Db Connected Successfully.");
    })
    .catch((err) => {
        console.log("😓 Db failed to Connect", err);
    })