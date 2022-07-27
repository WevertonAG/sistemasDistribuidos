const moment = require("moment")
const Soap = require("soap")
const Url = "http://DESKTOP-0FDE8A1:8088/mockParceiroAcomodacaoSOAP?WSDL"
let resultadoArray = []


const searchHotelCity = (nomeCidade, callback) => {
    Soap.createClient(Url, (err, client) => {
        client.Buscar(function (err, result) {
            callback(result.hotel.filter(p => p.endComercial.cidade === String(nomeCidade)))
        })
    })
}
function result(header, endResult) {
    if (header === "application/json") {
        typeJSON(endResult)
        return resultadoArray
    } else if (header === "application/xml") {
        return typeXML(endResult)
    } else {
        return mensagemErro.header
    }
}

function typeJSON(jsonData) {
    resultadoArray = []
    for (let i = 0; i < jsonData.length; i++) {
        resultadoArray.push({
            "hoteis": {
                "hotel": {
                    "name": jsonData[i].nome,
                    "endereco": jsonData[i].endComercial.logradouro
                }
            }
        })
    }
}

function typeXML(dataXML) {
    let xml = `<hotels>`

    for (let i = 0; i < dataXML.length; i++) {
        xml += `
        <hotel> 
        <name>${dataXML[i].nome}</name>
        <endereco>${dataXML[i].endComercial.logradouro}</endereco>
        </hotel>`
    }

    xml += `</hotels>`
    return xml
}

function validator(res, cidade, dataInicial, dataFinal, headers) {
    if (!cidade) {
        badRequest(res, mensagemErro.cidade)
        return true
    }
    if (!dataInicial) {
        badRequest(res, mensagemErro.dataInicial)
        return true
    }

    if (!dataFinal) {
        badRequest(res, mensagemErro.dataFinal)
        return true
    }

    if (headers === "*/*") {
        badRequest(res, mensagemErro.header)
        return true
    }

}
function validateDate(res, dataInicial, dataFinal) {
    const dataAtual = moment().format('L').split("/").reverse().join("-"),
        dataInicio = moment(dataInicial).format('L').split("/").reverse().join("-"),
        dataFinalizada = moment(dataFinal).format('L').split("/").reverse().join("-")

    if (dataInicio < dataAtual) {
        res.status(400).send("Sua data inicial é menor que a data atual!")
        return true
    }

    if (dataFinalizada < dataAtual) {
        res.status(400).send("Sua data final é menor que a data atual!")
        return true
    }

    if (dataInicio > dataFinalizada) {
        res.status(400).send("Sua data inicial é maior que a data final!")
        return true
    }
}

function search(req, res) {
    const { query, headers } = req
    const { cidade, dataInicial, dataFinal } = query

    let validacaoGeral = validator(res, cidade, dataInicial, dataFinal, headers.accept)
    if (validacaoGeral) return validacaoGeral

    let conferirDatas = validateDate(res, dataInicial, dataFinal)
    if (conferirDatas) return conferirDatas

    searchHotelCity(cidade, resultado => {
        if (resultado.length === 0) return badRequest(res, `${cidade}` + mensagemErro.cidadeNaoEncontrada)
        res.status(200).send(result(headers.accept, resultado))
    })
}
module.exports = {
    search
}
