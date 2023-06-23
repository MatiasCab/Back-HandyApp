import { generateFilters } from "../helpers/generateFiltersHelper";
import { uploadBase64Image } from "../helpers/imagesHelper";
import { createProblem, updateProblem } from "../querys/createProblemsQuerys";
import { selectProblemById, selectProblems, selectUserProblem } from "../querys/getProblemsQuery";

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

        await updateProblem(name, imageName, description, lat, lng, skills, problemsId, userId)
        res.status(200).send({ error: false, message: 'Problem updated!!' });

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: true, message: "Internal server error creating problems", name: 'ServerError' });
    }
};

export const getProblems = async (req, res) => {
    const { userId } = req.user
    try {

        const filters = generateFilters(req.query, userId);
        const problems = await selectProblems(userId, filters);
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
        const filters = generateFilters(req.query, userId);
        const problems = await selectUserProblem(otherUserId, filters);
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

        const [result] = await selectProblemById(problemId, userId);
        res.status(200).send({result});

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: true, message: "Internal server error getting problem", name: 'ServerError' });
    }
};



