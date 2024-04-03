const dbConfig = require('./configDb.cjs')
const { Pool, Client } = require('pg')

// creamos un nuevo cliente o Pool que nos permita establecer connexion con nuestra base de datos
const connection = new Pool(dbConfig)


// verificamos el estado de la connexion 
connection.connect((err,conn)=>{
     if(err){
        console.log("ha ocurrido un error al momento de conectar con la base de datos")
        console.log(err)
     }else{
        console.log('La connexion con la base de datos a sido exitosa')
      //   console.log(conn)
     }
})


 
module.exports = connection