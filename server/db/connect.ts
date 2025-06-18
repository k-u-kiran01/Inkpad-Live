import mongoose from 'mongoose'
import {db_url} from '../config/env'

const connToDb = async()=>{
    if(db_url){
        try{
        
        await mongoose.connect(db_url);
        console.log('db connected')
    }
    catch(error)
    {
        console.error('error connecting to db: ',error);
        process.exit(1)
    }}
    else console.log('db_url is missing');
    
}
export default connToDb