import { initializeComments } from './modules/components/comment.js';
import { initializeSearch } from "./modules/components/search.js";
import { initializeBearsApi } from "./modules/api/bears.js";
import { renderBears } from "./modules/components/bears-list.js";

initializeSearch();
initializeComments();
initializeBearsApi().then(renderBears);
