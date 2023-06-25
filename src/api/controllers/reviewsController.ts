import { injectionsController } from "../helpers/utils";
import { insertReview, selectProblemReviews, selectUserReviews } from "../querys/manageReviewsQueries";

//TODO ARREGLAR ERRORS RESPONSE


export const createReview = async (req, res) => {
    let { description, score, problemId, solverUsername } = req.body
    const { userId } = req.user
    try {

        [description, score, problemId, solverUsername] = injectionsController([description, score, problemId, solverUsername]);

        const review = await insertReview(description, score, problemId, userId, solverUsername);
        res.status(200).send({review});

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

        const reviewsInfo = await selectUserReviews(userId);
        res.status(200).send({reviewsInfo});

    } catch (e) {
        console.log(e);
        res.status(500).send({ error: true, message: "Internal server error getting problems", name: 'ServerError' });
    }
};
