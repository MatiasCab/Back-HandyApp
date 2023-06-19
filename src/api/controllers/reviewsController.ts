import { insertReview, selectProblemReviews, selectUserReviews } from "../querys/manageReviewsQuerys";



export const createReview = async (req, res) => {
    const { description, score, problemId, solverUsername } = req.body
    const { userId } = req.user
    try {

        const users = await insertReview(description, score, problemId, userId, solverUsername);
        res.status(200).send({users});

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: true, message: "Internal server error creating review", name: 'ServerError' });
    }
};

export const getProblemReviews = async (req, res) => {
    const problemId = req.params.id;
    try {

        const [review] = await selectProblemReviews(problemId);
        res.status(200).send({review});

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: true, message: "Internal server error getting problems", name: 'ServerError' });
    }
};

export const getUserReviews = async (req, res) => {
    const userId = req.params.id;
    try {

        const reviews = await selectUserReviews(userId);
        res.status(200).send({reviews});

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: true, message: "Internal server error getting problems", name: 'ServerError' });
    }
};
