import mongoose  from 'mongoose'


const mongouri = process.env.MONGODB_URI || "mongodb://mostak009:mostak00008@31.97.181.120:27017/mosapp?replicaSet=rs0&authSource=mosapp"

const connectDB = () => {

    mongoose.connect(mongouri
    ).then((result) => {
        console.log('mongo connected');
    })
        .catch((err) => { console.log(err) });
}

export default connectDB




