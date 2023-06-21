import { acceptUserFriendship, createUserFriendship, deleteUserFriendship } from "../querys/friendsRequestQuerys";
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

export const sendFriendRequest = async (req, res) => {
    const { userId } = req.user
    const otherUserId = req.params.id;
    try {

        await createUserFriendship(otherUserId, userId);
        res.status(200).send({ error: false, message: 'Friendship request send!!' });

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: true, message: "Internal server error getting problems", name: 'ServerError' });
    }
};

export const acceptFriendRequest = async (req, res) => {
    const { userId } = req.user
    const otherUserId = req.params.id;
    try {

        await acceptUserFriendship(otherUserId, userId);
        res.status(200).send({ error: false, message: 'Friendship request accepted!!' });

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: true, message: "Internal server error getting problems", name: 'ServerError' });
    }
};

export const deleteFriendship = async (req, res) => {
    const { userId } = req.user
    const otherUserId = req.params.id;
    try {

        await deleteUserFriendship(otherUserId, userId);
        res.status(200).send({ error: false, message: 'Friendship deleted!!' });

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: true, message: "Internal server error getting problems", name: 'ServerError' });
    }
};
