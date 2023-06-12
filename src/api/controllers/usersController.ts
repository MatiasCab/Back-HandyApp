import { getAllUsers, selectUserById } from "../querys/getUsersQuerys";



export const getUsers = async (req, res) => {
    const { userId } = req.user
    try {

        const users = await getAllUsers(userId);
        res.status(200).send({users});

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: true, message: "Internal server error getting problems", name: 'ServerError' });
    }
};

export const getUserById = async (req, res) => {
    const { userId } = req.user
    const otherUserId = req.params.id;
    try {

        const [user] = await selectUserById(otherUserId, userId);
        res.status(200).send({user});

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: true, message: "Internal server error getting problems", name: 'ServerError' });
    }
};