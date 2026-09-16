import { initializeComments } from './components/comment.js';
import { initializeSearch } from "./components/search.js";
import { initializeBearsApi } from "./api/bears.js";
import { renderBears } from "./components/bears-list.js";

initializeSearch();
initializeComments();
initializeBearsApi().then(renderBears);
