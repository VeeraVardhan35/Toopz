// import {db} from '../config/db.js';

export const connectDB = async() => {
    try {
        // const result = await db.execute('SELECT 1');
        console.log("Successfully Connected to Postgresql Database");
    }
    catch(error){
        console.log("Database connection error", error);
    }
}