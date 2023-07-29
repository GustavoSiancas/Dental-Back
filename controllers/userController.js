const User = require("../models/userModel");

const bcrypt = require("bcrypt");
const jwt = require("../authorization/jwt");

const register = async(req, res) => {
    let userBody = req.body;

    if(!userBody.email || !userBody.password ){
        return res.status(400).json({
            "status": "error",
            "message": "Missing data"
        });
    }

    let userData = {
        email: userBody.email,
        password: userBody.password,
    }

    try {
        const userAlreadyExist = await User.find({ $or: [{email: userData.email.toLowerCase()}]});

        if (userAlreadyExist && userAlreadyExist.length >= 1){
            return res.status(200).json({
                "status": "success",
                "message": "The driver already exists"
            });
        }

        let pwd = await bcrypt.hash(userData.password, 10);
        userData.password = pwd;

        let user_to_save = new User(userData);
        try {
            const userStored = await user_to_save.save();
    
            if(!userStored){
                return res.status(500).json({
                    "status": "error",
                    "message": "Couldn't save user"
                });
            }

            return res.status(200).json({
                "status": "success",
                "message": "User registered",
                "user": userStored
            });

        } catch {
            return res.status(500).json({
                "status": "error",
                "message": "Error while saving user"
            });
        }
    } catch {
        return res.status(500).json({
            "status": "error",
            "message": "Error finding if user already exists"
        });
    }        
}

const login = (req, res) => {
    const body = req.body;

    if(!body.email || !body.password){
        return res.status(400).json({
            "status": "error",
            "message": "Missing data"
        });
    }

    User.findOne({email: body.email}).then( user =>{
        if(!user){
            return res.status(400).json({
                "status": "error",
                "message": "Driver doesn't exist"
            });
        }

        let pwd = bcrypt.compareSync(body.password, user.password);

        if(!pwd){
            return res.status(400).json({
                "status": "error",
                "message": "Passwords doesn't match"
            });
        }

        const token = jwt.createToken(user);
        
        const role = user.email.charAt(0) === 'c' ? "Clinica" : user.email.charAt(0) === 's' ? "Sede" : "Rol desconocido";

        return res.status(200).json({
            "status": "success",
            "message": "You have identified correctly",
            user: {
                id: user._id,
                email: user.email
            },
            token,
            role
        });

    }).catch( error => {
        return res.status(400).json({
            "status": "error",
            "message": "Error un authorization"
        });
    });
}

const profile = (req, res) => {
    User.findById(req.user.id).select({password: 0}).then(user => {
        if(!user){
            return res.status(404).json({
                "status": "error",
                "message": "User doesn't exist"
            });
        }

        return res.status(200).json({
            "status": "success",
            "user": user
        });
    }).catch( () => {
        return res.status(404).json({
            "status": "error",
            "message": "Error while getting object"
        });
    });
}

const userById = (req, res) => {
    User.findById(req.params.id).then(user => {
        if(!user){
            return res.status(404).json({
                "status": "error",
                "message": "User doesn't exist"
            });
        }

        return res.status(200).json({
            "status": "success",
            "user": user
        });
    }).catch( () => {
        return res.status(404).json({
            "status": "error",
            "message": "Error while searching user"
        });
    });
}

module.exports = {
    register,
    login,
    profile,
    userById
}