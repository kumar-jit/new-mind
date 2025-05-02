import { app } from "./app.js";
import { connectUsingMongoose } from "./src/connection/mongooseConfig.js";
import { setRootFolderId } from "./src/connection/rootFolderDetails.js";
// port configure
const PORT = process.env.PORT || 8000;

// start the server
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectUsingMongoose();
    await setRootFolderId();
});
