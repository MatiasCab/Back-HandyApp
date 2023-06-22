import { createProblem, updateProblem } from "../querys/createProblemsQuerys";
import { selectProblemById, selectProblems } from "../querys/getProblemsQuery";

//TODO ARREGLAR ERRORS RESPONSE

export const createProblems = async (req, res) => {
    const { name, image, description, lat, lng, skills } = req.body;
    const {userId} = req.user;
    try {

        if (!name || !image || !description || !lat || !lng || !skills) {
            res.status(400).send({ error: true, message: 'Fields cannot be null' });
            return;
        } 

        await createProblem(name, image, description, userId, lat, lng, skills);
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

        if (!name || !image || !description || !lat || !lng || !skills) {
            res.status(400).send({ error: true, message: 'Fields cannot be null' });
            return;
        } 

        await updateProblem(name, image, description, lat, lng, skills, problemsId, userId)
        res.status(200).send({ error: false, message: 'Problem updated!!' });

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: true, message: "Internal server error creating problems", name: 'ServerError' });
    }
};

export const getProblems = async (req, res) => {
    const { userId } = req.user
    try {

        const problems = await selectProblems(userId);
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



