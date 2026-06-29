import mongoose  from 'mongoose'


const connectDB = () => {
    const mongouri = process.env.MONGODB_URI 

    mongoose.connect(mongouri
    ).then((result) => {
        console.log('mongo connected');
    })
        .catch((err) => { console.log(err) });
}

export default connectDB




