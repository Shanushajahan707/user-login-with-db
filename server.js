const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/UserAdminDb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("mongo connected");
    }).catch((error) => {
        console.log(error);
    })

const loginschema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email:{
        type:String,
        required:true
    },
    password: {
        type: String,
        required: true
    }
})

const collection = new mongoose.model("sample", loginschema)

module.exports = collection