import mongoose  from 'mongoose'

const mongouri="mongodb://razu009:razu008@31.97.181.120:27017/cashapp?replicaSet=rs0&authSource=cashapp"

const connectDB = () => {

    mongoose.connect(mongouri
    ).then((result) => {
        console.log('mongo connected');
    })
        .catch((err) => { console.log(err) });
}

export default connectDB




