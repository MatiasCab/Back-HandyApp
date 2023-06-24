import { uploadBase64Image } from "../helpers/imagesHelper";
import { updateUser } from "../querys/createUsersQuerys";
import { acceptUserFriendship, createUserFriendship, deleteUserFriendship } from "../querys/friendsRequestQuerys";
import { getAllUsers, selectUserById } from "../querys/getUsersQuerys";

//TODO ARREGLAR ERRORS RESPONSE

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
        res.status(500).send({ error: true, message: "Internal server error sending friend request", name: 'ServerError' });
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
        res.status(500).send({ error: true, message: "Internal server error accepting userfrienship", name: 'ServerError' });
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
        res.status(500).send({ error: true, message: "Internal server error deleting user friendship", name: 'ServerError' });
    }
};

//FIXME optional image
export const updateUserInfo = async (req, res) => {
    const { image, description, lat, lng, skills } = req.body;
    const { userId } = req.user;
    try {

        if (!description || !lat || !lng || !skills) {
            res.status(400).send({ error: true, message: 'Fields cannot be null' });
            return;
        } 

        let imageName: any = undefined;
        if (image) {
            imageName = `problem_${Date.now()}.jpg`;
            await uploadBase64Image(image, imageName);
        }

        await updateUser(description, lat, lng, skills, userId, imageName);
        res.status(200).send({ error: false, message: 'User updated!!' });

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: true, message: "Internal server error updating user", name: 'ServerError' });
    }
};
