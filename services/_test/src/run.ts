import {createServer} from "./index";

(async function main() {
    await createServer().listen(3000);
})();
