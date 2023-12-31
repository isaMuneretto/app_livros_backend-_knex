//importando o framework express
const express = require("express");
//importando o framework express.Router
const router = express.Router();

//dados de conexão com o bd
const dbKnex = require("../data/db_config");


//método get ele retorna todos os autores do banco de dados
router.get("/", async (req, res) => {
    try {
        //para obter os livros pode-se utilizar .select().orderBy() ou apenas .orderBy()
        const autores = await dbKnex("autores").orderBy("id", "desc");
        res.status(200).json(autores); //retorna statusCode ok e os dados
    } catch (error) {
        res.status(400).json({ msg: error.message }); //retorna status de erro e msg
    }
});

router.get("/filtro/:palavra", async(req,res)=> {
    const palavra = req.params.palavra; // palavra ou titulo a pesquisar
    try{
            const autores = await dbKnex("autores")
            .where("nome","like", `%${palavra}%`)
            .orWhere("sobrenome","like",`%${palavra}%`);
            res.status(200).json(autores); //retorna statusCode ok e os dados
        }catch(error){
            res.status(400).json({msg:error.message}); //retorna status de erro e msg
        }
});

router.get("/dados/resumo",async (req,res) =>{
    try{
        const autores = await dbKnex("autores")
        .count({num: "id"})
        .avg({media: "idade"});
        const {num,media} = autores[0];
        res.status(200).json({num,media:Number(media.toFixed(2))});
    }catch(error){
        res.status(400).json({msg:error.message}); //retorna status de erro e msg
    }
})

//Exibir o gráfico com a soma dos preços agrupados por ano
router.get("/dados/grafico",async (req,res) =>{
    try{
        //obtém ano e soma do preço dos livros, Agrupados por ano
        const dadosGrafico = await dbKnex("autores").select("idade")
        .count({quantidade:"id"}).groupBy("idade");
        res.status(200).json(dadosGrafico);
    }catch(error){
        res.status(400).json({msg:error.message}); //retorna status de erro e msg
    }
})

//método post é usado para inclusão
router.post("/", async (req, res) => {
    //faz a desestruturação dos dados recebidos no corpo da requisição
    
    const { nome, sobrenome, idade, data_nascimento, sexo, telefone } = req.body;
    console.log(nome, sobrenome, idade, data_nascimento, sexo, telefone)

    //se algum dos campos não foi passado, irá enviar uma mensagem de erro ao retornar
    if (!nome || !sobrenome || !idade || !data_nascimento || !sexo || !telefone) {
        res.status(400).json({ msg: "Enviar nome, sobrenome, idade, data_nascimento, sexo e telefone do autor." });
        return;
    }
    //caso ocorra algum erro na inclusão, o programa irá capturar(catch) o erro
    try {
        //insert, faz a inserção na tabela autores (e retorna o id do registro inserido)
        const novo = await dbKnex("autores").insert({ nome, sobrenome, idade, data_nascimento, sexo, telefone });
        res.status(201).json({ id: novo[0] }); //statuscode indica Create
    } catch (error) {
        res.status(400).json({ msg: error.message }); //retorna status de erro e msg
    }
});

//método put é usado para alteração. id indica o registro a ser alterado
router.put("/:id", async (req, res) => {
    const id = req.params.id; //
    const { telefone } = req.body; //campo a ser alterado
    try {
        //altera o campo data_nascimento, no registro cujo id coincidir com o parametro passado
        await dbKnex("autores").update({ telefone }).where({ id });
        res.status(200).json(); //statusCode indica ok
    } catch (error) {
        res.status(400).json({ msg: error.message }); //retorna status de erro e msg
    }
});

//método delete é usado para exclusão
router.delete("/:id", async (req, res) => {
    const { id } = req.params; //id do registro a ser excluído
    try {
        await dbKnex("autores").del().where({ id });
        res.status(200).json(); //statusCode indica Ok
    } catch (error) {
        res.status(400).json({ msg: error.message }); //retorna status de erro e msg
    }
});

module.exports = router;

