import mongoLoader from "./mongo.loader.js";
import expressLoader from "./express.loader.js";

const loaders = async (app) => {
    await mongoLoader();
    await expressLoader(app);
};

export default loaders;
