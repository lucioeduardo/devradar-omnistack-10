const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');

const { findConnections, sendMessage } = require('../websocket');

module.exports = {
    async index(request,response){
        const devs = await Dev.find();
        return response.json(devs);
    },


    async store(request, response) {
        const { github_username, techs, latitude, longitude } = request.body;

        let dev = await Dev.findOne({github_username});

        if(dev){    
            return response.json({
                "message":"Usuário já existente"
            })
        }

        const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);

        const { name = login, avatar_url, bio } = apiResponse.data;

        const techsArray = parseStringAsArray(techs);

        const location = {
            type: 'Point',
            coordinates: [longitude, latitude],
        }

        dev = await Dev.create({
            github_username,
            name,
            avatar_url,
            bio,
            techs: techsArray,
            location: location
        })

        const sendSocketMessageTo = findConnections(
            {latitude, longitude},
            techsArray
        );
            
        sendMessage(sendSocketMessageTo, 'newDev', dev);
       
        return response.json(
            dev
        )
    },

    async update(request, response){
        const {github_username} = request.params
        const {techs, latitude, longitude} = request.body;

        const techsArray = parseStringAsArray(techs);

        console.log(github_username,techsArray,latitude,longitude)

        const query = {github_username};

        const dev = await Dev.updateOne(query, {$set: {github_username,techs,latitude,longitude}});

        return response.json(dev);
    },

    async destroy(request, response){
        const {github_username} = request.params

        const dev = await Dev.deleteOne({github_username});

        return response.json(dev);
    }
};