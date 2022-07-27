const { search } = require("./app/controllers/Hoteis")

const express = require('express')
const app = express()
const porta = process.env.PORT || 3000

app.get("/hoteis", search)
app.listen(porta, () => {
    console.log("servidor ligado com sucesso!")
})