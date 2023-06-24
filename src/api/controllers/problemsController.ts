import { generateProblemsOrder } from "../helpers/defineOrderHelper";
import { generateProblemsFilters } from "../helpers/generateFiltersHelper";
import { uploadBase64Image } from "../helpers/imagesHelper";
import { pagination } from "../helpers/utils";
import { createProblem, updateProblem } from "../querys/createProblemsQueries";
import { selectProblemById, selectProblems, selectUserProblem } from "../querys/getProblemsQueries";
import { getUserLocation } from "../querys/getUsersQueries";

//TODO ARREGLAR ERRORS RESPONSE
//TODO CONSULTAR EL TEMA DE LAS IMAGENES, SI LES PARECE BIEN QUE NO SE BORREN EN EL BUCKET O SI HAY QUE BORRARLAS-

export const createProblems = async (req, res) => {
    const { name, image, description, lat, lng, skills } = req.body;
    const {userId} = req.user;
    try {

        if (!name || !image || !description || !lat || !lng || !skills) {
            res.status(400).send({ error: true, message: 'Fields cannot be null' });
            return;
        } 

        const imageName = `problem_${Date.now()}.jpg`;
        await uploadBase64Image(image, imageName);

        await createProblem(name, imageName, description, userId, lat, lng, skills);
        res.status(200).send({ error: false, message: 'Problem created!!' });

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: true, message: "Internal server error creating problems", name: 'ServerError' });
    }
};

export const updateProblems = async (req, res) => {
    const { name, image, description, lat, lng, skills } = req.body;
    const problemsId = req.params.id;
    const {userId} = req.user;
    try {

        if (!name || !description || !lat || !lng || !skills) {
            res.status(400).send({ error: true, message: 'Fields cannot be null' });
            return;
        } 

        let imageName: any = undefined;
        if (image) {
            imageName = `problem_${Date.now()}.jpg`;
            await uploadBase64Image(image, imageName);
        }

        const updated = await updateProblem(name, description, lat, lng, skills, problemsId, userId, imageName);

        if(updated) {
            res.status(200).send({ error: false, message: 'Problem updated!!' });
        } else {
            res.status(404).send({ error: true, message: 'Problem not found!!' });
        }

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: true, message: "Internal server error creating problems", name: 'ServerError' });
    }
};

export const getProblems = async (req, res) => {
    const { userId } = req.user
    try {

        const filters = generateProblemsFilters(req.query, userId);
        const userLocation = await getUserLocation(userId);
        const order = generateProblemsOrder(req.query);
        const paginationInfo = pagination(req.query);

        const problems = await selectProblems(userId, filters, paginationInfo, userLocation, order);
        res.status(200).send({problems});

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: true, message: "Internal server error getting problems", name: 'ServerError' });
    }
};

export const getUserProblems = async (req, res) => {
    const { userId } = req.user
    const otherUserId = req.params.id;
    try {
        const filters = generateProblemsFilters(req.query, userId);
        const userLocation = await getUserLocation(userId);
        const order = generateProblemsOrder(req.query);
        const paginationInfo = pagination(req.query);

        const problems = await selectUserProblem(otherUserId, filters, paginationInfo, userLocation, order);
        res.status(200).send({problems});
    } catch (e) {
        console.log(e);
        res.status(500).send({ error: true, message: "Internal server error getting problems", name: 'ServerError' });
    }
};

export const getProblembyId = async (req, res) => {
    const problemId = req.params.id;
    const { userId } = req.user
    try {

        const userLocation = await getUserLocation(userId);
        const [result] = await selectProblemById(problemId, userId, userLocation);
        res.status(200).send({result});

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: true, message: "Internal server error getting problem", name: 'ServerError' });
    }
};



